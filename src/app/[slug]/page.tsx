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
    <main className="min-h-screen bg-slate-950 text-white" style={{ backgroundColor: card.themeColor || "#0F172A" }}>
      <div className="max-w-md mx-auto min-h-screen bg-black/20 backdrop-blur-sm shadow-2xl overflow-hidden relative">
         
         {/* Header/Hero */}
         <div className="relative h-72 bg-slate-800">
           {card.logoUrl ? (
             <Image src={card.logoUrl} alt={card.title} fill className="object-cover" priority />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-slate-700">
               <span className="text-4xl">🏷️</span>
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
           <div className="absolute bottom-6 left-6 right-6">
             <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">{card.title}</h1>
             {card.description && (
               <p className="text-sm text-slate-200 leading-relaxed drop-shadow-md">{card.description}</p>
             )}
           </div>
         </div>
         
         {/* Links Section */}
         <div className="p-6 space-y-4">
           {card.links.length > 0 ? (
             card.links.map(link => (
               <a 
                 key={link.id} 
                 href={link.url} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 hover:scale-[1.02] transition-all border border-white/5 shadow-lg backdrop-blur-md"
               >
                 {/* Here you would ideally map link.icon to an actual icon component */}
                 <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                   🔗
                 </div>
                 <span className="font-bold text-lg">{link.label}</span>
               </a>
             ))
           ) : (
             <p className="text-center text-slate-500 py-4">No hay enlaces configurados.</p>
           )}
         </div>

         {/* Gallery Section */}
         {card.gallery.length > 0 && (
           <div className="p-6 pt-0">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-400">📷</span> Galería
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {card.gallery.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden shadow-md border border-white/10">
                    <Image src={img.imageUrl} alt="Gallery" fill className="object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
           </div>
         )}
         
         <div className="p-6 text-center text-xs text-slate-500 mt-8">
            Powered by TuVitrina
         </div>
      </div>
    </main>
  )
}
