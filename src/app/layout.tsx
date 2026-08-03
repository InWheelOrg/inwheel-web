import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { buttonVariants } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InWheel",
  description: "Relevé d'accessibilité — pilote Vevey",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="flex flex-col items-center gap-1 p-4 text-center text-xs text-muted-foreground">
          <p>
            Place data ©{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              OpenStreetMap contributors
            </a>
            , licensed under ODbL.
          </p>
          <Link href="/privacy" className={buttonVariants({ variant: "link", size: "sm" })}>
            Confidentialité
          </Link>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
