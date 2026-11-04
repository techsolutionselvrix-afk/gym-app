import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from './supabase';
import { Api, Role } from './api';

const dashboardForRole = (r: Role): string => {
  if (r === 'super_admin') return '/(super-admin)/dashboard';
  if (r === 'admin') return '/(admin)/dashboard';
  return '/(member)/dashboard';
};

/**
 * Guards a route group by role.
 *  - No Supabase session → send to /choose-role
 *  - Session exists but role mismatches → send to correct dashboard
 *  - Session + matching role → allow render
 *
 * Call at the top of every protected group _layout.tsx.
 */
export function useRoleGuard(expected: Role) {
  const [state, setState] = useState<'loading' | 'authorized' | 'redirecting'>('loading');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (!active) return;
        setState('redirecting');
        router.replace('/choose-role');
        return;
      }
      try {
        const me = await Api.me();
        if (!active) return;
        if (me.role !== expected) {
          setState('redirecting');
          router.replace(dashboardForRole(me.role) as any);
          return;
        }
        setState('authorized');
      } catch {
        if (!active) return;
        setState('redirecting');
        router.replace('/choose-role');
      }
    })();
    return () => { active = false; };
  }, [expected]);

  return state;
}
