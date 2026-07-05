# Pokédex & Registro de Entrenador

Aplicación móvil construida con React Native (Expo SDK 54) que demuestra la transición del paradigma React Web al entorno nativo móvil.

## Stack

| Paquete | Versión |
|---|---|
| expo | 54.0.34 |
| react / react-native | 19.1.0 / 0.81.0 |
| typescript | 5.5.4 |
| @react-navigation/native | 7.0.14 |
| @tanstack/react-query | 5.62.3 |
| react-hook-form + yup | 7.53.2 + 1.4.0 |
| zustand | 5.0.2 |
| tamagui | 2.4.0 |

## Requisitos previos

- Node.js 18+
- Expo Go instalado en el dispositivo móvil (o emulador Android/iOS)

## Instalación y ejecución

```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Iniciar el servidor de desarrollo
npx expo start
```

Escanea el QR con Expo Go (Android) o la app Cámara (iOS).

## Scripts disponibles

```bash
npm test                # Ejecuta los tests
npm run test:coverage   # Tests con reporte de cobertura
npm run typecheck       # Verificación de tipos TypeScript
npm run lint            # ESLint
npm run validate        # typecheck + lint + test (todo junto)
```

## Arquitectura

### Estructura feature-based

```
src/
├── features/
│   ├── pokedex/          # Lista y detalle de Pokémon
│   │   ├── components/   # PokemonCard, PokemonStats, LoadingState
│   │   ├── hooks/        # usePokemonList, usePokemonDetail
│   │   ├── screens/      # PokemonListScreen, PokemonDetailScreen
│   │   └── types/        # pokemon.types.ts
│   └── trainer/          # Formulario multi-paso del entrenador
│       ├── components/   # FormField, StepIndicator, TrainerCard
│       ├── schemas/      # step1Schema, step2Schema (Yup)
│       ├── screens/      # Step1, Step2, SummaryScreen
│       └── types/        # trainer.types.ts
├── navigation/           # RootNavigator, stacks, tipos de rutas
├── store/                # trainerStore (Zustand + AsyncStorage)
├── services/             # pokeApi.ts
├── components/ui/        # Button, EmptyState, ErrorState
├── constants/            # colors.ts, api.ts
└── utils/                # pokemonHelpers.ts
```

### Decisiones técnicas

| Decisión | Tecnología | Razón |
|---|---|---|
| UI / Estilos | Tamagui + StyleSheet | Tokens tipados, variantes de componentes, layout con YStack/XStack |
| Navegación | React Navigation v7 (Stack + Tabs) | Estándar de la industria, soporte nativo, tipado completo |
| Fetching | TanStack React Query v5 | Caché automático, paginación infinita, estados loading/error/success |
| Formularios | react-hook-form + yup | Validación declarativa, Controller para inputs nativos |
| Estado global | Zustand + AsyncStorage | API mínima, persistencia automática del perfil |
| Safe Area | react-native-safe-area-context | Requerido en Expo SDK 54 (deprecado en react-native core) |

### Flujo de la app

**Tab Pokédex**
1. `PokemonListScreen` carga la lista con `useInfiniteQuery` — scroll infinito via `FlatList.onEndReached`
2. Tap en una card navega a `PokemonDetailScreen` pasando `{ pokemonId, pokemonName }` como params tipados
3. `usePokemonDetail(id)` carga el detalle con caché por ID

**Tab Entrenador**
1. `Step1PersonalDataScreen` — datos personales (nombre, edad, email) con validación Yup
2. `Step2PreferencesScreen` — selección de distrito y tipo Pokémon favorito via chips
3. `SummaryScreen` — lee el perfil completo directamente desde Zustand (nunca desde params)
4. El perfil persiste en AsyncStorage — sobrevive reinicios de la app

## Checklist técnico

- [x] Sin elementos HTML — solo primitivos React Native (`View`, `Text`, `Image`, `FlatList`, etc.)
- [x] Estilos con `StyleSheet.create({})` y tokens Tamagui — sin CSS tradicional
- [x] `SafeAreaProvider` + `useSafeAreaInsets` de `react-native-safe-area-context`
- [x] `FlatList` para listas (nunca `.map()` sobre `ScrollView`)
- [x] `useInfiniteQuery` para paginación (no `useQuery` con offset manual)
- [x] `Controller` en todos los campos de formulario
- [x] Errores Yup visibles inline, bloquean el avance al siguiente paso
- [x] `SummaryScreen` lee desde Zustand — no desde parámetros de navegación
- [x] Custom hooks encapsulan toda la lógica de React Query
- [x] TypeScript `strict: true` — sin `any` injustificados
- [x] Rutas de navegación completamente tipadas
- [x] 72 tests unitarios (schemas, store, utils, componentes UI)
