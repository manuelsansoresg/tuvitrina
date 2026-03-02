"use client";

import { useState } from "react";
import { createAdminUser, toggleUserStatus, deleteUser, updateUser } from "@/actions/admin";
import { logout } from "@/actions/auth";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Users, DollarSign, Activity, Edit, Trash, Eye, EyeOff, Plus, Shield, Settings, X, Check, ArrowUpRight, LogOut, LayoutTemplate, CreditCard } from "lucide-react";

// --- Custom UI Components ---

const Button = ({ className, variant = "default", size = "default", ...props }: any) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-slate-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
  const variants = {
    default: "bg-blue-600 text-slate-50 hover:bg-blue-600/90",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
    outline: "border border-slate-800 bg-slate-950 hover:bg-slate-800 hover:text-slate-50",
    ghost: "hover:bg-slate-800 hover:text-slate-50",
    link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-50",
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

const Input = ({ className, ...props }: any) => (
  <input className={`flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white ${className}`} {...props} />
);

const Select = ({ className, children, ...props }: any) => (
  <div className="relative">
    <select className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm ring-offset-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white appearance-none ${className}`} {...props}>
      {children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
      <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
);

const Badge = ({ className, variant = "default", children, ...props }: any) => {
  const variants = {
    default: "border-transparent bg-slate-800 text-slate-50 hover:bg-slate-800/80",
    outline: "text-slate-400 border border-slate-800",
    success: "border-transparent bg-green-900/30 text-green-400 hover:bg-green-900/40",
    warning: "border-transparent bg-amber-900/30 text-amber-400 hover:bg-amber-900/40",
    destructive: "border-transparent bg-red-900/30 text-red-400 hover:bg-red-900/40",
  };
  // @ts-ignore
  const variantStyles = variants[variant] || variants.default;
  return <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${variantStyles} ${className}`} {...props}>{children}</div>;
};

const Card = ({ className, children, ...props }: any) => <div className={`rounded-lg border border-slate-800 bg-slate-950 text-slate-50 shadow-sm ${className}`} {...props}>{children}</div>;
const CardHeader = ({ className, children, ...props }: any) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>;
const CardTitle = ({ className, children, ...props }: any) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</h3>;
const CardContent = ({ className, children, ...props }: any) => <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>;

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-lg animate-in zoom-in-95 duration-200 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-slate-950 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 disabled:pointer-events-none text-slate-400 hover:text-slate-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </button>
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <h3 className="text-lg font-semibold leading-none tracking-tight text-white">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Main Component ---

type AdminClientProps = {
  initialUsers: any[];
  stats: any;
  currentUserEmail?: string | null;
};

export default function AdminClient({ initialUsers, stats, currentUserEmail }: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<"users" | "finances">("users");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Panel de Administración
          </h1>
          <p className="text-slate-400 mt-1">Gestión global del sistema Tuvitrina.xyz</p>
        </div>
        
        <div className="flex gap-2">
            <Button 
                variant="outline"
                onClick={() => window.location.href = '/dashboard?view=card'}
                className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-blue-400"
                title="Ir a mi Tarjeta"
            >
                <LayoutTemplate className="mr-2 h-4 w-4" /> Mi Tarjeta
            </Button>
            
            <Button 
                variant="outline"
                onClick={() => logout()}
                className="bg-slate-900 border-red-900/30 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                title="Cerrar Sesión"
            >
                <LogOut className="mr-2 h-4 w-4" /> Salir
            </Button>

            <div className="w-px h-8 bg-slate-800 mx-2 hidden md:block"></div>

            <Button 
                variant={activeTab === "users" ? "default" : "outline"} 
                onClick={() => setActiveTab("users")}
                className={activeTab === "users" ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-900 border-slate-700 hover:bg-slate-800"}
            >
                <Users className="mr-2 h-4 w-4" /> Usuarios
            </Button>
            <Button 
                variant={activeTab === "finances" ? "default" : "outline"}
                onClick={() => setActiveTab("finances")}
                className={activeTab === "finances" ? "bg-green-600 hover:bg-green-700" : "bg-slate-900 border-slate-700 hover:bg-slate-800"}
            >
                <DollarSign className="mr-2 h-4 w-4" /> Finanzas
            </Button>
        </div>
      </header>

      {activeTab === "users" && (
        <UsersPanel 
            users={initialUsers} 
            currentUserEmail={currentUserEmail} 
            isCreateModalOpen={isCreateModalOpen}
            setIsCreateModalOpen={setIsCreateModalOpen}
            isEditModalOpen={isEditModalOpen}
            setIsEditModalOpen={setIsEditModalOpen}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
        />
      )}

      {activeTab === "finances" && (
        <FinancesPanel stats={stats} />
      )}
    </div>
  );
}

