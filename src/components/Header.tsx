import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-semibold tracking-tight text-zinc-100">
            GitPulse
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/developers"
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Developers
          </Link>
          <Link
            href="/repositories"
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Repositories
          </Link>
          <Link
            href="/pulse"
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Pulse
          </Link>
          <Link
            href="/methodology"
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Methodology
          </Link>
        </nav>
      </div>
    </header>
  );
}
