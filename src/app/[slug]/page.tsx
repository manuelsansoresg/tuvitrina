import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import { checkSubscriptionStatus } from "@/actions/subscription"

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const card = await prisma.businessCard.findUnique({
    where: { slug },
    include: {
      user: true,
      links: true,
      gallery: true
    }
  })

  if (!card) notFound()

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

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl overflow-hidden relative flex flex-col">
         
         {/* Hero Banner */}
         <div 
            className="h-40 relative flex items-center justify-center" 
            style={{ backgroundColor: card.themeColor || '#000000' }}
         >
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg absolute -bottom-12 flex items-center justify-center text-3xl font-bold text-slate-800 overflow-hidden z-10">
               {card.logoUrl ? (
                  <Image 
                    src={card.logoUrl} 
                    alt={card.title} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
               ) : (
                  <span>{card.title?.[0] || "T"}</span>
               )}
            </div>
         </div>
         
         {/* Content */}
         <div className="mt-14 px-6 text-center pb-10 flex-1">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{card.title}</h1>
            {card.description && (
               <p className="text-sm text-slate-500 whitespace-pre-wrap mb-6">{card.description}</p>
            )}

            {/* Links Section */}
            <div className="space-y-3 mb-8">
               {card.links.length > 0 ? (
                 card.links.map(link => {
                   // Map common icons
                   const iconMap: any = {
                     "Whatsapp": "MessageCircle",
                     "Instagram": "Instagram", 
                     "Facebook": "Facebook",
                     "Twitter": "Twitter",
                     "Linkedin": "Linkedin",
                     "Youtube": "Youtube",
                     "Mail": "Mail",
                     "MapPin": "MapPin",
                     "Phone": "Phone",
                     "Link": "Link"
                   };
                   
                   return (
                     <a 
                       key={link.id} 
                       href={link.url} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="block p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-3 group"
                     >
                       <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-700 group-hover:text-blue-600 transition-colors">
                          {/* We can't easily render dynamic Lucide icons in server component without a map or client component. 
                              For now using a simple emoji or generic icon fallback */}
                          <span className="text-lg">🔗</span>
                       </div>
                       <span className="font-medium text-slate-700 group-hover:text-slate-900 flex-1 text-left">{link.label}</span>
                       <span className="text-slate-400 group-hover:text-blue-500">↗</span>
                     </a>
                   );
                 })
               ) : (
                 <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">No hay enlaces configurados.</p>
                 </div>
               )}
            </div>

            {/* Gallery Section */}
            {card.gallery.length > 0 && (
               <div className="mb-8">
                  <h2 className="text-sm font-bold text-slate-900 mb-3 text-left uppercase tracking-wider">Galería</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {card.gallery.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                        <Image 
                          src={img.imageUrl} 
                          alt="Gallery" 
                          fill 
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
               </div>
            )}
            
            {/* Location Map */}
            {card.location && (
               <div className="mb-8">
                  <h2 className="text-sm font-bold text-slate-900 mb-3 text-left uppercase tracking-wider">Ubicación</h2>
                  <div className="rounded-xl overflow-hidden border border-slate-200 h-48 bg-slate-100 relative">
                     <iframe 
                       src={card.location} 
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
         <div className="py-6 text-center bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium">Powered by TuVitrina</p>
         </div>
      </div>
    </div>
  )
}
