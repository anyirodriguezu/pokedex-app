# Pokédex App — CLAUDE.md

## Stack y versiones exactas

Todas las versiones de producción están fijadas sin rangos en `package.json`. No usar `^` ni `~` en dependencias de producción.

| Paquete | Versión real (package.json) |
|---|---|
| expo | 54.0.34 |
| react | 19.1.0 |
| react-native | 0.81.0 |
| typescript | 5.5.4 |
| @react-navigation/native | 7.3.5 |
| @react-navigation/native-stack | 7.17.7 |
| @react-navigation/bottom-tabs | 7.18.5 |
| @tanstack/react-query | 5.62.3 |
| react-hook-form | 7.53.2 |
| zustand | 5.0.2 |
| tamagui | 2.4.0 |
| @tamagui/config | 2.4.0 |
| react-native-reanimated | ~4.1.1 |
| react-native-worklets | 0.5.1 |
| yup | 1.4.0 |
| expo-haptics | ~15.0.8 |

## Comandos esenciales

```bash
# Instalar dependencias (siempre con este flag por conflictos de peer deps de React 19)
npm install --legacy-peer-deps

# Instalar nuevas dependencias nativas (Expo resuelve versiones compatibles)
npx expo install <paquete>

# Verificar tipos — debe pasar limpio antes de cualquier commit
npx tsc --noEmit

# Verificar compatibilidad de dependencias
npx expo-doctor

# Iniciar el servidor de desarrollo
npx expo start

# Correr todos los tests
npm test

# Validar todo (typecheck + lint + test)
npm run validate
```

> Al instalar dependencias nuevas: usar `npx expo install` para paquetes nativos,
> `npm install --legacy-peer-deps` para paquetes JS puros.

## Arquitectura

Organización **feature-based**: cada funcionalidad vive en `src/features/<nombre>/`.

```
src/
├── features/
│   ├── pokedex/          # Pokédex completa (lista, detalle, captura)
│   │   ├── components/   # PokemonCard, PokemonStats, PokemonEvolutionChain,
│   │   │                 # CaptureEffect, CapturedAura, EscapeEffect, ReleaseEffect,
│   │   │                 # LoadingState, Skeletons
│   │   ├── hooks/        # usePokemonList, usePokemonDetail, usePokemonSpecies,
│   │   │                 # useEvolutionChain, usePokemonTypeFilter
│   │   ├── screens/      # PokemonListScreen, PokemonDetailScreen
│   │   └── types/        # pokemon.types.ts
│   ├── trainer/          # Wizard de registro del entrenador (3 pasos)
│   │   ├── components/   # FormField, StepIndicator, TrainerCard
│   │   ├── constants/    # typeEmoji.ts
│   │   ├── hooks/        # useStarterPokemon
│   │   ├── schemas/      # step1Schema.ts, step2Schema.ts (Yup)
│   │   ├── screens/      # Step1PersonalDataScreen, Step2PreferencesScreen,
│   │   │                 # StarterPokemonScreen, SummaryScreen
│   │   └── types/        # trainer.types.ts
│   └── team/             # Gestión del equipo activo y la caja
│       └── screens/      # TeamScreen
├── hooks/                # Hooks cross-feature: usePokemonSearch
├── navigation/           # RootNavigator, PokedexStack, TrainerStack, TeamStack, types.ts
├── store/                # trainerStore.ts (Zustand + AsyncStorage persist)
├── services/             # pokeApi.ts (fetch wrappers → PokéAPI v2)
├── components/ui/        # Button, EmptyState, ErrorState, SplashScreen,
│                         # TrainerNameInputScreen, PokeballIcon,
│                         # ReleaseModal, MoveToBoxModal, TeamFullModal,
│                         # TransferMachineModal
├── constants/            # colors.ts, api.ts
├── utils/                # pokemonHelpers.ts
└── __mocks__/            # tamagui.tsx, @tamagui/config.ts (mocks para tests)
```

## Reglas de React Native — prohibiciones absolutas

- **Nunca** usar elementos HTML: `<div>`, `<p>`, `<span>`, `<button>`, `<input>`, etc.
- **Nunca** usar `className` ni CSS
- **Nunca** importar `SafeAreaView` desde `react-native` — está deprecado en SDK 54.
  Usar siempre `useSafeAreaInsets` de `react-native-safe-area-context`
