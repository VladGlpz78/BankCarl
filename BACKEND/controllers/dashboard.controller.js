const supabase = require('../config/supabase');

const obtenerEstadisticas = async (req, res) => {
    try {
        const hoy = new Date().toISOString().split('T')[0];

        // 1. Clientes totales
        const { count: clientes_activos } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true });

        // 2. Plata en la calle (suma de todas las cuotas pendientes)
        const { data: cuotasPendientes } = await supabase
            .from('cuotas')
            .select('monto_cuota')
            .eq('estado', 'Pendiente');
        
        const plata_en_la_calle = cuotasPendientes 
            ? cuotasPendientes.reduce((acc, cuota) => acc + parseFloat(cuota.monto_cuota), 0) 
            : 0;

        // 3. 🚨 NUEVO: Traer detalles de morosos
        const { data: morososData, error: errMorosos } = await supabase
            .from('cuotas')
            .select(`
                id,
                monto_cuota,
                fecha_vencimiento,
                numero_cuota,
                prestamos ( clientes ( nombre, apellido, telefono ) )
            `)
            .eq('estado', 'Pendiente')
            .lt('fecha_vencimiento', hoy) // Solo las que vencieron antes de hoy
            .order('fecha_vencimiento', { ascending: true });

        const cuotas_vencidas = morososData ? morososData.length : 0;

        res.status(200).json({
            éxito: true,
            stats: {
                plata_en_la_calle,
                clientes_activos: clientes_activos || 0,
                cuotas_vencidas
            },
            morosos: morososData || [] // 👈 Mandamos la lista al frontend
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ éxito: false, error: 'Error al cargar dashboard' });
    }
};

module.exports = { obtenerEstadisticas };