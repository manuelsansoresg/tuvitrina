"use client";

import { useState } from "react";
import { User, BusinessCard, Link as LinkModel, GalleryImage, Product, PlanType } from "@prisma/client";
import { PLAN_LIMITS } from "@/lib/constants";
import { useFormStatus } from "react-dom";
import { updateBusinessCard } from "@/actions/dashboard";
import { useActionState } from "react";
import { Save, Lock, Smartphone, MapPin, Image as ImageIcon, LayoutGrid, Palette, QrCode, ShoppingBag, Crown } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// --- Custom UI Components (Replaces shadcn/ui for simplicity/portability in this env) ---

const Label = ({ children, className }: any) => <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>;
const Input = ({ className, ...props }: any) => <input className={`flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
const Textarea = ({ className, ...props }: any) => <textarea className={`flex min-h-[80px] w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm ring-offset-slate-950 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
const Button = ({ className, variant, size, ...props }: any) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-slate-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-blue-600 text-slate-50 hover:bg-blue-600/90",
    outline: "border border-slate-800 bg-slate-950 hover:bg-slate-800 hover:text-slate-50",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
  };
  const variantStyles = variants[variant as keyof typeof variants] || variants.default;
  const sizeStyles = sizes[size as keyof typeof sizes] || sizes.default;
  
  return <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} {...props} />;
};

// ------------------------------------------------------------------------------------------

type DashboardData = {
  user: User & {
    businessCard: (BusinessCard & {
      links: LinkModel[];
      gallery: GalleryImage[];
      products: Product[];
    }) | null;
  };
  limits: typeof PLAN_LIMITS.EXPRESS;
};

