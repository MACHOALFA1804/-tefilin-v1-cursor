import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://oghibmokjwoeyywkgpcc.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9naGlibW9randvZXl5d2tncGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjU0NTUsImV4cCI6MjA3MTEwMTQ1NX0.gmDD_yT96LplAH2BSbxwsy8gnVghREvvJ4m1KkB983s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface VisitanteRow {
  id?: string;
  nome?: string;
  telefone?: string;
  tipo?: string;
  status?: string;
  created_at?: string;
}



