"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Share2 } from "lucide-react";

interface QRCodeCardProps {
  url: string;
  logoUrl?: string | null;
  title?: string;
}

export function QRCodeCard({ url, logoUrl, title }: QRCodeCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrLogo, setQrLogo] = useState<string | undefined>(undefined);

  // Pre-load logo as Base64 to avoid CORS issues
  useEffect(() => {
    if (logoUrl) {
      // If it's already a data URL, use it directly
      if (logoUrl.startsWith('data:')) {
        setQrLogo(logoUrl);
        return;
      }

      // Try to fetch and convert
      fetch(logoUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setQrLogo(reader.result as string);
          };
          reader.readAsDataURL(blob);
        })
        .catch(() => {
          // If fetch fails (CORS), fall back to original URL
          // It might still work if the server allows cross-origin image loading
          setQrLogo(logoUrl);
        });
    } else {
      setQrLogo(undefined);
    }
  }, [logoUrl]);

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

  const handleDownload = () => {
    setIsDownloading(true);
    
    // Small delay to ensure UI updates
    setTimeout(() => {
        try {
            const canvas = qrRef.current?.querySelector('canvas');
            if (canvas) {
                // Create a temporary link to download
                const dataUrl = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = `qr-${title?.replace(/\s+/g, '-').toLowerCase() || 'card'}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error("Canvas not found");
            }
        } catch (error) {
            console.error("Error downloading QR:", error);
            alert("Error al descargar el código QR. Intente nuevamente.");
        } finally {
            setIsDownloading(false);
        }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 w-full max-w-sm mx-auto">
      <div 
        ref={qrRef}
        className="relative bg-white p-4 rounded-xl shadow-lg"
      >
        <QRCodeCanvas 
          value={url} 
          size={200} 
          level="H" // High error correction for logo overlay
          includeMargin={true}
          imageSettings={qrLogo ? {
            src: qrLogo,
            x: undefined,
            y: undefined,
            height: 40,
            width: 40,
            excavate: true,
          } : undefined}
        />
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
