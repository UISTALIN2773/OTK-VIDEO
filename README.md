# 📱 OTK VIDEO

![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)

**OTK VIDEO** es una aplicación móvil nativa diseñada para gestionar y descargar videos de manera eficiente. Construida sobre el ecosistema de React Native y Expo, ofrece una experiencia fluida, integración directa con la galería del dispositivo y una interfaz de usuario limpia y moderna.

## ✨ Características Principales

- **Descarga de Medios:** Guarda videos directamente en la galería de tu dispositivo móvil.
- **Gestión de Permisos Nativos:** Integración transparente para solicitar acceso a fotos y almacenamiento.
- **Portapapeles Automático:** Soporte para leer enlaces de videos copiados de forma rápida gracias a `expo-clipboard`.
- **Rendimiento Óptimo:** Construido con las tecnologías más recientes de React Native.

## 🛠️ Stack Tecnológico

- **Framework principal:** [React Native](https://reactnative.dev/)
- **Plataforma y Build:** [Expo](https://expo.dev/) y EAS Build
- **Manejo de Archivos:** `expo-file-system`, `expo-media-library`
- **Gestor de Paquetes:** `pnpm` (recomendado) o `npm`

## 🚀 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalados:

- [Node.js](https://nodejs.org/) (v18 o superior)
- `pnpm` (o `npm` / `yarn`)
- Emulador de Android/iOS o un dispositivo físico con la app **Expo Go**.

## 💻 Instalación y Desarrollo Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/UISTALIN2773/OTK-VIDEO.git
   ```

2. **Ir al directorio del proyecto:**
   ```bash
   cd OTK-VIDEO/android/mobile
   ```

3. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npx expo start
   ```

5. **Probar la app:**
   - Escanea el código QR desde tu celular utilizando la app **Expo Go** (Android) o la aplicación de Cámara (iOS).
   - Presiona `a` en la terminal para abrirlo en un emulador Android.

## 📦 Compilación y Generación de APK/AAB

El proyecto usa **EAS (Expo Application Services)** para la construcción de los ejecutables de forma segura en la nube.

Para compilar la aplicación (ej. APK para Android):

1. Instala el CLI de EAS (si no lo tienes):
   ```bash
   npm install -g eas-cli
   ```
2. Inicia sesión con tu cuenta de Expo:
   ```bash
   eas login
   ```
3. Ejecuta la compilación de prueba (genera un archivo `.apk` local instalable):
   ```bash
   eas build --platform android --profile preview
   ```

## 🔒 Permisos Solicitados (Android)

Para poder operar correctamente, la aplicación necesita los siguientes permisos en Android (los cuales son solicitados en tiempo de ejecución):
- `WRITE_EXTERNAL_STORAGE` y `READ_EXTERNAL_STORAGE`
- `MEDIA_LIBRARY` *(Permite guardar los videos descargados directamente en la galería del usuario).*

## 📄 Licencia

Todos los derechos reservados.
