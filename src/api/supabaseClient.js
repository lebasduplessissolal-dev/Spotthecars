import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lezjltahghymygzqamqt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlempsdGFoZ2h5bXlnenFhbXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTk4MTQsImV4cCI6MjA4OTMzNTgxNH0.VpGnvo8JFxxfLD6lCNXoX9dMrr9Zhitd156pF6v2I8I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