- **Nunca** usar `.map()` sobre `ScrollView` para listas — usar `FlatList`

Primitivos correctos:

| Web | React Native |
|---|---|
| `<div>` | `<View>` |
| `<p>`, `<span>`, `<h1>` | `<Text>` |
| `<img>` | `<Image>` |
| `<button>` | `<Pressable>` o `<TouchableOpacity>` |
| `<input>` | `<TextInput>` |
| `<ul>` / listas | `<FlatList>` |

## Reglas de estilo

- Todos los estilos con `StyleSheet.create({})` al final de cada archivo
- Flexbox en React Native es **columna por defecto** (`flexDirection: 'column'`)
- Usar `flex: 1` en pantallas para ocupar el espacio disponible
- Cero `StyleSheet` con propiedades CSS que no existen en React Native

## Patrones por módulo

### React Query
- Toda la lógica de fetching va en custom hooks dentro de `features/pokedex/hooks/`
- Nunca reinventar con `useEffect` + `useState` lo que React Query ya provee
- Usar `useInfiniteQuery` para paginación (no `useQuery` con offset manual)
- Los hooks exponen solo lo que las pantallas necesitan — no el objeto query completo
- `QueryClient` se instancia fuera del componente raíz (singleton), nunca dentro
- `staleTime: 5 minutos` configurado globalmente en `App.tsx`
- `usePokemonSearch` (en `src/hooks/`) es un hook cross-feature con debounce de 400 ms

### Formularios (react-hook-form + Yup)
- Usar `Controller` de react-hook-form para conectar con `TextInput` nativos
- No usar `register` directamente (es para inputs HTML)
- Resolver: `yupResolver(schema)` en `useForm` — sin casts adicionales si el schema está bien tipado
- Los errores de validación deben mostrarse inline y bloquear el avance al siguiente paso
- Envolver formularios con `KeyboardAvoidingView` solo cuando haya `TextInput` — no es necesario en pantallas con selectores/chips
- **Patrón `yup.mixed<T>()`**: siempre encadenar `.defined()` para que TypeScript infiera `T` en lugar de `T | undefined` y el resolver no requiera casts:

  ```ts
  // Correcto
  yup.mixed<District>().oneOf(DISTRICTS, '...').required('...').defined()

  // Incorrecto — obliga a `as unknown as Resolver<>` en useForm
  yup.mixed<District>().oneOf(DISTRICTS, '...').required('...')
  ```

### Zustand
- El store en `src/store/trainerStore.ts` es la única fuente de verdad del perfil
- `SummaryScreen` lee desde el store — nunca desde parámetros de navegación
- Las acciones del store están tipadas en `TrainerStoreState`
- `persist` con `partialize` persiste únicamente: `profile`, `activeTeam`, `box`, `trainerName`
  Los datos transitorios (`step1Data`, `isEditing`, `hasSeenSplash`) **no se persisten**
- Usar `useTrainerStore.getState()` fuera de componentes React (ej. listeners de navegación)
- El rehydration hook migra al box el exceso de `activeTeam` si supera `MAX_ACTIVE_TEAM` (6)
- `AppShell` en `App.tsx` espera `persist.onFinishHydration()` antes de montar `AppContent`,
  para que los `useState` inicializadores siempre vean los valores reales del AsyncStorage

### Navegación
- Los tipos de todas las rutas están en `src/navigation/types.ts`
- Parámetros entre pantallas siempre tipados con `NativeStackScreenProps<ParamList, 'NombrePantalla'>`
- Tabs anidados tipados con `NavigatorScreenParams<StackParamList>` en `RootTabParamList`
- `NavigationContainer` y `QueryClientProvider` viven en `App.tsx`
- **Swipe entre tabs**: `RootNavigator` envuelve cada tab en un `PanResponder` que captura
  gestos horizontales que empiezan dentro de los 32px desde el borde de pantalla. Usa
  `useTrainerStore.getState()` (no el hook) para inicializar `startCreate` al navegar al tab Trainer

### Tamagui
- Configuración en `tamagui.config.ts`: extiende `@tamagui/config/v4` con tokens custom en tema `light`
- Los tokens custom disponibles son: `$primary`, `$primaryDark`, `$primarySubtle`, `$secondary`,
  `$appBackground`, `$surface`, `$appText`, `$textSecondary`, `$textLight`, `$appBorder`,
  `$error`, `$success`, `$indigo`, `$indigoSubtle`, `$teamGreen`, `$teamGreenSubtle`,
  `$muted`, `$violet`, `$amber`, `$darkNavy`, `$gold`
