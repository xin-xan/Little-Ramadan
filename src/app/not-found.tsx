import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="card stack center">
      <h1>This page went exploring!</h1>
      <p>We couldn&apos;t find it. Let&apos;s go back to Noor&apos;s House.</p>
      <Link className="btn" href="/home/">
        Go home
      </Link>
    </div>
  );
}
