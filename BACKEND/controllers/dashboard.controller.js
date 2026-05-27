const supabase = require('../config/supabase');

const obtenerEstadisticas = async (req, res) => {
    try {
        // 1. Clientes totales
        const { count: clientes_activos } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true });

        // 2. Plata en la calle (suma de todas las cuotas pendientes)
        const { data: cuotasPendientesData } = await supabase
            .from('cuotas')
            .select('monto_cuota')
            .eq('estado', 'Pendiente');
        
        const plata_en_la_calle = cuotasPendientesData 
            ? cuotasPendientesData.reduce((acc, cuota) => acc + parseFloat(cuota.monto_cuota), 0) 
            : 0;

        // 3. 🚨 ARREGLO: Filtramos los morosos en Javascript (Hora local)
        const { data: todasPendientes, error: errMorosos } = await supabase
            .from('cuotas')
            .select(`
                id,
                monto_cuota,
                fecha_vencimiento,
                numero_cuota,
                prestamos ( clientes ( nombre, apellido, telefono ) )
            `)
            .eq('estado', 'Pendiente');

        // Seteamos "hoy" a las 00:00 exactas de tu país
        const hoyDate = new Date();
        hoyDate.setHours(0, 0, 0, 0); 

        // Filtramos solo las que vencieron ayer o antes
        const morososData = (todasPendientes || []).filter(cuota => {
            const fechaVenc = new Date(cuota.fecha_vencimiento + 'T00:00:00'); // Forzamos 00:00 para no tener desfasaje
            return fechaVenc < hoyDate;
        });

        // Ordenamos para que los más deudores (los de fechas más viejas) salgan arriba de todo
        morososData.sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));

        const cuotas_vencidas = morososData.length;

        res.status(200).json({
            éxito: true,
            stats: {
                plata_en_la_calle,
                clientes_activos: clientes_activos || 0,
                cuotas_vencidas
            },
            morosos: morososData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ éxito: false, error: 'Error al cargar dashboard' });
    }
};

module.exports = { obtenerEstadisticas };