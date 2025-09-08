# Guía de Despliegue en cPanel

## Configuración para Hosting Compartido

Este proyecto ha sido configurado para funcionar correctamente en servidores de hosting compartido como cPanel, eliminando la dependencia de enlaces simbólicos.

### Cambios Realizados

1. **Sistema de Archivos Actualizado**
   - Configuración en `config/filesystems.php` modificada para usar `public_path()` directamente
   - Enlaces simbólicos deshabilitados para compatibilidad con cPanel

2. **Estructura de Carpetas**
   ```
   public/
   ├── images/
   │   ├── business/     # Imágenes de portada del negocio
   │   └── products/     # Imágenes de productos
   └── payment-proofs/   # Comprobantes de pago
   ```

3. **Archivos Modificados**
   - `app/Http/Controllers/CatalogController.php` - Subida de comprobantes
   - `app/Http/Livewire/Admin/Products.php` - Subida de imágenes de productos
   - `app/Http/Livewire/Admin/BusinessInfo.php` - Subida de imagen de portada
   - `resources/views/livewire/admin/orders.blade.php` - Visualización de comprobantes

### Instrucciones de Despliegue

1. **Subir Archivos**
   - Sube todos los archivos del proyecto a tu hosting
   - Asegúrate de que las carpetas en `public/` tengan permisos 755

2. **Configuración de Base de Datos**
   - Configura las variables de entorno en `.env`
   - Ejecuta las migraciones: `php artisan migrate`

3. **Permisos de Carpetas**
   ```bash
   chmod 755 public/images/business
   chmod 755 public/images/products  
   chmod 755 public/payment-proofs
   ```

4. **Variables de Entorno Importantes**
   ```
   APP_URL=https://tudominio.com
   FILESYSTEM_DRIVER=public
   ```

### Notas Importantes

- **NO ejecutar** `php artisan storage:link` en cPanel
- Los archivos se guardan directamente en la carpeta `public/`
- Las URLs de archivos usan `asset()` en lugar de `Storage::url()`
- Compatible con la mayoría de proveedores de hosting compartido

### Solución de Problemas

1. **Imágenes no se muestran**
   - Verificar permisos de carpetas (755)
   - Comprobar que APP_URL esté configurado correctamente

2. **Error al subir archivos**
   - Verificar que las carpetas existan y tengan permisos de escritura
   - Comprobar límites de tamaño de archivo del hosting

3. **Problemas de rutas**
   - Asegurar que todas las rutas usen `asset()` para archivos públicos
   - Verificar configuración en `config/filesystems.php`