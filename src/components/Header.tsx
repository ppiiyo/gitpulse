import Link from "next/link";

const nav = [
  { href: "/developers", label: "Developers" },
  { href: "/repositories", label: "Repositories" },
  { href: "/pulse", label: "Pulse" },
  { href: "/report", label: "Report" },
  { href: "/methodology", label: "Methodology" },
];

export function Header() {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-semibold tracking-tight text-zinc-100">
            GitPulse
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 text-sm overflow-x-auto max-w-[60%] sm:max-w-none scrollbar-none">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-zinc-400 hover:text-zinc-100 transition-colors whitespace-nowrap px-2 py-1 rounded-md hover:bg-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
