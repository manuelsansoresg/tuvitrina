"use client";

import { useState, useTransition } from "react";
import { updateBusinessCard } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, Plus, Trash, GripVertical, Image as ImageIcon, 
  MapPin, Link as LinkIcon, Save, Eye, Smartphone, 
  LayoutTemplate, Palette, Lock, Upload, Check, Copy, X, ArrowLeft,
  Info, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle, Mail, Phone, Globe
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormStatus } from "react-dom";
import { slugify } from "@/lib/utils";
import { PlanType, Role, BusinessCard, Link as LinkModel, GalleryImage, Product } from "@prisma/client";
import { PLAN_LIMITS } from "@/lib/constants";

// Extended types including relations
interface ExtendedBusinessCard extends BusinessCard {
  links: LinkModel[];
  gallery: GalleryImage[];
  products: Product[];
}

interface DashboardClientProps {
  data: {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      plan: PlanType;
      role?: Role;
      businessCard: ExtendedBusinessCard | null;
    };
    limits?: typeof PLAN_LIMITS.EXPRESS;
  };
  targetUserId?: string;
  isSessionAdmin?: boolean;
}

const LINK_ICONS = [
  { value: "link", label: "Enlace", icon: LinkIcon },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "twitter", label: "Twitter", icon: Twitter },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Teléfono", icon: Phone },
  { value: "map", label: "Mapa", icon: MapPin },
  { value: "website", label: "Sitio Web", icon: Globe },
];

