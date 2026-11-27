const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix a site path with the deploy base, e.g. "/docs/" to "/Help-me-out/docs/". */
export function url(path = '/'): string {
  if (/^[a-z]+:/i.test(path)) return path;
  return base + (path.startsWith('/') ? path : `/${path}`);
}

/** The inverse of url(), for working out where a request is. */
export function stripBase(pathname: string): string {
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return rest.startsWith('/') ? rest : `/${rest}`;
}

/** View transition names only allow identifier characters. */
export function vtName(...parts: string[]): string {
  return `vt-${parts.join('-').replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}
