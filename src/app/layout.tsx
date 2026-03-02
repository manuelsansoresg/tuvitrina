import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  metadataBase: new URL("https://tuvitrina.xyz"),
  title: "TuVitrina | Tarjetas Digitales y Perfiles de Negocio Profesional",
  description: "Crea tu tarjeta de presentación digital y potencia tu identidad profesional. Tu espacio digital para emprendedores con vcard inteligente.",
  keywords: [
    "tarjeta de presentación digital",
    "tarjeta digital",
    "perfil de negocio profesional",
    "vcard inteligente",
    "espacio digital para emprendedores"
  ],
  openGraph: {
    title: "TuVitrina | Tarjetas Digitales y Perfiles de Negocio Profesional",
    description: "Crea tu tarjeta de presentación digital y potencia tu identidad profesional.",
    url: "https://tuvitrina.xyz",
    siteName: "TuVitrina",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TuVitrina | Tarjetas Digitales",
    description: "Potencia tu identidad profesional con una tarjeta digital inteligente.",
  },
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
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1097246480130292');
              fbq('track', 'PageView');
            `,
          }}
        />
        {children}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1097246480130292&ev=PageView&noscript=1"
            alt="Meta Pixel"
          />
        </noscript>
      </body>
    </html>
  );
}
