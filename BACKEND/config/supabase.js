const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Traemos las variables del .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Inicializamos el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;