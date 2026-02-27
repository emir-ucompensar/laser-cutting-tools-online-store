import { Session, User } from '@supabase/supabase-js';

/** Resultado uniforme que devuelven todos los métodos de AuthService */
export interface AuthResult {
  data: { user?: User | null; session?: Session | null } | null;
  error: string | null;
}
