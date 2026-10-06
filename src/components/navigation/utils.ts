export function isPathActive(pathname: string, link: string) {
  return pathname === link || pathname.startsWith(`${link}/`);
}
