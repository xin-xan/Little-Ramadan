/**
 * Hash routing for the single-file preview (claude.ai artifacts only allow #name hashes of
 * ASCII letters, digits and hyphens). "/games/quiz/eid/?day=d04" <-> "#games--quiz--eid--day--d04".
 * No content id contains "--", so it is a safe separator.
 */
export function pathToHash(href: string): string {
  const [path, query = ""] = href.split("?");
  const segs = path.split("/").filter(Boolean);
  const day = new URLSearchParams(query).get("day");
  if (day) segs.push("day", day);
  return segs.join("--");
}

export function hashToLocation(hash: string): { pathname: string; search: URLSearchParams } {
  const segs = hash.replace(/^#/, "").split("--").filter(Boolean);
  const search = new URLSearchParams();
  const di = segs.indexOf("day");
  if (di >= 0 && di === segs.length - 2) {
    search.set("day", segs[di + 1]);
    segs.splice(di, 2);
  }
  return { pathname: segs.length ? `/${segs.join("/")}/` : "/", search };
}

type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribe(l: Listener) {
  listeners.add(l);
  const h = () => l();
  window.addEventListener("hashchange", h);
  return () => {
    listeners.delete(l);
    window.removeEventListener("hashchange", h);
  };
}
export function navigate(href: string, replace = false) {
  const hash = pathToHash(href);
  if (replace) history.replaceState(null, "", hash ? `#${hash}` : location.pathname);
  else location.hash = hash;
  listeners.forEach((l) => l());
  window.scrollTo(0, 0);
}
export const currentHash = () => location.hash;
