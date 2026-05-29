import { createClient } from '@supabase/supabase-js';

// Reemplazá estos textos con los datos reales de tu proyecto de Supabase
const supabaseUrl = 'https://awxplidauwrarjccbjyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eHBsaWRhdXdyYXJqY2Nianl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjIxNTIsImV4cCI6MjA5NDkzODE1Mn0.IhiA3VWAlh_TsfjN9Jt66qYCPymNgJeN4OGDcg6XspQ';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;