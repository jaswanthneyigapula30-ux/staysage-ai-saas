import { checkSupabaseConnection, supabase, Profile } from './db';

// Pre-seeded demo user accounts
export const DEMO_USERS: Record<string, { email: string; name: string; role: Profile['role']; password: string; avatarUrl: string }> = {
  'admin@staysage.ai': {
    email: 'admin@staysage.ai',
    name: 'Audrey Hepburn',
    role: 'admin',
    password: 'password',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  'manager@staysage.ai': {
    email: 'manager@staysage.ai',
    name: 'Gregory Peck',
    role: 'manager',
    password: 'password',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  'staff@staysage.ai': {
    email: 'staff@staysage.ai',
    name: 'Humphrey Bogart',
    role: 'staff',
    password: 'password',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
};

export interface SessionData {
  user: Profile;
  avatarUrl: string;
}

export async function loginStaff(email: string, password: string): Promise<{ success: boolean; session?: SessionData; error?: string }> {
  const useSupabase = await checkSupabaseConnection();

  if (useSupabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data && data.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const userProfile: Profile = (profile as Profile) || {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || 'Staff User',
          role: data.user.user_metadata?.role || 'staff',
          updated_at: new Date().toISOString()
        };

        return {
          success: true,
          session: {
            user: userProfile,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.full_name)}&background=4f46e5&color=fff`
          }
        };
      }
    } catch (e: any) {
      console.warn('Supabase Auth error, falling back to mock auth:', e);
    }
  }

  // Fallback to Demo Accounts
  const demoUser = DEMO_USERS[email.toLowerCase()];
  if (demoUser && demoUser.password === password) {
    const mockProfile: Profile = {
      id: 'demo-' + demoUser.role,
      email: demoUser.email,
      full_name: demoUser.name,
      role: demoUser.role,
      updated_at: new Date().toISOString()
    };
    return {
      success: true,
      session: {
        user: mockProfile,
        avatarUrl: demoUser.avatarUrl
      }
    };
  }

  return { success: false, error: 'Invalid credentials. Try using one of our demo accounts (e.g. staff@staysage.ai / password)' };
}

export async function logoutStaff(): Promise<void> {
  const useSupabase = await checkSupabaseConnection();
  if (useSupabase) {
    await supabase.auth.signOut();
  }
}
