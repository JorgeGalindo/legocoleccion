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
        <header className="border-b-[3px] border-lego-black bg-lego-yellow">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <h1 className="font-display text-2xl tracking-wider text-lego-black">
              legocoleccion
            </h1>
            <nav className="flex gap-2 text-sm font-bold uppercase tracking-wide">
              <a
                href="/"
                className="rounded border-2 border-lego-black bg-white px-3 py-1 text-lego-black hover:bg-lego-cream-dark"
              >
                Colección
              </a>
              <a
                href="/debug"
                className="rounded border-2 border-lego-black bg-lego-blue px-3 py-1 text-white hover:opacity-90"
              >
                Debug
              </a>
            </nav>
          </div>
          <StudPattern />
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t-[3px] border-lego-black bg-lego-black">
          <StudPattern color="var(--color-lego-cream)" />
          <p className="mx-auto max-w-5xl px-6 py-3 text-center text-xs uppercase tracking-widest text-lego-cream">
            fase 1 — clasificando
          </p>
        </footer>
      </body>
    </html>
  );
}
