import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GitPulse — Honest GitHub Rankings",
    template: "%s · GitPulse",
  },
  description:
    "Transparent rankings for developers and repositories on GitHub. Growth-focused. Shareable. No black boxes.",
  openGraph: {
    title: "GitPulse — Honest GitHub Rankings",
    description:
      "Transparent rankings for developers and repositories on GitHub. Growth-focused. Shareable. No black boxes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-800/80 py-8 mt-16">
          <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div>GitPulse — transparent GitHub rankings</div>
            <div className="flex gap-6">
              <a href="/methodology" className="hover:text-zinc-300 transition-colors">
                Methodology
              </a>
              <a
                href="https://github.com/ppiiyo/gitpulse"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-300 transition-colors"
              >
                Source
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
