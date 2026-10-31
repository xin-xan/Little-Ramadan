import type { AnchorHTMLAttributes, ReactNode } from "react";
import { navigate, pathToHash } from "../hashRoute";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode; prefetch?: boolean };

/** next/link replacement for the preview: internal links become #hash routes. */
export default function Link({ href, onClick, ...props }: Props) {
  const { prefetch, ...rest } = props;
  void prefetch;
  const internal = href.startsWith("/");
  return (
    <a
      {...rest}
      href={internal ? `#${pathToHash(href)}` : href}
      onClick={(e) => {
        onClick?.(e);
        if (!internal || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        navigate(href);
      }}
    />
  );
}
