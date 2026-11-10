// Static asset imports. next-env.d.ts (gitignored) normally provides these, but
// `tsc --noEmit` in CI runs before `next build` generates it.
declare module "*.png" {
  const src: string | { src: string; width: number; height: number };
  export default src;
}
