const supabase = require('../config/supabase');

const crearPrestamo = async (req, res) => {
    try {
        // 1. Recibimos los datos del frontend (estos nombres coinciden exacto con tu Prestamos.jsx)
        const { cliente_id, monto, tasa_interes, cuotas, frecuencia, fecha_inicio } = req.body;

       // --- 🛡️ REGLA DE NEGOCIO: CONTROL DE RIESGO ---
        // Vamos a la tabla de préstamos y buscamos si este cliente tiene uno "Activo"
        const { data: prestamosActivos, error: errorBusqueda } = await supabase
            .from('prestamos')
            .select('id')
            .eq('cliente_id', cliente_id)
            .eq('estado', 'Activo'); 

        if (errorBusqueda) {
            console.error(errorBusqueda); // Esto nos avisa en la consola si hay un error real
            return res.status(500).json({ éxito: false, error: 'Error al verificar el historial del cliente.' });
        }

        // Si la lista de préstamos activos tiene al menos 1 elemento, lo rebotamos
        if (prestamosActivos && prestamosActivos.length > 0) {
            return res.status(400).json({ 
                éxito: false, 
                error: 'Operación denegada: El cliente todavía tiene un préstamo activo. Debe cancelarlo en su totalidad antes de solicitar uno nuevo.' 
            });
        }
        // --- FIN DE LA REGLA DE NEGOCIO ---
        

        // Aseguramos que los valores sean números para la matemática (buenas prácticas en JS)
        const monto_num = parseFloat(monto);
        const tasa_num = parseFloat(tasa_interes);
        const cuotas_num = parseInt(cuotas);

       // 2. Cálculos matemáticos limpios (Lógica de redondeo para evitar monedas)
        const interes_teorico = monto_num * (tasa_num / 100);
        const monto_total_teorico = monto_num + interes_teorico;
        
        // Redondeamos la cuota hacia arriba a los $100 pesos más cercanos
        const monto_por_cuota = Math.ceil((monto_total_teorico / cuotas_num) / 100) * 100;
        
        // Como redondeamos la cuota, el monto total real aumenta unos pesitos a nuestro favor
        const monto_total = monto_por_cuota * cuotas_num;
        // 3. Insertamos el préstamo mapeando a los nombres de tus columnas en la BD
        const { data: prestamoData, error: prestamoError } = await supabase
            .from('prestamos')
            .insert([{
                cliente_id: cliente_id,
                monto_capital: monto_num,
                tasa_interes: tasa_num,
                monto_total: monto_total,
                frecuencia_pago: frecuencia,
                porcentaje_punitorio: 5, // Asignamos 5% por defecto ya que no viene del front
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

        // 5. Insertamos las cuotas
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

module.exports = { crearPrestamo, eliminarPrestamo };