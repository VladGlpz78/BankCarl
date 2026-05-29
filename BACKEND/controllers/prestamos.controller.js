const supabase = require('../config/supabase');

const crearNuevoPrestamo = async (req, res) => {
    try {
        const { cliente_id, monto, tasa_interes, cuotas, frecuencia, fecha_inicio } = req.body;

        const { data: prestamosActivos, error: errorBusqueda } = await supabase
            .from('prestamos')
            .select('id')
            .eq('cliente_id', cliente_id)
            .eq('estado', 'Activo'); 

        if (errorBusqueda) {
            console.error(errorBusqueda);
            return res.status(500).json({ éxito: false, error: 'Error al verificar el historial.' });
        }

        if (prestamosActivos && prestamosActivos.length > 0) {
            return res.status(400).json({ 
                éxito: false, 
                error: 'Operación denegada: El cliente todavía tiene un préstamo activo. Debe cancelarlo en su totalidad antes de solicitar uno nuevo.' 
            });
        }
        
        const monto_num = parseFloat(monto);
        const tasa_num = parseFloat(tasa_interes);
        const cuotas_num = parseInt(cuotas);

        const interes_teorico = monto_num * (tasa_num / 100);
        const monto_total_teorico = monto_num + interes_teorico;
        
        const monto_por_cuota = Math.ceil((monto_total_teorico / cuotas_num) / 100) * 100;
        const monto_total = monto_por_cuota * cuotas_num;

        let fechaCalculada = new Date(fecha_inicio);
        fechaCalculada.setMinutes(fechaCalculada.getMinutes() + fechaCalculada.getTimezoneOffset()); // Ajuste de zona horaria

        if (frecuencia === 'Semanal') {
            fechaCalculada.setDate(fechaCalculada.getDate() + (7 * cuotas_num));
        } else if (frecuencia === 'Mensual') {
            fechaCalculada.setMonth(fechaCalculada.getMonth() + cuotas_num);
        } else if (frecuencia === 'Diario') {
            fechaCalculada.setDate(fechaCalculada.getDate() + cuotas_num);
        }

        const fecha_fin_formateada = fechaCalculada.toISOString().split('T')[0];

        const { data: prestamoData, error: prestamoError } = await supabase
            .from('prestamos')
            .insert([{
                cliente_id: cliente_id,
                monto_capital: monto_num,
                tasa_interes: tasa_num,
                monto_total: monto_total,
                frecuencia_pago: frecuencia,
                porcentaje_punitorio: 5, 
                fecha_inicio: fecha_inicio,
                fecha_fin: fecha_fin_formateada, 
                estado: 'Activo'
            }])
            .select();

        if (prestamoError) return res.status(400).json({ éxito: false, error: prestamoError.message });

        const prestamoId = prestamoData[0].id;

        // 4. Generamos las Cuotas
        let cuotasArray = [];
        let fechaVencimiento = new Date(fecha_inicio);
        fechaVencimiento.setMinutes(fechaVencimiento.getMinutes() + fechaVencimiento.getTimezoneOffset());

        for (let i = 1; i <= cuotas_num; i++) {
            if (frecuencia === 'Semanal') {
                fechaVencimiento.setDate(fechaVencimiento.getDate() + 7);
            } else if (frecuencia === 'Mensual') {
                fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
            } else if (frecuencia === 'Diario') {
                fechaVencimiento.setDate(fechaVencimiento.getDate() + 1);
            }

            cuotasArray.push({
                prestamo_id: prestamoId,
                numero_cuota: i,
                monto_cuota: monto_por_cuota,
                fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
                estado: 'Pendiente'
            });
        }

        const { error: cuotasError } = await supabase
            .from('cuotas')
            .insert(cuotasArray);

        if (cuotasError) return res.status(400).json({ éxito: false, error: cuotasError.message });

        res.status(201).json({
            éxito: true,
            mensaje: 'Préstamo y cuotas generados con éxito',
            prestamo: prestamoData[0],
            cuotas_generadas: cuotasArray.length
        });

    } catch (error) {
        console.error("Error en crearPrestamo:", error);
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

const eliminarPrestamo = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('prestamos')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ éxito: false, error: error.message });
        }

        res.status(200).json({ éxito: true, mensaje: 'Préstamo e historial eliminados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

module.exports = { crearNuevoPrestamo, eliminarPrestamo };