export function DashboardClient({ data, targetUserId, isSessionAdmin }: DashboardClientProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [isPending, startTransition] = useTransition();
  
  // Use extended type or fallback to any if types are still propagating
  const [previewData, setPreviewData] = useState<ExtendedBusinessCard | null>(data.user.businessCard as any);
  
  // State for slug input separate from preview to handle debouncing/validation if needed
  const [slugInput, setSlugInput] = useState(data.user.businessCard?.slug || "");
  const [copied, setCopied] = useState(false);

  // Form states
  const [links, setLinks] = useState<LinkModel[]>(
    data.user.businessCard?.links.sort((a, b) => a.order - b.order) || []
  );
  
  const [gallery, setGallery] = useState<GalleryImage[]>(
    data.user.businessCard?.gallery.sort((a, b) => a.order - b.order) || []
  );

  const [products, setProducts] = useState<Product[]>(
    data.user.businessCard?.products || []
  );

  const currentPlan = data.user.plan as PlanType; // Ensure type safety
  const limits = data.limits || PLAN_LIMITS[currentPlan] || PLAN_LIMITS.EXPRESS;
  // Use session admin status if provided, otherwise fallback to user role (only valid for own profile)
  const isAdmin = isSessionAdmin ?? (data.user.role === Role.ADMIN);

  const handlePreviewChange = (field: string, value: any) => {
    setPreviewData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleCopySlug = () => {
    const url = `${window.location.origin}/${previewData?.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      description: "Enlace copiado al portapapeles",
    });
  };

  const resizeImage = (file: File, maxWidth: number = 800): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Archivo muy grande",
          description: "La imagen no debe superar los 2MB",
        });
        return;
      }
      
      const resized = await resizeImage(file, 200);
      handlePreviewChange("logoUrl", resized);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Archivo muy grande",
          description: "El banner no debe superar los 4MB",
        });
        return;
      }
      
      const resized = await resizeImage(file, 800);
      handlePreviewChange("bannerUrl", resized);
    }
  };

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Archivo muy grande",
          description: "La imagen no debe superar los 4MB",
        });
        return;
      }
      
      const resized = await resizeImage(file, 800);
      handlePreviewChange("cardBackgroundImage", resized);
    }
  };

  const handleAddLink = () => {
    if (links.length >= limits.links) {
       toast({
         variant: "destructive",
         title: "Límite alcanzado",
         description: `Tu plan permite máximo ${limits.links} enlaces.`,
       });
       return;
    }
    setLinks([...links, { 
       id: crypto.randomUUID(), 
       label: "", 
       url: "", 
       order: links.length,
       icon: "link",
       cardId: data.user.businessCard?.id || ""
     }]);
   };

  const handleRemoveLink = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    setLinks(newLinks);
  };

  const handleLinkChange = (index: number, field: keyof LinkModel, value: any) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const handleAddGalleryImage = () => {
     if (gallery.length >= limits.galleryImages) {
       toast({
         variant: "destructive",
         title: "Límite alcanzado",
         description: `Tu plan permite máximo ${limits.galleryImages} imágenes.`,
       });
       return;
    }
    document.getElementById('gallery-upload')?.click();
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
       if (file.size > 4 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Archivo muy grande",
          description: "La imagen no debe superar los 4MB",
        });
        return;
      }
      
      const resized = await resizeImage(file, 800);
      setGallery([...gallery, { 
        id: crypto.randomUUID(), 
        imageUrl: resized, 
        order: gallery.length,
        title: null,
        price: null,
        cardId: data.user.businessCard?.id || ""
      }]);
    }
    e.target.value = '';
  };

  const handleRemoveGalleryImage = (index: number) => {
    const newGallery = [...gallery];
    newGallery.splice(index, 1);
    setGallery(newGallery);
  };
  
  const handleGalleryImageChange = (index: number, field: keyof GalleryImage, value: any) => {
    const newGallery = [...gallery];
    newGallery[index] = { ...newGallery[index], [field]: value };
    setGallery(newGallery);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-200">
      {/* Left Panel - Editor */}
      <div className="w-full lg:w-1/2 flex flex-col border-r border-slate-800">
        {/* Toolbar */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {isAdmin && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => window.location.href = '/dashboard'}
                    className="mr-2 text-slate-400 hover:text-white"
                    title="Volver a Admin"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            )}
            
            <TabButton active={activeTab === "info"} onClick={() => setActiveTab("info")} icon={<Info size={18} />}>
              Info
            </TabButton>
            
            <TabButton active={activeTab === "enlaces"} onClick={() => setActiveTab("enlaces")} icon={<LinkIcon size={18} />}>
              Enlaces
            </TabButton>
            
            {limits.galleryImages > 0 && (
                <TabButton active={activeTab === "galeria"} onClick={() => setActiveTab("galeria")} icon={<ImageIcon size={18} />}>
                  Galería
                </TabButton>
            )}
            
            {limits.allowThemeColor && (
                <TabButton active={activeTab === "diseno"} onClick={() => setActiveTab("diseno")} icon={<Palette size={18} />}>
                  Diseño
                </TabButton>
            )}
            
            {/* Pestaña de Productos (Deshabilitada por solicitud) */}
            {/* {limits.products > 0 && (
                <TabButton active={activeTab === "productos"} onClick={() => setActiveTab("productos")} icon={<LayoutTemplate size={18} />}>
                  Productos
                </TabButton>
            )} */}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden text-slate-400">
              <Eye size={20} />
            </Button>
          </div>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form action={async (formData) => {
             formData.append("targetUserId", data.user.id);
 
              // Append complex objects as JSON strings
              formData.append("links", JSON.stringify(links));
            formData.append("gallery", JSON.stringify(gallery));
            formData.append("products", JSON.stringify(products));
            
            // Add design fields and basic info manually since they might not be in DOM if tab is hidden
            if (previewData) {
               formData.set("title", previewData.title || "");
               formData.set("description", previewData.description || "");
               formData.set("slug", previewData.slug || "");
               formData.set("logoUrl", previewData.logoUrl || "");
               formData.set("bannerUrl", previewData.bannerUrl || "");
               formData.set("themeColor", previewData.themeColor || "");
               formData.set("location", previewData.location || "");
               
               formData.append("cardBackgroundColor", previewData.cardBackgroundColor || "");
               formData.append("cardBackgroundImage", previewData.cardBackgroundImage || "");
               formData.append("titleColor", previewData.titleColor || "");
               formData.append("descriptionColor", previewData.descriptionColor || "");
               formData.append("iconColor", previewData.iconColor || "");
               formData.append("galleryTitleColor", previewData.galleryTitleColor || "");
               formData.append("galleryPriceColor", previewData.galleryPriceColor || "");
            }

            const result = await updateBusinessCard(null, formData);
            if (result.success) {
              toast({ description: "Cambios guardados correctamente" });
            } else {
              toast({ variant: "destructive", description: result.message });
            }
          }} className="space-y-8 max-w-2xl mx-auto pb-20">
            
            <input type="hidden" name="id" value={data.user.businessCard?.id} />

            {/* Pestaña de Información Básica */}
            {activeTab === "info" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Información Básica</h3>
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden cursor-pointer transition-colors hover:border-blue-500">
                        {previewData?.logoUrl ? (
                          <img src={previewData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-slate-500" />
                        )}
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload size={20} className="text-white mb-1" />
                          <span className="text-[10px] text-white font-medium">Cambiar</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={handleLogoUpload}
                        />
                      </div>
                      <p className="text-center text-xs text-slate-500 mt-2">Logo</p>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-slate-300">Nombre del Negocio</Label>
                        <Input 
                          id="title" 
                          name="title" 
                          defaultValue={previewData?.title} 
                          onChange={(e) => handlePreviewChange("title", e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500"
                          placeholder="Ej. Tacos El Pastor"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-300">Descripción Corta</Label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          defaultValue={previewData?.description || ""} 
                          onChange={(e) => handlePreviewChange("description", e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500 min-h-[80px]"
                          placeholder="¿Qué hace especial a tu negocio?"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div className="space-y-2">
                     <Label className="text-slate-300">Imagen de Portada (Banner)</Label>
                     <div className="relative h-32 w-full rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center overflow-hidden group hover:border-blue-500 transition-colors">
                        {previewData?.bannerUrl ? (
                           <>
                              <img src={previewData.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <Button size="sm" variant="secondary" className="shadow-lg">
                                    <Upload size={16} className="mr-2" /> Cambiar Banner
                                 </Button>
                              </div>
                           </>
                        ) : (
                           <div className="text-center p-4">
                              <ImageIcon className="mx-auto h-8 w-8 text-slate-500 mb-2" />
                              <p className="text-sm text-slate-400">Arrastra una imagen o haz clic para subir</p>
                              <p className="text-xs text-slate-600 mt-1">Recomendado: 1200x400px</p>
                           </div>
                        )}
                        <input 
                           type="file" 
                           accept="image/*" 
                           className="absolute inset-0 opacity-0 cursor-pointer" 
                           onChange={handleBannerUpload}
                        />
                     </div>
                  </div>

                  {/* Slug / URL */}
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
                    <Label htmlFor="slug" className="text-slate-300 flex items-center justify-between">
                      <span>Enlace Personalizado</span>
                      <span className="text-xs text-slate-500 font-normal">
                         {slugInput.length}/{limits.maxSlugLength || 30}
                      </span>
                    </Label>
                    <div className="flex items-center gap-2">
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
              </div>
            )}

            {/* Pestaña de Enlaces */}
            {activeTab === "enlaces" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <Label className="text-slate-300">Enlaces ({links.length}/{limits.links})</Label>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={handleAddLink}
                            className="h-8 text-xs border-dashed border-slate-600 hover:border-blue-500 hover:text-blue-400"
                        >
                            <Plus size={14} className="mr-1" /> Agregar
                        </Button>
                        </div>
                        
                        <div className="space-y-3">
                        {links.map((link, index) => (
                            <div key={link.id} className="group p-3 bg-slate-800/50 rounded-xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                <div className="cursor-move text-slate-600 hover:text-slate-400">
                                    <GripVertical size={16} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Input 
                                    placeholder="Título del enlace" 
                                    value={link.label}
                                    onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                                    className="h-8 text-xs bg-slate-900 border-slate-700 focus:border-blue-500"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Select 
                                        value={link.icon || "link"} 
                                        onValueChange={(val) => handleLinkChange(index, "icon", val)}
                                      >
                                        <SelectTrigger className="w-[50px] h-8 p-0 flex items-center justify-center bg-slate-900 border-slate-700 text-slate-500 focus:border-blue-500 shrink-0">
                                          {(() => {
                                              const selectedIcon = LINK_ICONS.find(i => i.value === (link.icon || "link")) || LINK_ICONS[0];
                                              const IconComp = selectedIcon.icon;
                                              return <IconComp size={14} />;
                                          })()}
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 max-h-[200px]">
                                          {LINK_ICONS.map((iconOption) => (
                                            <SelectItem key={iconOption.value} value={iconOption.value} className="text-slate-200 focus:bg-slate-800 focus:text-white cursor-pointer">
                                              <div className="flex items-center gap-2">
                                                <iconOption.icon size={14} className="text-slate-400" />
                                                <span className="text-xs">{iconOption.label}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {link.icon === 'whatsapp' ? (
                                        <div className="flex flex-1 items-center gap-2">
                                            <span className="text-xs text-slate-500 font-mono whitespace-nowrap bg-slate-900/50 px-2 h-8 flex items-center rounded border border-slate-700">https://wa.me/</span>
                                            <Input 
                                                placeholder="521..." 
                                                value={link.url.replace('https://wa.me/', '')}
                                                onChange={(e) => {
                                                    const cleanNumber = e.target.value.replace(/[^0-9]/g, '');
                                                    handleLinkChange(index, "url", `https://wa.me/${cleanNumber}`);
                                                }}
                                                className="h-8 text-xs bg-slate-900 border-slate-700 focus:border-blue-500 font-mono flex-1"
                                            />
                                        </div>
                                      ) : (
                                        <Input 
                                            placeholder="https://..." 
                                            value={link.url}
                                            onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                                            className="h-8 text-xs bg-slate-900 border-slate-700 focus:border-blue-500 font-mono flex-1"
                                        />
                                      )}
                                    </div>
                                </div>
                                <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemoveLink(index)}
                                className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-900/20"
                                >
                                <Trash size={14} />
                                </Button>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Pestaña de Galería */}
            {activeTab === "galeria" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-slate-300">Galería ({gallery.length}/{limits.galleryImages})</Label>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={handleAddGalleryImage}
                                className="h-8 text-xs border-dashed border-slate-600 hover:border-blue-500 hover:text-blue-400"
                            >
                                <Plus size={14} className="mr-1" /> Agregar Imagen
                            </Button>
                            <input 
                                type="file" 
                                id="gallery-upload" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleGalleryImageUpload}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                        {gallery.map((img, index) => (
                            <div key={img.id} className="relative group bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                                <div className="aspect-square relative">
                                    <img src={img.imageUrl} alt="Gallery" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button 
                                        type="button" 
                                        variant="destructive" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => handleRemoveGalleryImage(index)}
                                    >
                                        <Trash size={14} />
                                    </Button>
                                    </div>
                                </div>
                                <div className="p-2 space-y-2 bg-slate-900/50">
                                    <Input 
                                    placeholder="Título (opcional)" 
                                    value={img.title || ""} 
                                    onChange={(e) => handleGalleryImageChange(index, "title", e.target.value)}
                                    className="h-7 text-[10px] bg-slate-950 border-slate-800 focus:border-blue-500 px-2"
                                    />
                                    <Input 
                                    type="number"
                                    placeholder="Precio (opcional)" 
                                    value={img.price || ""} 
                                    onChange={(e) => handleGalleryImageChange(index, "price", e.target.value)}
                                    className="h-7 text-[10px] bg-slate-950 border-slate-800 focus:border-blue-500 px-2"
                                    />
                                </div>
                            </div>
                        ))}
                        
                        {gallery.length < limits.galleryImages && (
                            <button 
                                type="button"
                                onClick={handleAddGalleryImage}
                                className="aspect-square rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/30 hover:bg-slate-800 hover:border-slate-700 transition-all flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-300"
                            >
                                <Plus size={24} />
                                <span className="text-xs">Agregar</span>
                            </button>
                        )}
                        </div>
                    </div>
                </div>
            )}

            {/* Pestaña de Diseño */}
            {activeTab === "diseno" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Personalización Visual</h3>
                    {!limits.allowThemeColor && <LockBadge />}
                  </div>

                  {!limits.allowThemeColor && (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 text-sm text-slate-400 flex items-center gap-3">
                      <Lock size={16} className="text-yellow-500" />
                      <span>Actualiza a plan Emprendedor o Premium para personalizar todos los colores y fondos.</span>
                    </div>
                  )}
                  
                  {/* Background Color & Image */}
                  <div className={`space-y-4 ${!limits.allowThemeColor ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Label className="text-slate-300">Fondo de la Tarjeta</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="space-y-2">
                            <ColorPicker 
                              label="Color de Fondo" 
                              value={previewData?.cardBackgroundColor || "#ffffff"} 
                              onChange={(val) => handlePreviewChange("cardBackgroundColor", val)}
                              disabled={!limits.allowThemeColor}
                            />
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
                                    <label className={`absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity ${!limits.allowThemeColor ? 'hidden' : ''}`}>
                                        <Upload className="h-4 w-4 text-white" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundImageUpload} disabled={!limits.allowThemeColor} />
                                    </label>
                                </div>
                                {previewData?.cardBackgroundImage ? (
                                    <Button size="sm" variant="ghost" onClick={() => handlePreviewChange("cardBackgroundImage", null)} disabled={!limits.allowThemeColor} className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20">
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
                  <div className={`space-y-4 ${!limits.allowThemeColor ? 'opacity-50 pointer-events-none' : ''}`}>
                     <Label className="text-slate-300">Colores de Texto</Label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <ColorPicker 
                              label="Título Principal" 
                              value={previewData?.titleColor || "#0f172a"} 
                              onChange={(val) => handlePreviewChange("titleColor", val)} 
                              disabled={!limits.allowThemeColor}
                            />
                        </div>

                        <div className="space-y-2">
                            <ColorPicker 
                              label="Descripción" 
                              value={previewData?.descriptionColor || "#64748b"} 
                              onChange={(val) => handlePreviewChange("descriptionColor", val)} 
                              disabled={!limits.allowThemeColor}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-slate-400">Color de Iconos</Label>
                                {previewData?.iconColor && (
                                    <button 
                                        type="button"
                                        onClick={() => handlePreviewChange("iconColor", null)}
                                        className="text-[10px] text-blue-400 hover:text-blue-300"
                                    >
                                        Restaurar originales
                                    </button>
                                )}
                            </div>
                            <ColorPicker 
                              value={previewData?.iconColor || "#334155"} 
                              onChange={(val) => handlePreviewChange("iconColor", val)} 
                              disabled={!limits.allowThemeColor}
                            />
                        </div>
                     </div>
                  </div>

                  <div className="border-t border-slate-800"></div>

                  <div className={`space-y-4 ${!limits.allowThemeColor ? 'opacity-50 pointer-events-none' : ''}`}>
                     <Label className="text-slate-300">Estilo de Galería</Label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <ColorPicker 
                              label="Color de Títulos" 
                              value={previewData?.galleryTitleColor || "#ffffff"} 
                              onChange={(val) => handlePreviewChange("galleryTitleColor", val)} 
                              disabled={!limits.allowThemeColor}
                            />
                        </div>

                        <div className="space-y-2">
                            <ColorPicker 
                              label="Color de Precios" 
                              value={previewData?.galleryPriceColor || "#4ade80"} 
                              onChange={(val) => handlePreviewChange("galleryPriceColor", val)} 
                              disabled={!limits.allowThemeColor}
                            />
                        </div>
                     </div>
                  </div>
                  
                  <div className="border-t border-slate-800"></div>

                  <div className={`space-y-4 ${!limits.allowThemeColor ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300 flex items-center gap-2">
                        <Palette size={16} /> Color de Acento (Tema)
                      </Label>
                    </div>
                    
                    <div className="max-w-[200px]">
                      <ColorPicker 
                        value={previewData?.themeColor || "#000000"} 
                        onChange={(val) => handlePreviewChange("themeColor", val)} 
                        disabled={!limits.allowThemeColor}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-1/2 lg:w-1/2 border-t border-slate-800 bg-slate-900/90 backdrop-blur p-4 flex items-center justify-between z-20">
              <p className="text-xs text-slate-500 hidden sm:block">
                Los cambios se guardan al hacer clic en Guardar
              </p>
              <SaveButton />
            </div>

          </form>
        </div>
      </div>

      {/* Right Panel - Mobile Preview */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 items-center justify-center relative p-8 border-l border-slate-800">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        
        <div className="relative w-[375px] h-[750px] bg-slate-950 rounded-[40px] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col transform transition-transform hover:scale-[1.01] duration-500">
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
                            {(() => {
                               const iconObj = LINK_ICONS.find(i => i.value === link.icon) || LINK_ICONS[0];
                               const IconComp = iconObj.icon;
                               return <IconComp size={20} className={link.icon === 'whatsapp' ? 'text-green-600' : link.icon === 'instagram' ? 'text-pink-600' : link.icon === 'facebook' ? 'text-blue-600' : link.icon === 'youtube' ? 'text-red-600' : 'text-slate-700'} style={{ color: previewData?.iconColor || undefined }} />;
                            })()}
                         </div>
                         <div className="flex-1 min-w-0">
                             <p className="font-medium text-slate-700 truncate text-sm">{link.label || "Enlace"}</p>
                             <p className="text-[10px] text-slate-400 truncate font-mono">
                                {link.icon === 'whatsapp' ? link.url.replace('https://wa.me/', '+') : link.url}
                             </p>
                         </div>
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

function ColorPicker({ 
  label, 
  value, 
  onChange, 
  disabled = false 
}: { 
  label?: string, 
  value: string, 
  onChange: (val: string) => void, 
  disabled?: boolean 
}) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-xs text-slate-400">{label}</Label>}
      <div className="flex gap-2 items-center">
        <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-md border border-slate-700 bg-slate-800 shadow-sm">
           <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: value }}></div>
           <input 
                type="color" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            />
        </div>
        <div className="flex-1">
          <Input 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="h-10 bg-slate-800 border-slate-700 font-mono"
          />
        </div>
      </div>
    </div>
  );
}
