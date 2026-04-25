import type { Metadata } from "next";
import { Bungee, Inter } from "next/font/google";
import { StudPattern } from "@/components/StudPattern";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "legocoleccion",
  description: "Catalogador de mi colección de LEGO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${bungee.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <h1 className="font-display text-2xl tracking-wider">
              <span className="text-lego-yellow">lego</span>
              <span className="text-fg">coleccion</span>
            </h1>
            <nav className="flex gap-2 text-sm font-bold uppercase tracking-wide">
              <a
                href="/"
                className="rounded border border-line px-3 py-1.5 text-fg-muted transition-colors hover:border-lego-yellow hover:text-fg"
              >
                Colección
              </a>
              <a
                href="/debug"
                className="rounded border border-line px-3 py-1.5 text-fg-muted transition-colors hover:border-lego-yellow hover:text-fg"
              >
                Debug
              </a>
            </nav>
          </div>
          <StudPattern />
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line">
          <p className="mx-auto max-w-5xl px-6 py-4 text-center text-xs uppercase tracking-widest text-fg-dim">
            fase 1 — clasificando
          </p>
        </footer>
      </body>
    </html>
  );
}
