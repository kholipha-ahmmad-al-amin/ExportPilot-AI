const ROUTE_ROLES: Record<string, string[]> = {
  '/app': ['factory_owner'], '/dealroom': ['factory_owner'], '/intelligence': ['factory_owner'],
  '/buyers': ['factory_owner', 'verified_buyer'], '/catalog': ['factory_owner', 'verified_buyer'],
  '/data': ['factory_owner', 'compliance_auditor'], '/security': ['factory_owner', 'compliance_auditor'],
  '/audit': ['factory_owner', 'verified_buyer', 'compliance_auditor'],
  '/architecture': ['factory_owner', 'verified_buyer', 'compliance_auditor'], '/admin': [],
};

export const roleHome = (role: string) => role === 'admin' ? '/admin' : role === 'verified_buyer' ? '/buyers' : role === 'compliance_auditor' ? '/audit' : role === 'factory_owner' ? '/app' : '/';

export function loginDestination(requested: string | null | undefined, role: string): string {
  if (!requested || !requested.startsWith('/') || requested.startsWith('//') || /[\\\u0000-\u0020]/.test(requested)) return roleHome(role);
  try {
    const parsed = new URL(requested, 'https://workspace.invalid');
    if (parsed.origin !== 'https://workspace.invalid') return roleHome(role);
    const path = parsed.pathname.replace(/\/+$/, '') || '/';
    if (path === '/login' || path === '/register') return roleHome(role);
    if (path === '/dashboard') return `${roleHome(role)}${parsed.search}${parsed.hash}`;
    const restricted = Object.keys(ROUTE_ROLES).find((route) => path === route || path.startsWith(`${route}/`));
    return !restricted || role === 'admin' || ROUTE_ROLES[restricted].includes(role) ? `${parsed.pathname}${parsed.search}${parsed.hash}` : roleHome(role);
  } catch { return roleHome(role); }
}
