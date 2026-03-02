"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2 } from "lucide-react";
import html2canvas from "html2canvas";

interface QRCodeCardProps {
  url: string;
  logoUrl?: string | null;
  title?: string;
}

export function QRCodeCard({ url, logoUrl, title }: QRCodeCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Mi Tarjeta Digital",
          url: url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert("Enlace copiado al portapapeles");
    }
  };

  const handleDownload = async () => {
    if (!qrRef.current) return;
    
    setIsDownloading(true);
    try {
      // Create a canvas from the QR container
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: "#ffffff",
        scale: 3, // Higher resolution
        logging: false,
        useCORS: true,
        allowTaint: false, // Must be false for toDataURL to work
      });
      
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qr-${title?.replace(/\s+/g, '-').toLowerCase() || 'card'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading QR:", error);
      alert("Error al descargar la imagen. Intenta de nuevo.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 w-full max-w-sm mx-auto">
      <div 
        ref={qrRef}
        className="relative bg-white p-4 rounded-xl shadow-lg"
      >
        <QRCodeSVG 
          value={url} 
          size={200} 
          level="H" // High error correction for logo overlay
          includeMargin={true}
          imageSettings={logoUrl ? {
            src: logoUrl,
            x: undefined,
            y: undefined,
            height: 40,
            width: 40,
            excavate: true,
          } : undefined}
        />
        
        {/* Fallback/Custom Logo Overlay if needed for better styling than imageSettings */}
        {/* We use imageSettings above which is standard, but we can also do absolute positioning if needed.
            Let's stick to imageSettings for now as it handles 'excavate' correctly so QR dots don't overlap.
            However, for a "more professional" look, sometimes a white border around the logo is nice.
            imageSettings supports this implicitly if the image has a background, but let's see.
        */}
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all text-sm font-medium text-white"
        >
          <Share2 size={18} />
          Compartir
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all text-sm font-medium text-white disabled:opacity-50"
        >
          <Download size={18} />
          {isDownloading ? "..." : "Descargar"}
        </button>
      </div>
    </div>
  );
}
