"use client";

import { useState } from "react";
// @ts-ignore
import { User, BusinessCard, Link as LinkModel, GalleryImage } from "@prisma/client";
import { PLAN_LIMITS } from "@/lib/constants";
import { useFormStatus } from "react-dom";
import { updateBusinessCard } from "@/actions/dashboard";
import { logout } from "@/actions/auth";
import { useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Save, Lock, Smartphone, MapPin, Image as ImageIcon, LayoutGrid, Palette, QrCode, ShoppingBag, Crown, LogOut, LayoutDashboard, PartyPopper, AlertCircle, Upload, Plus, Trash, ExternalLink, Copy, Check, Edit } from "lucide-react";
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
    destructive: "bg-red-900/30 text-red-400 hover:bg-red-900/40",
    ghost: "hover:bg-slate-800 hover:text-slate-50",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    icon: "h-10 w-10",
  };
  // @ts-ignore
  const variantStyles = variants[variant] || variants.default;
  // @ts-ignore
  const sizeStyles = sizes[size] || sizes.default;
  
  return <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} {...props} />;
};

// ------------------------------------------------------------------------------------------

// Local type definitions to handle missing Prisma client generation
type PlanType = "EXPRESS" | "EMPRENDEDOR" | "PREMIUM";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  order: number;
  cardId: string;
}

type DashboardData = {
  user: any; // User & { ... } but skipping for now to avoid 'plan' missing error
  limits: typeof PLAN_LIMITS.EXPRESS;
};

