const cron = require('node-cron');
const supabase = require('../config/supabase');

// Esta función busca a los morosos y les suma el recargo
const procesarPunitorios = async () => {
    console.log('⏳ Iniciando revisión de cuotas vencidas...');
    
    try {
        // 1. Buscamos la fecha de hoy
        const hoy = new Date().toISOString().split('T')[0];

        // 2. Buscamos las cuotas vencidas (fecha_vencimiento menor a hoy)
        // que NO estén pagadas totalmente. También traemos los datos del préstamo asociado para saber el porcentaje.
        const { data: cuotasVencidas, error: errorCuotas } = await supabase
            .from('cuotas')
            .select(`
                *,
                prestamos ( porcentaje_punitorio )
            `)
            .lt('fecha_vencimiento', hoy)
            .neq('estado', 'Pagada');

        if (errorCuotas) throw errorCuotas;

        if (!cuotasVencidas || cuotasVencidas.length === 0) {
            console.log('✅ Ningún cliente atrasado hoy.');
            return;
        }

        // 3. Recorremos cada cuota vencida y le aplicamos el recargo
        for (const cuota of cuotasVencidas) {
            const porcentaje = parseFloat(cuota.prestamos.porcentaje_punitorio);
            
            // Si el préstamo no tiene punitorios (es 0), lo saltamos
            if (!porcentaje || porcentaje <= 0) continue;

            // Calculamos el recargo (ej: 10% sobre el monto de la cuota)
            const recargo = parseFloat(cuota.monto_cuota) * (porcentaje / 100);
            const nuevo_monto_cuota = parseFloat(cuota.monto_cuota) + recargo;

            // Actualizamos la cuota en la base de datos
            await supabase
                .from('cuotas')
                .update({ 
                    monto_cuota: nuevo_monto_cuota,
                    estado: 'Vencida' // Le cambiamos el estado para que en el frontend aparezca en rojo
                })
                .eq('id', cuota.id);
            
            console.log(`⚠️ Recargo aplicado a la cuota ID: ${cuota.id}`);
        }

        console.log('✅ Revisión de punitorios finalizada.');

    } catch (error) {
        console.error('❌ Error ejecutando el Cron Job:', error.message);
    }
};

// Programamos la tarea para que corra todos los días a las 00:01 AM
const iniciarCronJobs = () => {
    // El formato '1 0 * * *' significa: minuto 1, hora 0 (medianoche), todos los días
    cron.schedule('1 0 * * *', procesarPunitorios, {
        scheduled: true,
        timezone: "America/Argentina/Buenos_Aires" // Importante para que no corra con la hora de otro país
    });
    console.log('⏰ Cron Jobs activados. Revisión de morosos programada para las 00:01hs.');
};

module.exports = { iniciarCronJobs };