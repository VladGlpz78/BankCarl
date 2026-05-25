const supabase = require('../config/supabase');

// --- FUNCIÓN 1: TRAER CUOTAS PENDIENTES DEL CLIENTE ---
const obtenerCuotasPendientes = async (req, res) => {
    try {
        const { cliente_id } = req.params;

        // 1. Buscamos préstamos que estén ACTIVOS
        const { data: prestamos, error: errPrestamos } = await supabase
            .from('prestamos')
            .select('id')
            .eq('cliente_id', cliente_id)
            .eq('estado', 'Activo');

        if (errPrestamos) return res.status(400).json({ éxito: false, error: errPrestamos.message });

        const prestamosIds = prestamos.map(p => p.id);

        if (prestamosIds.length === 0) {
            return res.status(200).json({ éxito: true, cuotas: [] });
        }

        // 2. Buscamos las cuotas pendientes
        const { data: cuotas, error: errCuotas } = await supabase
            .from('cuotas')
            .select('*')
            .in('prestamo_id', prestamosIds)
            .eq('estado', 'Pendiente')
            .order('fecha_vencimiento', { ascending: true });

        if (errCuotas) return res.status(400).json({ éxito: false, error: errCuotas.message });

        res.status(200).json({ éxito: true, cuotas });
    } catch (error) {
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

// --- FUNCIÓN 2: REGISTRAR UN PAGO ---
const registrarPago = async (req, res) => {
    try {
        // 👇 Sumamos las observaciones acá
        const { cuota_id, prestamo_id, monto_pagado, observaciones } = req.body;

        // 1. Cambiamos el estado de la cuota a 'Pagada'
        const { error: errorCuota } = await supabase
            .from('cuotas')
            .update({ estado: 'Pagada' })
            .eq('id', cuota_id);

        if (errorCuota) return res.status(400).json({ éxito: false, error: errorCuota.message });

        // 2. Guardamos el comprobante del pago en la tabla 'pagos' con sus notas
        const fecha_pago = new Date().toISOString(); 
        const { error: errorPago } = await supabase
            .from('pagos')
            .insert([{ prestamo_id, cuota_id, monto_pagado, observaciones, fecha_pago }]);

        if (errorPago) return res.status(400).json({ éxito: false, error: errorPago.message });

        // 3. 🛡️ NUEVO: VERIFICAR SI EL PRÉSTAMO SE TERMINÓ DE PAGAR
        const { data: cuotasRestantes, error: errRestantes } = await supabase
            .from('cuotas')
            .select('id')
            .eq('prestamo_id', prestamo_id)
            .eq('estado', 'Pendiente');

        // Si la lista de pendientes viene vacía, significa que ya pagó todo y cerramos el préstamo
        if (!errRestantes && cuotasRestantes.length === 0) {
            await supabase
                .from('prestamos')
                .update({ estado: 'Finalizado' })
                .eq('id', prestamo_id);
        }

        res.status(201).json({ éxito: true, mensaje: 'Pago registrado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

// --- FUNCIÓN 3: HISTORIAL DE CAJA PARA EL FRONTEND ---
const obtenerHistorialCaja = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('pagos')
            .select(`
                id,
                monto_pagado,
                fecha_pago,
                observaciones,
                cuota_id,
                prestamos ( cliente_id, clientes ( id, nombre, apellido, calificacion, dni ) )
            `)
            .order('fecha_pago', { ascending: false });

        if (error) {
            console.error(error);
            return res.status(500).json({ éxito: false, error: 'Error al cargar la caja' });
        }

        res.status(200).json({ éxito: true, historial: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

// Exportamos las tres funciones
module.exports = { obtenerCuotasPendientes, registrarPago, obtenerHistorialCaja };