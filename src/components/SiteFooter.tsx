import ryseLogo from "@/assets/ryse-logo.png";

const src = typeof ryseLogo === "string" ? ryseLogo : (ryseLogo as { src: string }).src;

/** Credit shown at the bottom of every page. Not a link: the children's area has no external links. */
export function SiteFooter({ dark = false }: { dark?: boolean }) {
  return (
    <footer className={`site-footer no-print${dark ? " on-dark" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, tiny local image */}
      <img src={src} alt="RYSE logo" width={30} height={34} />
      <span>
        A Ramadan gift for children everywhere,
        <br />
        crafted with care by <strong>RYSE</strong>
      </span>
    </footer>
  );
}