function UsersPanel({ 
    users, 
    currentUserEmail, 
    isCreateModalOpen, 
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedUser,
    setSelectedUser
}: any) {
    const [createUserState, createUserDispatch] = useActionState(createAdminUser, null);
    const [updateUserState, updateUserDispatch] = useActionState(updateUser, null);
    const router = useRouter();
    const superAdminEmail = "manuelsansoresg@gmail.com";
    
    // Check if current user is Super Admin
    const isSuperAdmin = currentUserEmail === superAdminEmail;

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Listado de Usuarios</h2>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
                </Button>
            </div>

            {users.length <= 1 && (
              <div className="p-4 bg-blue-900/20 text-blue-200 rounded-md border border-blue-800 flex items-center gap-2">
                <Users className="h-5 w-5" />
                <p>Solo estás tú en el sistema. ¡Crea un nuevo usuario para probar las funciones de gestión!</p>
              </div>
            )}

            {/* Create User Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Crear Nuevo Usuario">
                <form action={createUserDispatch} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Nombre</label>
                        <Input name="name" placeholder="Nombre completo" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email</label>
                        <Input name="email" type="email" placeholder="usuario@ejemplo.com" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Contraseña</label>
                        <Input name="password" type="password" placeholder="******" required minLength={6} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Rol</label>
                            <Select name="role" defaultValue="USER">
                                <option value="USER">Usuario</option>
                                {isSuperAdmin && <option value="ADMIN">Administrador</option>}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Plan</label>
                            <Select name="plan" defaultValue="EXPRESS">
                                <option value="EXPRESS">Express</option>
                                <option value="EMPRENDEDOR">Emprendedor</option>
                                <option value="PREMIUM">Premium</option>
                            </Select>
                        </div>
                    </div>
                    
                    {createUserState?.message && (
                        <p className={`text-sm ${createUserState.success ? 'text-green-400' : 'text-red-400'}`}>
                            {createUserState.message}
                        </p>
                    )}

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4">Crear Usuario</Button>
                </form>
            </Modal>

            {/* Edit User Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Usuario">
                {selectedUser && (
                    <form key={selectedUser.id} action={updateUserDispatch} className="space-y-4">
                        <input type="hidden" name="id" value={selectedUser.id} />
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Nombre</label>
                            <Input name="name" defaultValue={selectedUser.name} placeholder="Nombre completo" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email</label>
                            <Input name="email" type="email" defaultValue={selectedUser.email} placeholder="usuario@ejemplo.com" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Nueva Contraseña (Opcional)</label>
                            <Input name="password" type="password" placeholder="Dejar en blanco para mantener actual" minLength={6} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Rol</label>
                                <Select name="role" defaultValue={selectedUser.role}>
                                    <option value="USER">Usuario</option>
                                    {isSuperAdmin && <option value="ADMIN">Administrador</option>}
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Plan</label>
                                <Select name="plan" defaultValue={selectedUser.plan}>
                                    <option value="EXPRESS">Express</option>
                                    <option value="EMPRENDEDOR">Emprendedor</option>
                                    <option value="PREMIUM">Premium</option>
                                </Select>
                            </div>
                        </div>
                        
                        {updateUserState?.message && (
                            <p className={`text-sm ${updateUserState.success ? 'text-green-400' : 'text-red-400'}`}>
                                {updateUserState.message}
                            </p>
                        )}

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4">Guardar Cambios</Button>
                    </form>
                )}
            </Modal>

            <div className="rounded-md border border-slate-800 bg-slate-900/50 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-900 text-slate-400">
                        <tr>
                            <th className="px-6 py-3">Usuario</th>
                            <th className="px-6 py-3">Rol</th>
                            <th className="px-6 py-3">Plan</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user: any) => (
                            <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{user.name || "Sin nombre"}</span>
                                        <span className="text-xs text-slate-500">{user.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className={user.role === 'ADMIN' ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' : 'border-slate-700 text-slate-400'}>
                                        {user.role}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge className={`
                                        ${user.plan === 'PREMIUM' ? 'bg-amber-600 text-white' : 
                                          user.plan === 'EMPRENDEDOR' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-200'}
                                    `}>
                                        {user.plan}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={user.active ? "success" : "destructive"}>
                                        {user.active ? "Activo" : "Inactivo"}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-10 w-10 p-0 border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all"
                                            title="Editar Usuario"
                                            onClick={() => handleEditUser(user)}
                                        >
                                            <Edit className="h-6 w-6" />
                                        </Button>

                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-10 w-10 p-0 border-blue-900/30 bg-blue-900/10 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 hover:border-blue-800 transition-all"
                                            title="Editar Tarjeta"
                                            onClick={() => router.push(`/admin/users/${user.id}/card`)}
                                        >
                                            <CreditCard className="h-6 w-6" />
                                        </Button>
                                        
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className={`h-10 w-10 p-0 border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-slate-600 transition-all ${user.active ? 'text-amber-400 hover:text-amber-300' : 'text-green-400 hover:text-green-300'}`}
                                            title={user.active ? "Desactivar" : "Activar"}
                                            onClick={async () => {
                                                if (confirm(`¿${user.active ? 'Desactivar' : 'Activar'} usuario?`)) {
                                                    await toggleUserStatus(user.id, user.active);
                                                }
                                            }}
                                            disabled={user.email === superAdminEmail}
                                        >
                                            {user.active ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                                        </Button>

                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-10 w-10 p-0 border-red-900/30 bg-red-900/10 text-red-400 hover:text-red-300 hover:bg-red-900/20 hover:border-red-800 transition-all"
                                            title="Eliminar Usuario"
                                            onClick={async () => {
                                                if (confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
                                                    await deleteUser(user.id);
                                                }
                                            }}
                                            disabled={user.email === superAdminEmail}
                                        >
                                            <Trash className="h-6 w-6" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FinancesPanel({ stats }: any) {
    if (!stats) return <p className="text-slate-400">Cargando estadísticas...</p>;

    // Datos simulados para el gráfico ya que aún no tenemos datos históricos
    const monthlyData = [
        { month: 'Ene', amount: stats.totalEarnings * 0.1 },
        { month: 'Feb', amount: stats.totalEarnings * 0.15 },
        { month: 'Mar', amount: stats.totalEarnings * 0.2 },
        { month: 'Abr', amount: stats.totalEarnings * 0.55 }, // Most current
    ];
    
    const maxAmount = Math.max(...monthlyData.map(d => d.amount)) || 100;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Ingresos Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${stats.totalEarnings.toLocaleString()} MXN</div>
                        <p className="text-xs text-slate-500">+20.1% desde el mes pasado</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Usuarios Totales</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                        <p className="text-xs text-slate-500">+180 nuevos usuarios</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Usuarios Activos</CardTitle>
                        <Activity className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
                        <p className="text-xs text-slate-500">85% de retención</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Plan Más Popular</CardTitle>
                        <Shield className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {/* Simple logic to find max plan */}
                            {stats.usersByPlan?.sort((a:any, b:any) => b._count.plan - a._count.plan)[0]?.plan || "N/A"}
                        </div>
                        <p className="text-xs text-slate-500">Tendencia actual</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Resumen de Ingresos</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] w-full flex items-end justify-between gap-2 px-4 pt-4">
                            {monthlyData.map((data, index) => (
                                <div key={index} className="flex flex-col items-center gap-2 w-full group">
                                    <div 
                                        className="w-full bg-blue-600/50 rounded-t-md hover:bg-blue-500 transition-all relative group-hover:shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                        style={{ height: `${(data.amount / maxAmount) * 100}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                                            ${data.amount.toLocaleString()}
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500">{data.month}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Distribución de Planes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {stats.usersByPlan?.map((item: any) => {
                                const total = stats.totalUsers || 1; // Prevent division by zero
                                const percentage = Math.round((item._count.plan / total) * 100);
                                const color = item.plan === 'PREMIUM' ? 'bg-amber-500' : item.plan === 'EMPRENDEDOR' ? 'bg-blue-500' : 'bg-slate-500';
                                
                                return (
                                    <div key={item.plan} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-medium leading-none text-white">{item.plan}</p>
                                                <p className="text-xs text-slate-500">{item._count.plan} usuarios</p>
                                            </div>
                                            <div className="font-medium text-white text-sm">
                                                {percentage}%
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${color} transition-all duration-500 ease-out`} style={{ width: `${percentage}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