- Usar `declare module 'tamagui'` para augmentar `TamaguiCustomConfig` — habilita autocompletado
- Para colores que no son tokens (ej. hex dinámicos), usar `style={{ backgroundColor: hex }}`
  en lugar de `bg={hex as any}`
- En tests: Tamagui requiere mock manual en `src/__mocks__/tamagui.tsx` y
  `src/__mocks__/@tamagui/config.ts`; el `render` de tests debe envolverse en `TamaguiProvider`
  (ver `src/test-utils.tsx`)
- Los componentes Tamagui (`YStack`, `XStack`, `Text`, etc.) se usan para layout y tipografía;
  `StyleSheet.create` para estilos nativos puros

## TypeScript

- Sin `any` — todo tipado explícito. Las únicas excepciones aceptadas son fricciones documentadas del ecosistema
- Componentes con `React.FC<Props>` o tipo de props explícito
- Tipos de API en `features/pokedex/types/pokemon.types.ts`
- Tipos del entrenador en `features/trainer/types/trainer.types.ts`
- Tipos de formularios via `yup.InferType<typeof schema>` — el schema es la fuente de verdad
- `npx tsc --noEmit` debe pasar limpio antes de considerar algo terminado

## Tests

- Stack: `jest-expo` + `@testing-library/react-native`
- Render helper con contexto: `import { render } from '../../../test-utils'`
  (no desde `@testing-library/react-native` directamente — el helper envuelve en `TamaguiProvider`)
- Mocks declarados en `jest.moduleNameMapper`: tamagui, @tamagui/config, AsyncStorage
- `jest.setup.ts` suprime warnings de `act()` de react-hook-form/Yup/React 19 concurrente
- Ejecutar: `npm test` / `npm run test:watch` / `npm run test:coverage`
- **Objetivo de cobertura: ≥ 80 %** — verificar con `npm run test:coverage` antes de cada PR
- 31 archivos de test cubriendo: pantallas (PokemonListScreen, PokemonDetailScreen, TeamScreen,
  Step1, Step2, StarterPokemon, SummaryScreen), hooks (usePokemonList, usePokemonDetail,
  usePokemonTypeFilter, usePokemonSearch), componentes de animación (CaptureEffect, EscapeEffect,
  ReleaseEffect, CapturedAura, PokemonEvolutionChain), modales (TransferMachineModal),
  componentes UI (Button, EmptyState, ErrorState, SplashScreen, TrainerNameInputScreen),
  servicios (pokeApi), store (trainerStore), schemas (step1Schema, step2Schema), utils

## Commits

- Seguir el estándar **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, etc.)
- No agregar al modelo de IA como co-autor (`Co-Authored-By`) en ningún commit

## EAS Build — publicación

Archivos clave: `eas.json` (perfiles de build) y `app.json` (IDs y configuración nativa).

```bash
# Build de preview — APK compartible directamente
eas build --platform android --profile preview

# Obtener link directo al APK (sin login)
eas build:view <build-id>   # → campo "Application Archive URL"

# OTA update sin rebuild
eas update --auto
```

Perfiles en `eas.json`:
- `development` — APK con cliente de desarrollo
- `preview` — APK instalable para compartir (`distribution: internal`)
- `production` — App Bundle para Play Store (`autoIncrement: true`)

## Notas críticas del ecosistema

- `react-native-reanimated@~4.1.1` es la versión validada por Expo SDK 54 para RN 0.81.
  No actualizar sin verificar con `npx expo-doctor`.
- `react-native-worklets` es peer dependency obligatoria de reanimated 4.x — debe estar instalada explícitamente.
- No agregar paquetes a `plugins` en `app.json` a menos que tengan `app.plugin.js` en su raíz.
  `expo-haptics` no lo tiene y rompe `expo config`.
- La Nueva Arquitectura está habilitada por defecto en SDK 54 — no deshabilitar.
- `tsconfig.json` extiende `expo/tsconfig.base` que usa `"module": "preserve"` —
  requiere TypeScript 5.5+. No bajar la versión de TypeScript.
- Documentación de referencia: https://docs.expo.dev/versions/v54.0.0/
