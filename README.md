# Pokédex & Registro de Entrenador

Aplicación móvil construida con React Native (Expo SDK 57) que demuestra la transición del paradigma React Web al entorno nativo.

## Requisitos Previos

- Node.js 24+
- Expo Go instalado en tu dispositivo móvil (o emulador Android/iOS)

## Instalación y ejecución

```bash
npm install
npx expo start
```

Escanea el QR con Expo Go (Android) o la app Cámara (iOS).

## Arquitectura

### Estructura feature-based
El código se organiza por funcionalidades (`features/pokedex` y `features/trainer`), donde cada feature contiene sus propias pantallas, componentes, hooks y tipos.

### Decisiones técnicas

| Decisión | Tecnología | Razón |
|---|---|---|
| Navegación | React Navigation v7 (Stack + Tabs) | Estándar de la industria, soporte nativo |
| Fetching de datos | TanStack React Query v5 | Caché automático, estados loading/error/success, paginación infinita |
| Formularios | react-hook-form + yup | Validación declarativa, integración con Controller para inputs nativos |
| Estado global | Zustand | API mínima, sin boilerplate, persistencia del perfil entre pasos |
| SafeAreaView | react-native-safe-area-context | Requerido desde Expo SDK 54+ (deprecado en react-native core) |

### Flujo de la app

1. **Tab Pokédex:** Lista paginada con `FlatList` + `useInfiniteQuery` → detalle con imagen oficial y estadísticas visuales.
2. **Tab Entrenador:** Formulario multi-paso (2 pasos) con validación Yup que bloquea el avance si hay errores. El estado se acumula en Zustand y la pantalla final lo lee directamente del store.

## Checklist de verificación

- [x] Sin elementos HTML — solo primitivos React Native
- [x] Todos los estilos con `StyleSheet.create({})`
- [x] `FlatList` para la lista de Pokémon
- [x] `SafeAreaView` de `react-native-safe-area-context`
- [x] Errores Yup visibles e inline, bloquean avance
- [x] SummaryScreen lee desde Zustand (no params)
- [x] Custom hooks encapsulan React Query
- [x] `npx tsc --noEmit` pasa sin errores
- [x] `npx expo-doctor` sin errores críticos
