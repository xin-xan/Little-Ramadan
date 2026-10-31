import { useSyncExternalStore } from "react";
import { currentHash, hashToLocation, navigate, subscribe } from "../hashRoute";

const useHash = () => useSyncExternalStore(subscribe, currentHash, () => "");

export function usePathname() {
  return hashToLocation(useHash()).pathname;
}
export function useSearchParams() {
  return hashToLocation(useHash()).search;
}
export function useRouter() {
  return { push: (h: string) => navigate(h), replace: (h: string) => navigate(h, true), back: () => history.back(), refresh: () => {}, prefetch: () => {} };
}
