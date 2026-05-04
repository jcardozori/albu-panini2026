# Álbum Panini FWC 2026 — App React Native

Aplicación móvil para rastrear el progreso del álbum Panini del Mundial 2026. Sincroniza automáticamente con Google Sheets, requiere autenticación con cuenta Google, y permite exportar el progreso.

---

## Estructura del proyecto

```
albu-panini2026/
├── App.js                          # Punto de entrada
├── package.json
├── src/
│   ├── data/
│   │   └── stickers.js             # Datos de todas las secciones
│   ├── screens/
│   │   ├── LoginScreen.js          # Pantalla de login con Google
│   │   ├── HomeScreen.js           # Listado principal de secciones
│   │   └── StickerPage.js          # Página de fichas de cada sección
│   ├── services/
│   │   ├── AuthContext.js          # Contexto de autenticación Google
│   │   └── googleSheetsService.js  # API de Google Sheets
│   └── navigation/
│       └── AppNavigator.js         # Navegación principal
```

---

## Configuración paso a paso

### 1. Google Cloud Console

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear un proyecto nuevo (ej: `panini-tracker-2026`)
3. Activar las siguientes APIs:
   - **Google Sheets API**
   - **Google Drive API**
   - **Google Sign-In**
4. Ir a **APIs & Services → OAuth consent screen**
   - Tipo: External
   - Completar nombre, correo de soporte
   - Agregar scopes:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive.file`
5. Ir a **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Para Android: tipo **Android**, ingresar package name y SHA-1
   - Para iOS: tipo **iOS**, ingresar Bundle ID
   - Para Web: tipo **Web** (necesario para `webClientId`)
6. Copiar el **Web Client ID**

### 2. Obtener SHA-1 (Android)

```bash
# En modo debug:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# En modo release:
keytool -list -v -keystore tu-keystore.jks -alias tu-alias
```

### 3. Configurar en el código

Abrir `src/services/AuthContext.js` y reemplazar:

```javascript
GoogleSignin.configure({
  webClientId: 'TU_WEB_CLIENT_ID.apps.googleusercontent.com', // ← reemplazar aquí
  ...
});
```

### 4. Instalación

```bash
# Instalar dependencias
npm install

# Para Expo con módulo nativo de Google Sign-In:
npx expo install @react-native-google-signin/google-signin

# Prebuild (genera archivos nativos)
npx expo prebuild

# Correr en Android
npx expo run:android

# Correr en iOS
npx expo run:ios
```

### 5. Configuración Android adicional

Agregar en `android/app/src/main/res/values/strings.xml`:

```xml
<string name="server_client_id">TU_WEB_CLIENT_ID.apps.googleusercontent.com</string>
```

---

## Funcionalidades

### Pantalla de Login
- Autenticación exclusiva con Google
- Sin opción de registro manual ni otros proveedores
- Restaura sesión automáticamente al abrir la app

### Menú Principal (HomeScreen)
- Lista todas las secciones del álbum
- **Verde**: sección completamente llena
- **Blanca/gris**: sección con fichas pendientes
- Barra de progreso por sección y global
- Menú con opciones:
  - 📊 **Exportar** a archivo "fichas" en Google Drive
  - 🚪 **Cerrar sesión**

### Página de Fichas (StickerPage)
- 20 cuadros por sección (o los que correspondan)
- **Verde**: ficha encontrada
- **Blanca/gris**: ficha faltante
- Toque para cambiar estado
- Botones "Marcar todas" y "Limpiar todas"
- Al volver: pregunta si guardar cambios
- Auto-guarda en Google Sheets al confirmar

### Google Sheets (albu-panini2026)
- Creado automáticamente la primera vez
- Acceso restringido solo al propietario (sin acceso público)
- Sincronización automática al guardar cada sección

### Exportación
- Crea/sobreescribe archivo "fichas" en Google Drive
- Incluye resumen con: sección, total, encontradas, faltantes, % completado
- Disponible desde el menú principal

---

## Secciones del álbum

| Sección | Fichas |
|---------|--------|
| FWC 1-8 | 8 |
| Grupo A (México, Sudáfrica, Corea del Sur, Rep. Checa) | 20 c/u |
| Grupo B (Canadá, Bosnia, Qatar, Suiza) | 20 c/u |
| Grupo C (Brasil, Marruecos, Haití, Escocia) | 20 c/u |
| Grupo D (EE.UU., Paraguay, Australia, Turquía) | 20 c/u |
| Grupo E (Alemania, Curazao, C. de Marfil, Ecuador) | 20 c/u |
| Grupo F (Países Bajos, Japón, Suecia, Túnez) | 20 c/u |
| Grupo G (Bélgica, Egipto, Irán, Nueva Zelanda) | 20 c/u |
| Grupo H (España, Cabo Verde, Arabia Saudita, Uruguay) | 20 c/u |
| Grupo I (Francia, Senegal, Irak, Noruega) | 20 c/u |
| Grupo J (Argentina, Argelia, Austria, Jordania) | 20 c/u |
| Grupo K (Portugal, RD Congo, Uzbekistán, Colombia) | 20 c/u |
| Grupo L (Inglaterra, Croacia, Ghana, Panamá) | 20 c/u |
| FWC 9-19 | 11 |
| Fichas CocaCola CC1-CC14 | 14 |

**Total: ~969 fichas** distribuidas en 51 secciones

---

## Solución de problemas

**Error: "Google Play Services no disponible"**
- Solo ocurre en emuladores sin Google Play. Usar un dispositivo físico o emulador con Google Play.

**No aparece el spreadsheet "albu-panini2026"**
- Verificar que los scopes de Drive estén habilitados en Google Cloud Console.

**Error al guardar**
- Verificar conexión a internet.
- El token de acceso puede expirar; la app lo refresca automáticamente.
