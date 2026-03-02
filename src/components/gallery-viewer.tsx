"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface GalleryImage {
  id: string;
  imageUrl: string;
  title: string | null;
  price: number | null;
}

interface GalleryViewerProps {
  images: GalleryImage[];
  themeColor: string;
  galleryTitleColor?: string | null;
  galleryPriceColor?: string | null;
}

export function GalleryViewer({ images, themeColor, galleryTitleColor, galleryPriceColor }: GalleryViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const titleColor = galleryTitleColor || "#ffffff";
  const priceColor = galleryPriceColor || "#4ade80";

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : (prev as number) + 1));
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : (prev as number) - 1));
  };

  if (!images.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, index) => (
          <div
            key={img.id}
            onClick={() => openLightbox(index)}
            className="aspect-square rounded-xl overflow-hidden cursor-pointer relative group bg-slate-100 border border-slate-200"
          >
            <img
              src={img.imageUrl}
              alt={img.title || "Gallery Image"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {(img.price || img.title) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                {img.title && (
                  <p className="text-xs font-medium truncate" style={{ color: titleColor }}>{img.title}</p>
                )}
                {img.price && (
                  <p className="text-sm font-bold" style={{ color: priceColor }}>
                    ${img.price.toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-md transition-colors z-50"
            >
              <X size={24} />
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 p-3 rounded-full backdrop-blur-md transition-colors z-50 hidden md:block"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 p-3 rounded-full backdrop-blur-md transition-colors z-50 hidden md:block"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Main Image Container */}
            <div 
              className="relative w-full max-w-4xl max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                src={images[selectedIndex].imageUrl}
                alt={images[selectedIndex].title || "Gallery"}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-2xl bg-black"
              />

              {/* Info Bar */}
              {(images[selectedIndex].title || images[selectedIndex].price) && (
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-full max-w-md mx-auto text-center"
                >
                    {images[selectedIndex].title && (
                        <h3 className="text-xl font-bold mb-1" style={{ color: titleColor }}>{images[selectedIndex].title}</h3>
                    )}
                    {images[selectedIndex].price && (
                        <div className="flex items-center justify-center gap-2 font-bold text-lg" style={{ color: priceColor }}>
                            <ShoppingBag size={20} />
                            <span>${images[selectedIndex].price?.toLocaleString()}</span>
                        </div>
                    )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
