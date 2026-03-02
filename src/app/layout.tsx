import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "TuVitrina | Tarjetas Digitales y Perfiles de Negocio Profesional",
  description: "Crea tu tarjeta de presentación digital y potencia tu identidad profesional. Tu espacio digital para emprendedores con vcard inteligente.",
  keywords: [
    "tarjeta de presentación digital",
    "tarjeta digital",
    "perfil de negocio profesional",
    "vcard inteligente",
    "espacio digital para emprendedores"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