export default function DashboardClient({ data, targetUserId }: { data: DashboardData, targetUserId?: string }) {
  const [activeTab, setActiveTab] = useState("general");
  const [previewData, setPreviewData] = useState(data.user.businessCard);
  const [showQR, setShowQR] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [state, dispatch] = useActionState(updateBusinessCard, null);
  
  // Sync preview with form changes
  const handlePreviewChange = (field: string, value: any) => {
    setPreviewData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const limits = data.limits;
  const plan = data.user.plan;
  const isAdmin = data.user.role === 'ADMIN';
  const isPremiumOrAdmin = plan === 'PREMIUM' || isAdmin;
  const cardUrl = typeof window !== 'undefined' ? `${window.location.origin}/${previewData?.slug}` : `tuvitrina.xyz/${previewData?.slug}`;

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden text-slate-200">
      {/* Left Panel - Editor */}
      <div className="w-full lg:w-1/2 flex flex-col border-r border-slate-800 overflow-y-auto custom-scrollbar">
        <header className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {targetUserId ? `Editando: ${data.user.name || 'Usuario'}` : 'Panel de Control'}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-400">
                  Plan: <span className={`font-bold ${isPremiumOrAdmin ? 'text-amber-400' : plan === 'EMPRENDEDOR' ? 'text-blue-400' : 'text-slate-400'}`}>
                    {isAdmin ? 'ADMIN (Ilimitado)' : plan}
                  </span>
                </p>
                {isPremiumOrAdmin && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Crown size={10} /> Soporte VIP
                  </span>
                )}
                {targetUserId && (
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'} className="ml-4 text-xs h-6">
                        Volver al Admin
                    </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowQR(!showQR)}
                  className="gap-2"
                >
                  <QrCode size={16} /> QR
                </Button>
                
                <form action={dispatch}>
                  {/* Hidden inputs to pass data to server action */}
                  {targetUserId && <input type="hidden" name="targetUserId" value={targetUserId} />}
                  <input type="hidden" name="title" value={previewData?.title || ""} />
                  <input type="hidden" name="description" value={previewData?.description || ""} />
                  <input type="hidden" name="themeColor" value={previewData?.themeColor || "#000000"} />
                  <input type="hidden" name="location" value={previewData?.location || ""} />
                  <input type="hidden" name="slug" value={previewData?.slug || ""} />
                  
                  <SaveButton />
                </form>
            </div>
        </header>
        
        {state?.message && (
             <div className={`px-6 pt-4`}>
                <p className={`text-sm p-2 rounded ${state.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {state.message}
                </p>
             </div>
        )}

        {showQR && (
           <div className="m-6 p-6 bg-white rounded-xl flex flex-col items-center justify-center text-slate-900 animate-in fade-in zoom-in duration-300 relative">
              <button onClick={() => setShowQR(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600">✕</button>
              <h3 className="font-bold mb-4">Tu Código QR</h3>
              <QRCodeSVG value={cardUrl} size={200} />
              <p className="mt-4 text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">{cardUrl}</p>
              <Button size="sm" className="mt-4" onClick={() => {
                  const svg = document.querySelector('svg');
                  if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx?.drawImage(img, 0, 0);
                      const pngFile = canvas.toDataURL("image/png");
                      const downloadLink = document.createElement("a");
                      downloadLink.download = "mi-qr-tuvitrina.png";
                      downloadLink.href = pngFile;
                      downloadLink.click();
                    };
                    img.src = "data:image/svg+xml;base64," + btoa(svgData);
                  }
              }}>
                Descargar PNG
              </Button>
           </div>
        )}

        <div className="p-6">
          {/* Tabs Navigation */}
          <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-lg mb-6 overflow-x-auto">
            <TabButton active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={<LayoutGrid size={16} />}>General</TabButton>
            <TabButton active={activeTab === "redes"} onClick={() => setActiveTab("redes")} icon={<Smartphone size={16} />}>Redes</TabButton>
            <TabButton active={activeTab === "galeria"} onClick={() => setActiveTab("galeria")} icon={<ImageIcon size={16} />}>Galería</TabButton>
            <TabButton active={activeTab === "productos"} onClick={() => setActiveTab("productos")} icon={<ShoppingBag size={16} />}>Catálogo</TabButton>
            <TabButton active={activeTab === "ubicacion"} onClick={() => setActiveTab("ubicacion")} icon={<MapPin size={16} />}>Ubicación</TabButton>
          </div>

          {/* Tab Content */}
          <div className="space-y-6 pb-20">
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nombre del Negocio / Título</Label>
                  <Input 
                    value={previewData?.title || ""} 
                    onChange={(e: any) => handlePreviewChange("title", e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Descripción</Label>
                  <Textarea 
                    value={previewData?.description || ""} 
                    onChange={(e: any) => handlePreviewChange("description", e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white min-h-[100px] focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">URL Personalizada (Slug)</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 text-sm hidden sm:inline">tuvitrina.xyz/</span>
                    <Input 
                      value={previewData?.slug || ""} 
                      onChange={(e: any) => handlePreviewChange("slug", e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <Palette size={16} /> Color del Tema
                    </Label>
                    {!limits.allowThemeColor && <LockBadge />}
                  </div>
                  
                  {limits.allowThemeColor ? (
                    <div className="flex gap-3">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={previewData?.themeColor || "#000000"}
                          onChange={(e) => handlePreviewChange("themeColor", e.target.value)}
                          className="h-10 w-20 rounded cursor-pointer opacity-0 absolute inset-0 z-10 w-full"
                        />
                         <div 
                           className="h-10 w-20 rounded border border-slate-700" 
                           style={{ backgroundColor: previewData?.themeColor || '#000000' }}
                         />
                      </div>
                      <Input 
                         value={previewData?.themeColor || "#000000"}
                         onChange={(e: any) => handlePreviewChange("themeColor", e.target.value)}
                         className="bg-slate-800 border-slate-700 text-white w-32"
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 text-sm text-slate-400 flex items-center gap-3">
                      <Lock size={16} />
                      Actualiza a plan Emprendedor para personalizar colores.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "redes" && (
              <div className="text-center py-10 text-slate-400">
                <p>Gestión de enlaces próximamente...</p>
              </div>
            )}

            {activeTab === "galeria" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Galería de Imágenes</h3>
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
                      {limits.galleryImages} imágenes permitidas
                    </span>
                 </div>

                 {limits.galleryImages === 0 ? (
                   <UpgradeCard message="La galería está disponible desde el plan Emprendedor." />
                 ) : (
                   <div className="grid grid-cols-2 gap-4">
                     {/* Show existing images */}
                     {previewData?.gallery?.map((img: any) => (
                        <div key={img.id} className="aspect-square bg-slate-800 rounded-lg relative group overflow-hidden">
                           <img src={img.imageUrl} alt="Gallery" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-xs text-white">Editar</span>
                           </div>
                        </div>
                     ))}
                     
                     {/* Add Image Button */}
                     <div 
                        onClick={() => {
                          if ((previewData?.gallery?.length || 0) >= limits.galleryImages) {
                            setShowUpgradeModal(true);
                          } else {
                            // Open file picker (mock)
                            alert("Aquí se abriría el selector de archivos");
                          }
                        }}
                        className="aspect-square bg-slate-800 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors"
                     >
                        <ImageIcon size={24} className="mb-2" />
                        <span className="text-xs">
                          {(previewData?.gallery?.length || 0) >= limits.galleryImages ? "Límite Alcanzado" : "Subir Imagen"}
                        </span>
                     </div>
                   </div>
                 )}
              </div>
            )}

            {showUpgradeModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => setShowUpgradeModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
                      <Crown size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">¡Has alcanzado tu límite!</h3>
                    <p className="text-slate-400">
                      Tu plan actual solo permite {limits.galleryImages} imágenes en la galería. Actualiza a un plan superior para desbloquear más espacio y funciones exclusivas.
                    </p>
                    <div className="pt-4 flex gap-3 justify-center">
                      <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                        Cancelar
                      </Button>
                      <Button className="bg-amber-500 hover:bg-amber-600 text-black font-medium">
                        Ver Planes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "productos" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Catálogo de Productos</h3>
                  {!limits.allowProducts && <LockBadge />}
                </div>

                {limits.allowProducts ? (
                   <div className="space-y-4">
                      {/* Placeholder for product implementation */}
                      <div className="p-8 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors bg-slate-800/50">
                        <ShoppingBag size={32} className="mb-2" />
                        <span className="font-medium">Agregar Producto</span>
                        <span className="text-xs mt-1">Título, precio e imagen</span>
                      </div>
                   </div>
                ) : (
                   <UpgradeCard message="El catálogo de productos está disponible solo en el plan Premium." />
                )}
              </div>
            )}

            {activeTab === "ubicacion" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center justify-between">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <MapPin size={16} /> Ubicación en Mapa
                    </Label>
                    {!limits.allowLocation && <LockBadge />}
                </div>

                {limits.allowLocation ? (
                  <div className="space-y-2">
                    <Input 
                      placeholder="Pega aquí el enlace de Google Maps Embed"
                      value={previewData?.location || ""}
                      onChange={(e: any) => handlePreviewChange("location", e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    <p className="text-xs text-slate-500">
                      Ve a Google Maps {">"} Compartir {">"} Insertar un mapa {">"} Copiar HTML (solo la URL dentro de src="")
                    </p>
                  </div>
                ) : (
                   <UpgradeCard message="La ubicación en mapa está disponible desde el plan Emprendedor." />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Mobile Preview */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 items-center justify-center relative p-8 border-l border-slate-800">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        
        <div className="relative w-[375px] h-[750px] bg-black rounded-[40px] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col transform transition-transform hover:scale-[1.01] duration-500">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20"></div>
          
          {/* Screen Content */}
          <div className="w-full h-full bg-white overflow-y-auto custom-scrollbar relative" style={{ backgroundColor: '#ffffff' }}>
             
             {/* Hero Banner */}
             <div className="h-40 relative flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: previewData?.themeColor || '#000000' }}>
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg absolute -bottom-12 flex items-center justify-center text-3xl font-bold text-slate-800 overflow-hidden">
                   {previewData?.logoUrl ? (
                      <img src={previewData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                   ) : (
                      <span>{previewData?.title?.[0] || "T"}</span>
                   )}
                </div>
             </div>
             
             <div className="mt-14 px-6 text-center pb-10">
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">{previewData?.title || "Nombre del Negocio"}</h2>
                <p className="text-sm text-slate-500 mt-2 whitespace-pre-wrap">{previewData?.description || "Descripción de tu negocio..."}</p>
             </div>

             <div className="px-6 space-y-4 pb-10">
                {/* Links Preview Mockup */}
                <div className="space-y-3">
                   {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
                         <div className="w-8 h-8 rounded-full bg-slate-200" />
                         <div className="h-3 w-32 bg-slate-200 rounded" />
                      </div>
                   ))}
                </div>

                {/* Gallery Preview */}
                {limits.galleryImages > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Galería</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {[1, 2, 3, 4].slice(0, limits.galleryImages > 4 ? 4 : limits.galleryImages).map((i) => (
                         <div key={i} className="aspect-square bg-slate-200 rounded-lg animate-pulse" />
                       ))}
                    </div>
                  </div>
                )}

                {/* Products Preview */}
                {limits.allowProducts && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Productos Destacados</h3>
                    <div className="space-y-3">
                       {[1, 2].map((i) => (
                         <div key={i} className="flex gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                           <div className="w-16 h-16 bg-slate-200 rounded-lg shrink-0" />
                           <div className="flex flex-col justify-center gap-2 w-full">
                             <div className="h-3 w-3/4 bg-slate-200 rounded" />
                             <div className="h-3 w-1/4 bg-slate-200 rounded" />
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* Location Preview */}
                {limits.allowLocation && previewData?.location && (
                   <div className="mt-6">
                      <h3 className="text-sm font-bold text-slate-900 mb-2">Ubicación</h3>
                      <div className="rounded-xl overflow-hidden border border-slate-100 h-40 bg-slate-100 flex items-center justify-center text-slate-400 text-xs relative group">
                         <iframe 
                           src={previewData.location} 
                           width="100%" 
                           height="100%" 
                           style={{ border: 0 }} 
                           allowFullScreen 
                           loading="lazy" 
                           referrerPolicy="no-referrer-when-downgrade"
                           className="absolute inset-0 pointer-events-none"
                         />
                         <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors" />
                      </div>
                   </div>
                )}
             </div>
             
             {/* Powered by footer */}
             <div className="py-6 text-center">
                <p className="text-[10px] text-slate-400 font-medium">Powered by TuVitrina</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="bg-blue-600 hover:bg-blue-500 text-white gap-2 w-full sm:w-auto"
    >
      {pending ? "Guardando..." : <><Save size={16} /> Guardar Cambios</>}
    </Button>
  );
}

function LockBadge() {
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
      <Lock size={10} /> Premium
    </span>
  );
}

function UpgradeCard({ message }: { message: string }) {
  return (
    <div className="p-6 rounded-xl border border-dashed border-slate-700 bg-slate-800/30 flex flex-col items-center text-center space-y-3">
      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-500">
        <Lock size={20} />
      </div>
      <p className="text-sm text-slate-300">{message}</p>
      <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
        Mejorar Plan
      </Button>
    </div>
  );
}