export default function DashboardClient({ data, targetUserId }: { data: DashboardData, targetUserId?: string }) {
  // Extended type to handle potential missing Prisma types during dev
  type ExtendedBusinessCard = {
    id: string;
    slug: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    title: string;
    description?: string | null;
    themeColor?: string | null;
    location?: string | null;
    active: boolean;
    cardBackgroundColor?: string | null;
    cardBackgroundImage?: string | null;
    titleColor?: string | null;
    descriptionColor?: string | null;
    galleryTitleColor?: string | null;
    galleryPriceColor?: string | null;
    links: LinkModel[];
    gallery: GalleryImage[];
    products: Product[];
  };

  const [activeTab, setActiveTab] = useState("general");
  const [previewData, setPreviewData] = useState<ExtendedBusinessCard | null>(data.user.businessCard as any);
  const [links, setLinks] = useState<any[]>(data.user.businessCard?.links || []);
  const [showQR, setShowQR] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [state, dispatch] = useActionState(updateBusinessCard, null);
  const [copied, setCopied] = useState(false);
  const [slugInput, setSlugInput] = useState(data.user.businessCard?.slug || "");
  
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  // Slugify helper
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD") // Split accents
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-"); // Replace multiple - with single -
  };

  useEffect(() => {
    if (paymentStatus === "success") {
      // Could show a toast here. For now, we can rely on the UI updating the plan badge.
      // Or maybe show a confetti effect or modal.
    }
  }, [paymentStatus]);
  
  // Sync preview with form changes
  const handlePreviewChange = (field: string, value: any) => {
    setPreviewData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Image resize helper
  const resizeImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > 800) { // Max height check
               width *= 800 / height;
               height = 800;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality));
        };
      };
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resized = await resizeImage(file, 500, 0.8);
        handlePreviewChange("logoUrl", resized);
      } catch (err) {
        console.error("Error resizing logo:", err);
      }
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resized = await resizeImage(file, 1200, 0.8);
        handlePreviewChange("bannerUrl", resized);
      } catch (err) {
        console.error("Error resizing banner:", err);
      }
    }
  };

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Use a slightly lower quality/size for background patterns if needed, but 1200 is fine
        const resized = await resizeImage(file, 1200, 0.7);
        handlePreviewChange("cardBackgroundImage", resized);
      } catch (err) {
        console.error("Error resizing background:", err);
      }
    }
  };

  const [editingImage, setEditingImage] = useState<any | null>(null);

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const remainingSlots = limits.galleryImages - (previewData?.gallery?.length || 0);
      if (remainingSlots <= 0) {
        setShowUpgradeModal(true);
        return;
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      // Process sequentially or parallel
      const processedImages: any[] = [];
      
      for (const file of filesToProcess) {
         try {
           const resized = await resizeImage(file, 1000, 0.8);
           processedImages.push({ 
             imageUrl: resized, 
             title: "",
             price: null,
             order: (previewData?.gallery?.length || 0) + processedImages.length 
           });
         } catch (err) {
           console.error("Error resizing gallery image:", err);
         }
      }

      setPreviewData((prev: any) => ({
        ...prev,
        gallery: [
          ...(prev.gallery || []),
          ...processedImages
        ]
      }));
    }
  };

  const updateGalleryImage = (index: number, field: string, value: any) => {
    setPreviewData((prev: any) => {
      const newGallery = [...(prev.gallery || [])];
      newGallery[index] = { ...newGallery[index], [field]: value };
      return { ...prev, gallery: newGallery };
    });
  };

  const removeGalleryImage = (index: number) => {
    setPreviewData((prev: any) => {
      const newGallery = [...(prev.gallery || [])];
      newGallery.splice(index, 1);
      return { ...prev, gallery: newGallery };
    });
    setEditingImage(null);
  };

  const handleCopySlug = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/${previewData?.slug}` : `tuvitrina.xyz/${previewData?.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addLink = () => {
    setLinks([...links, { icon: "Link", label: "", url: "", order: links.length }]);
  };

  const removeLink = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    setLinks(newLinks);
  };

  const updateLink = (index: number, field: string, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
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
        {paymentStatus === "success" && (
          <div className="bg-green-900/30 border-b border-green-800 p-4 flex items-center gap-3 text-green-400 animate-in slide-in-from-top-4">
            <PartyPopper className="h-5 w-5" />
            <p className="font-medium">¡Pago exitoso! Tu plan ha sido actualizado. Gracias por tu compra.</p>
          </div>
        )}
        {paymentStatus === "failure" && (
           <div className="bg-red-900/30 border-b border-red-800 p-4 flex items-center gap-3 text-red-400 animate-in slide-in-from-top-4">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">El pago no se pudo completar. Por favor intenta de nuevo.</p>
          </div>
        )}
        {paymentStatus === "pending" && (
           <div className="bg-amber-900/30 border-b border-amber-800 p-4 flex items-center gap-3 text-amber-400 animate-in slide-in-from-top-4">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Tu pago se está procesando. Te notificaremos cuando se complete.</p>
          </div>
        )}

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
                {!targetUserId && isAdmin && (
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'} className="ml-4 text-xs h-6 bg-blue-900/20 border-blue-800 text-blue-400 hover:bg-blue-900/40">
                        <LayoutDashboard className="mr-1 h-3 w-3" /> Panel Admin
                    </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => logout()}
                  title="Cerrar Sesión"
                  className="text-red-400 hover:text-red-300 border-red-900/30 hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                
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
                  <input type="hidden" name="logoUrl" value={previewData?.logoUrl || ""} />
                  <input type="hidden" name="bannerUrl" value={previewData?.bannerUrl || ""} />
                  <input type="hidden" name="cardBackgroundColor" value={previewData?.cardBackgroundColor || "#ffffff"} />
                  <input type="hidden" name="cardBackgroundImage" value={previewData?.cardBackgroundImage || ""} />
                  <input type="hidden" name="titleColor" value={previewData?.titleColor || "#0f172a"} />
                  <input type="hidden" name="descriptionColor" value={previewData?.descriptionColor || "#64748b"} />
                  <input type="hidden" name="galleryTitleColor" value={previewData?.galleryTitleColor || "#ffffff"} />
                  <input type="hidden" name="galleryPriceColor" value={previewData?.galleryPriceColor || "#4ade80"} />
                  <input type="hidden" name="links" value={JSON.stringify(links)} />
                  <input type="hidden" name="gallery" value={JSON.stringify(previewData?.gallery || [])} />
                  
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
              <div id="qr-code-wrapper" className="bg-white p-2">
                <QRCodeSVG value={cardUrl} size={200} />
              </div>
              <p className="mt-4 text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">{cardUrl}</p>
              <Button size="sm" className="mt-4" onClick={() => {
                  const svg = document.querySelector('#qr-code-wrapper svg');
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
                  } else {
                    alert("No se pudo generar la imagen del código QR. Por favor intenta de nuevo.");
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
            <TabButton active={activeTab === "diseno"} onClick={() => setActiveTab("diseno")} icon={<Palette size={16} />}>Diseño</TabButton>
            <TabButton active={activeTab === "redes"} onClick={() => setActiveTab("redes")} icon={<Smartphone size={16} />}>Redes</TabButton>
            <TabButton active={activeTab === "galeria"} onClick={() => setActiveTab("galeria")} icon={<ImageIcon size={16} />}>Galería</TabButton>
            <TabButton active={activeTab === "ubicacion"} onClick={() => setActiveTab("ubicacion")} icon={<MapPin size={16} />}>Ubicación</TabButton>
          </div>

          {/* Tab Content */}
          <div className="space-y-6 pb-20">
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-2">
                  <Label className="text-slate-300">Logo de la Empresa</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-lg border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden relative group">
                        {previewData?.logoUrl ? (
                            <img src={previewData.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                            <ImageIcon className="h-8 w-8 text-slate-500" />
                        )}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <Upload className="h-6 w-6 text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                        </label>
                    </div>
                    <div className="text-sm text-slate-400">
                        <p>Sube tu logo en formato PNG o JPG.</p>
                        <p className="text-xs mt-1">Recomendado: 500x500px</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Imagen de Portada (Banner)</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-full max-w-[300px] rounded-lg border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden relative group">
                        {previewData?.bannerUrl ? (
                            <img src={previewData.bannerUrl} alt="Banner" className="h-full w-full object-cover" />
                        ) : (
                            <ImageIcon className="h-8 w-8 text-slate-500" />
                        )}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <Upload className="h-6 w-6 text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                        </label>
                    </div>
                    <div className="text-sm text-slate-400">
                        <p>Aparece en la parte superior de tu tarjeta.</p>
                        <p className="text-xs mt-1">Recomendado: 1200x400px</p>
                    </div>
                  </div>
                </div>

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
                      value={slugInput} 
                      maxLength={limits.maxSlugLength || 30}
                      onChange={(e: any) => {
                        const val = e.target.value;
                        setSlugInput(val);
                        handlePreviewChange("slug", slugify(val));
                      }}
                      className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2 p-2 bg-slate-900/50 rounded border border-slate-800">
                     <span className="text-xs text-slate-400 font-mono truncate flex-1">
                        {typeof window !== 'undefined' ? `${window.location.origin}/${previewData?.slug}` : `tuvitrina.xyz/${previewData?.slug}`}
                     </span>
                     <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-slate-400 hover:text-white" onClick={handleCopySlug}>
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        <span className="ml-1 text-xs">{copied ? 'Copiado' : 'Copiar'}</span>
                     </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Puedes usar espacios y acentos, pero el enlace final se simplificará automáticamente. Máximo {limits.maxSlugLength || 30} caracteres.
                  </p>
                </div>

              </div>
            )}

            {activeTab === "diseno" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-white">Personalización Visual</h3>
                  
                  {/* Background Color & Image */}
                  <div className="space-y-4">
                    <Label className="text-slate-300">Fondo de la Tarjeta</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400">Color de Fondo</Label>
                            <div className="flex gap-2">
                                <div className="relative h-10 w-full">
                                    <input 
                                        type="color" 
                                        value={previewData?.cardBackgroundColor || "#ffffff"} 
                                        onChange={(e: any) => handlePreviewChange("cardBackgroundColor", e.target.value)}
                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                    />
                                    <div className="flex h-full w-full rounded-md border border-slate-700 bg-slate-800 overflow-hidden">
                                        <div className="w-10 h-full border-r border-slate-700" style={{ backgroundColor: previewData?.cardBackgroundColor || "#ffffff" }}></div>
                                        <div className="flex-1 flex items-center px-3 text-sm text-slate-300 font-mono">
                                            {previewData?.cardBackgroundColor || "#ffffff"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400">Imagen (Mosaico)</Label>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden relative group shrink-0">
                                    {previewData?.cardBackgroundImage ? (
                                        <img src={previewData.cardBackgroundImage} alt="Bg" className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-4 w-4 text-slate-500" />
                                    )}
                                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                        <Upload className="h-4 w-4 text-white" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundImageUpload} />
                                    </label>
                                </div>
                                {previewData?.cardBackgroundImage ? (
                                    <Button size="sm" variant="ghost" onClick={() => handlePreviewChange("cardBackgroundImage", null)} className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                        <Trash size={12} className="mr-1" /> Eliminar
                                    </Button>
                                ) : (
                                    <span className="text-xs text-slate-500">Subir imagen</span>
                                )}
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800"></div>

                  {/* Text Colors */}
                  <div className="space-y-4">
                     <Label className="text-slate-300">Colores de Texto</Label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400">Título Principal</Label>
                            <div className="relative h-9 w-full">
                                <input 
                                    type="color" 
                                    value={previewData?.titleColor || "#0f172a"} 
                                    onChange={(e: any) => handlePreviewChange("titleColor", e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                />
                                <div className="flex h-full w-full rounded-md border border-slate-700 bg-slate-800 overflow-hidden">
                                    <div className="w-9 h-full border-r border-slate-700" style={{ backgroundColor: previewData?.titleColor || "#0f172a" }}></div>
                                    <div className="flex-1 flex items-center px-3 text-xs text-slate-300 font-mono">
                                        {previewData?.titleColor || "#0f172a"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400">Descripción</Label>
                            <div className="relative h-9 w-full">
                                <input 
                                    type="color" 
                                    value={previewData?.descriptionColor || "#64748b"} 
                                    onChange={(e: any) => handlePreviewChange("descriptionColor", e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                />
                                <div className="flex h-full w-full rounded-md border border-slate-700 bg-slate-800 overflow-hidden">
                                    <div className="w-9 h-full border-r border-slate-700" style={{ backgroundColor: previewData?.descriptionColor || "#64748b" }}></div>
                                    <div className="flex-1 flex items-center px-3 text-xs text-slate-300 font-mono">
                                        {previewData?.descriptionColor || "#64748b"}
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                  </div>

                  <div className="border-t border-slate-800"></div>

                  <div className="space-y-4">
                     <Label className="text-slate-300">Estilo de Galería</Label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400">Color de Títulos</Label>
                            <div className="relative h-9 w-full">
                                <input 
                                    type="color" 
                                    value={previewData?.galleryTitleColor || "#ffffff"} 
                                    onChange={(e: any) => handlePreviewChange("galleryTitleColor", e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                />
                                <div className="flex h-full w-full rounded-md border border-slate-700 bg-slate-800 overflow-hidden">
                                    <div className="w-9 h-full border-r border-slate-700" style={{ backgroundColor: previewData?.galleryTitleColor || "#ffffff" }}></div>
                                    <div className="flex-1 flex items-center px-3 text-xs text-slate-300 font-mono">
                                        {previewData?.galleryTitleColor || "#ffffff"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400">Color de Precios</Label>
                            <div className="relative h-9 w-full">
                                <input 
                                    type="color" 
                                    value={previewData?.galleryPriceColor || "#4ade80"} 
                                    onChange={(e: any) => handlePreviewChange("galleryPriceColor", e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                />
                                <div className="flex h-full w-full rounded-md border border-slate-700 bg-slate-800 overflow-hidden">
                                    <div className="w-9 h-full border-r border-slate-700" style={{ backgroundColor: previewData?.galleryPriceColor || "#4ade80" }}></div>
                                    <div className="flex-1 flex items-center px-3 text-xs text-slate-300 font-mono">
                                        {previewData?.galleryPriceColor || "#4ade80"}
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="border-t border-slate-800"></div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300 flex items-center gap-2">
                        <Palette size={16} /> Color de Acento (Tema)
                      </Label>
                      {!limits.allowThemeColor && <LockBadge />}
                    </div>
                    
                    {limits.allowThemeColor ? (
                      <div className="relative h-10 w-full max-w-[200px]">
                        <input 
                          type="color" 
                          value={previewData?.themeColor || "#000000"}
                          onChange={(e) => handlePreviewChange("themeColor", e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                        />
                         <div className="flex h-full w-full rounded-md border border-slate-700 bg-slate-800 overflow-hidden">
                            <div className="w-10 h-full border-r border-slate-700" style={{ backgroundColor: previewData?.themeColor || "#000000" }}></div>
                            <div className="flex-1 flex items-center px-3 text-sm text-slate-300 font-mono">
                                {previewData?.themeColor || "#000000"}
                            </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 text-sm text-slate-400 flex items-center gap-3">
                        <Lock size={16} />
                        Actualiza a plan Emprendedor para personalizar colores.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {activeTab === "redes" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">Mis Redes Sociales</h3>
                    <Button size="sm" onClick={addLink} className="gap-2">
                        <Plus size={16} /> Agregar Link
                    </Button>
                </div>
                
                <div className="space-y-4">
                    {links.length === 0 && (
                        <div className="text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                            <Smartphone className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>No has agregado ninguna red social aún.</p>
                        </div>
                    )}
                    
                    {links.map((link: any, index: number) => (
                        <div key={index} className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 flex flex-col gap-3 group">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-400">Etiqueta (Ej. WhatsApp)</Label>
                                            <Input 
                                                value={link.label} 
                                                onChange={(e: any) => updateLink(index, "label", e.target.value)}
                                                placeholder="Nombre de la red"
                                                className="bg-slate-800 border-slate-700 h-8"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-400">Icono</Label>
                                            <select 
                                                value={link.icon} 
                                                onChange={(e) => updateLink(index, "icon", e.target.value)}
                                                className="flex h-8 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                                            >
                                                <option value="Link">Enlace General</option>
                                                <option value="Facebook">Facebook</option>
                                                <option value="Instagram">Instagram</option>
                                                <option value="Twitter">Twitter / X</option>
                                                <option value="Linkedin">LinkedIn</option>
                                                <option value="Youtube">YouTube</option>
                                                <option value="Whatsapp">WhatsApp</option>
                                                <option value="Tiktok">TikTok</option>
                                                <option value="MapPin">Ubicación</option>
                                                <option value="Mail">Email</option>
                                                <option value="Phone">Teléfono</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-400">URL / Enlace</Label>
                                        <Input 
                                            value={link.url} 
                                            onChange={(e: any) => updateLink(index, "url", e.target.value)}
                                            placeholder="https://..."
                                            className="bg-slate-800 border-slate-700 h-8 font-mono text-xs"
                                        />
                                    </div>
                                </div>
                                <Button 
                                    size="icon" 
                                    variant="destructive" 
                                    onClick={() => removeLink(index)}
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Eliminar"
                                >
                                    <Trash size={14} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
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
                     {previewData?.gallery?.map((img: any, index: number) => (
                        <div key={index} className="aspect-square bg-slate-800 rounded-lg relative group overflow-hidden">
                           <img src={img.imageUrl} alt="Gallery" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                              <Button size="sm" variant="secondary" onClick={() => setEditingImage({ ...img, index })}>
                                <Edit size={14} className="mr-1" /> Editar
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => removeGalleryImage(index)}>
                                <Trash size={14} className="mr-1" /> Eliminar
                              </Button>
                           </div>
                           {(img.price || img.title) && (
                             <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-white truncate">
                               {img.title && <span className="block font-bold truncate">{img.title}</span>}
                               {img.price && <span className="block text-green-400">${img.price}</span>}
                             </div>
                           )}
                        </div>
                     ))}
                     
                     {/* Add Image Button */}
                     <div className="relative aspect-square bg-slate-800 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors group">
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={handleGalleryUpload}
                            disabled={(previewData?.gallery?.length || 0) >= limits.galleryImages}
                        />
                        <ImageIcon size={24} className="mb-2" />
                        <span className="text-xs">
                          {(previewData?.gallery?.length || 0) >= limits.galleryImages ? "Límite Alcanzado" : "Subir Imagen"}
                        </span>
                     </div>
                   </div>
                 )}

                   {/* Image Edit Modal */}
                   {editingImage && (
                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                       <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                         <button 
                           onClick={() => setEditingImage(null)}
                           className="absolute top-4 right-4 text-slate-400 hover:text-white"
                         >
                           ✕
                         </button>
                         <h3 className="text-lg font-bold text-white mb-4">Editar Imagen</h3>
                         
                         <div className="space-y-4">
                           <div className="aspect-video rounded-lg overflow-hidden bg-slate-800">
                             <img src={editingImage.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                           </div>
                           
                           <div className="space-y-2">
                             <Label>Título / Nombre</Label>
                             <Input 
                               value={editingImage.title || ""} 
                               onChange={(e: any) => setEditingImage({ ...editingImage, title: e.target.value })}
                               placeholder="Ej: Cartera de Cuero"
                               className="bg-slate-800 border-slate-700"
                             />
                           </div>
                           
                           <div className="space-y-2">
                             <Label>Precio</Label>
                             <Input 
                               type="number"
                               value={editingImage.price || ""} 
                               onChange={(e: any) => setEditingImage({ ...editingImage, price: e.target.value })}
                               placeholder="0.00"
                               className="bg-slate-800 border-slate-700"
                             />
                           </div>
                           
                           <div className="flex justify-end gap-2 mt-4">
                             <Button variant="ghost" onClick={() => setEditingImage(null)}>Cancelar</Button>
                             <Button onClick={() => {
                               updateGalleryImage(editingImage.index, "title", editingImage.title);
                               updateGalleryImage(editingImage.index, "price", editingImage.price);
                               setEditingImage(null);
                             }}>
                               Guardar
                             </Button>
                           </div>
                         </div>
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
             <div 
               className="h-40 relative flex items-center justify-center transition-colors duration-300 bg-cover bg-center bg-no-repeat" 
               style={{ 
                 backgroundColor: previewData?.themeColor || '#000000',
                 backgroundImage: previewData?.bannerUrl ? `url(${previewData.bannerUrl})` : undefined
               }}
             >
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
                {/* Links Preview */}
                <div className="space-y-3">
                   {links.length > 0 ? (
                     links.map((link: any, index: number) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
                         <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-700">
                            {/* Generic icon for preview */}
                            <span className="text-lg">🔗</span>
                         </div>
                         <span className="font-medium text-slate-700 flex-1 text-left truncate">{link.label || "Enlace"}</span>
                         <span className="text-slate-400">↗</span>
                      </div>
                     ))
                   ) : (
                     <div className="text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-xs">Agrega enlaces para verlos aquí.</p>
                     </div>
                   )}
                </div>

                {/* Gallery Preview */}
                {(previewData?.gallery?.length || 0) > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Galería</h3>
                   <div className="grid grid-cols-2 gap-2">
                       {previewData?.gallery?.map((img: any, i: number) => (
                         <div key={i} className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative">
                           <img src={img.imageUrl} alt="Gallery" className="w-full h-full object-cover" />
                           {(img.price || img.title) && (
                             <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6 text-white">
                               {img.title && (
                                 <p className="text-[10px] font-medium truncate leading-tight">{img.title}</p>
                               )}
                               {img.price && (
                                 <p className="text-xs font-bold text-green-400 leading-tight">
                                   ${parseFloat(img.price).toLocaleString()}
                                 </p>
                               )}
                             </div>
                           )}
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* Location Preview */}
                {limits.allowLocation && previewData?.location && (
                   <div className="mt-6">
                      <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Ubicación</h3>
                      <div className="rounded-xl overflow-hidden border border-slate-100 h-40 bg-slate-100 relative">
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
