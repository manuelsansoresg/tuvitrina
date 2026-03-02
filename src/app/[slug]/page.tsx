import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import { checkSubscriptionStatus } from "@/actions/subscription"
import { GalleryViewer } from "@/components/gallery-viewer";
import { QRCodeCard } from "@/components/QRCodeCard";
import { headers } from "next/headers";
import { 
  Link as LinkIcon, Facebook, Instagram, Twitter, Linkedin, 
  Youtube, MessageCircle, Mail, Phone, Globe, MapPin 
} from "lucide-react";

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const headerList = await headers();
  const host = headerList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const fullUrl = `${protocol}://${host}/${slug}`;

  const card = await prisma.businessCard.findUnique({
    where: { slug },
    include: {
      user: true,
      links: true,
      gallery: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  })

  if (!card) notFound()

  // Type assertion to bypass linter issues if Prisma types aren't fully synced in editor
  const extendedCard = card as any;

  // Verify subscription status
  const subStatus = await checkSubscriptionStatus(card.userId)
  
  // If card is explicitly inactive or subscription is expired/inactive
  if (!card.active || (subStatus && subStatus.status !== "active")) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4 text-center">
         <div>
            <h1 className="text-3xl font-bold mb-4">Tarjeta No Disponible</h1>
            <p className="text-slate-400">Esta tarjeta digital ha expirado o se encuentra inactiva.</p>
         </div>
       </div>
     )
  }

  const IconMap: any = {
      whatsapp: MessageCircle,
      instagram: Instagram,
      facebook: Facebook,
      twitter: Twitter,
      linkedin: Linkedin,
      youtube: Youtube,
      email: Mail,
      phone: Phone,
      website: Globe,
      map: MapPin,
      link: LinkIcon
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div 
        className="w-full max-w-md min-h-screen shadow-2xl overflow-hidden relative flex flex-col"
        style={{
          backgroundColor: extendedCard.cardBackgroundColor || '#ffffff',
          backgroundImage: extendedCard.cardBackgroundImage ? `url(${extendedCard.cardBackgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: extendedCard.descriptionColor || '#64748b'
        }}
      >
         
         {/* Hero Banner */}
         <div 
            className="h-40 relative flex items-center justify-center bg-cover bg-center bg-no-repeat" 
            style={{ 
              backgroundColor: extendedCard.themeColor || '#000000',
              backgroundImage: extendedCard.bannerUrl ? `url(${extendedCard.bannerUrl})` : undefined
            }}
         >
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg absolute -bottom-12 flex items-center justify-center text-3xl font-bold text-slate-800 overflow-hidden z-10">
               {extendedCard.logoUrl ? (
                  <Image 
                    src={extendedCard.logoUrl} 
                    alt={extendedCard.title} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
               ) : (
                  <span>{extendedCard.title?.[0] || "T"}</span>
               )}
            </div>
         </div>
         
         {/* Content */}
         <div className="mt-14 px-6 text-center pb-10 flex-1">
            <h1 
              className="text-2xl font-bold leading-tight mb-2"
              style={{ color: extendedCard.titleColor || '#0f172a' }}
            >
              {extendedCard.title}
            </h1>
            {extendedCard.description && (
               <p 
                 className="text-sm whitespace-pre-wrap mb-6"
                 style={{ color: extendedCard.descriptionColor || '#64748b' }}
               >
                 {extendedCard.description}
               </p>
            )}

            {/* Links Section */}
            <div className="space-y-3 mb-8">
               {extendedCard.links.length > 0 ? (
                 extendedCard.links.map((link: any) => {
                   const IconComp = IconMap[link.icon || 'link'] || LinkIcon;
                   // Si es whatsapp, asegurar formato wa.me
                   const href = link.icon === 'whatsapp' && !link.url.startsWith('http') 
                      ? `https://wa.me/${link.url.replace(/[^0-9]/g, '')}`
                      : link.url;
                      
                   return (
                     <a 
                       key={link.id} 
                       href={href} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="block p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-3 group"
                       style={{ 
                          borderColor: extendedCard.linkBorderColor || (extendedCard.themeColor ? `${extendedCard.themeColor}40` : undefined),
                          backgroundColor: extendedCard.linkBackgroundColor || undefined,
                       }}
                     >
                       <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center transition-colors text-slate-700">
                          <IconComp size={20} className={link.icon === 'whatsapp' ? 'text-green-600' : link.icon === 'instagram' ? 'text-pink-600' : link.icon === 'facebook' ? 'text-blue-600' : link.icon === 'youtube' ? 'text-red-600' : 'text-slate-700'} style={{ color: extendedCard.iconColor || undefined }} />
                       </div>
                       <span 
                         className="font-medium flex-1 text-left"
                         style={{ color: extendedCard.linkTextColor || extendedCard.titleColor || '#0f172a' }}
                       >
                         {link.label}
                       </span>
                       <span 
                         className="transition-colors"
                         style={{ color: extendedCard.linkTextColor || extendedCard.descriptionColor || '#94a3b8' }}
                       >
                         ↗
                       </span>
                     </a>
                   );
                 })
               ) : null}
            </div>

            {/* Gallery Section */}
            {extendedCard.gallery.length > 0 && (
               <div className="mb-8">
                  <h2 
                    className="text-sm font-bold mb-3 text-left uppercase tracking-wider"
                    style={{ color: extendedCard.titleColor || '#0f172a' }}
                  >
                    Galería
                  </h2>
                  <GalleryViewer 
                    images={extendedCard.gallery} 
                    themeColor={extendedCard.themeColor || '#000000'}
                    galleryTitleColor={extendedCard.galleryTitleColor}
                    galleryPriceColor={extendedCard.galleryPriceColor}
                  />
               </div>
            )}
            
            {/* Location Map */}
            {extendedCard.location && (
               <div className="mb-8">
                  <h2 
                    className="text-sm font-bold mb-3 text-left uppercase tracking-wider"
                    style={{ color: extendedCard.titleColor || '#0f172a' }}
                  >
                    Ubicación
                  </h2>
                  <div className="rounded-xl overflow-hidden border border-white/20 h-48 bg-slate-100 relative">
                     <iframe 
                       src={extendedCard.location} 
                       width="100%" 
                       height="100%" 
                       style={{ border: 0 }} 
                       allowFullScreen 
                       loading="lazy" 
                       referrerPolicy="no-referrer-when-downgrade"
                       className="absolute inset-0"
                     />
                  </div>
               </div>
            )}
         </div>
         
         {/* Footer */}
         <div className="py-6 text-center border-t border-white/10" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <p className="text-[10px] font-medium" style={{ color: extendedCard.descriptionColor || '#94a3b8' }}>Powered by TuVitrina</p>
         </div>
      </div>
    </div>
  )
}
