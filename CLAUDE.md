# Pokédex & Registro de Entrenador — CLAUDE.md

## Stack y versiones exactas

Todas las versiones están fijadas sin rangos en `package.json`. No usar `^` ni `~`.

| Paquete | Versión |
|---|---|
| expo | 54.0.34 |
| react | 19.1.0 |
| react-native | 0.81.0 |
| typescript | 5.5.4 |
| @react-navigation/native | 7.0.14 |
| @tanstack/react-query | 5.62.3 |
| react-hook-form | 7.53.2 |
| zustand | 5.0.2 |

## Comandos esenciales

```bash
# Instalar dependencias (siempre con este flag por conflictos de peer deps)
npm install --legacy-peer-deps

# Instalar nuevas dependencias nativas (Expo resuelve versiones compatibles)
npx expo install <paquete>

# Verificar tipos (debe pasar sin errores antes de cualquier commit)
npx tsc --noEmit

# Verificar compatibilidad de dependencias
npx expo-doctor

# Iniciar el servidor de desarrollo
npx expo start
```

> Al instalar dependencias nuevas: usar `npx expo install` para paquetes nativos,
> `npm install --legacy-peer-deps` para paquetes JS puros.

## Arquitectura

Organización **feature-based**: cada funcionalidad vive en `src/features/<nombre>/` con
sus propias pantallas, componentes, hooks, schemas y tipos.

```
src/
├── features/
│   ├── pokedex/          # Lista y detalle de Pokémon
│   └── trainer/          # Formulario multi-paso del entrenador
├── navigation/           # Navigators y tipos de rutas
├── store/                # Estado global (Zustand)
├── services/             # Fetching hacia APIs externas
├── components/           # Componentes reutilizables cross-feature
├── constants/            # Colores, URLs base
└── utils/                # Funciones puras sin efectos
```

## Reglas de React Native — prohibiciones absolutas

- **Nunca** usar elementos HTML: `<div>`, `<p>`, `<span>`, `<button>`, `<input>`, etc.
- **Nunca** usar `className` ni CSS
- **Nunca** importar `SafeAreaView` desde `react-native` — está deprecado en SDK 54.
  Usar siempre desde `react-native-safe-area-context`
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
- Usar `flex: 1` en pantallas para ocupar espacio disponible
- Cero `StyleSheet` con propiedades CSS que no existen en React Native

## Patrones por módulo

### React Query
- Toda la lógica de fetching va en custom hooks dentro de `features/pokedex/hooks/`
- Nunca reinventar con `useEffect` + `useState` lo que React Query ya provee
- Usar `useInfiniteQuery` para paginación (no `useQuery` con offset manual)
- Los hooks exponen solo lo que las pantallas necesitan — no el objeto query completo
- `QueryClient` se instancia fuera del componente raíz (singleton), nunca dentro
- `staleTime: 5 minutos` configurado globalmente en `App.tsx`

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
- `persist` con `partialize` limita la persistencia solo a `profile` — los datos transitorios del wizard (`step1Data`, `isEditing`) no se persisten
- Usar `useTrainerStore.getState()` fuera de componentes React (ej. listeners de navegación)

### Navegación
- Los tipos de todas las rutas están en `src/navigation/types.ts`
- Parámetros entre pantallas siempre tipados con `NativeStackScreenProps<ParamList, 'NombrePantalla'>`
- Tabs anidados tipados con `NavigatorScreenParams<StackParamList>` en `RootTabParamList`
- `NavigationContainer` y `QueryClientProvider` viven en `App.tsx`

### Tamagui
- Configuración en `tamagui.config.ts`: extiende `@tamagui/config/v4`, tokens custom en tema `light`
- Usar `declare module 'tamagui'` para augmentar el tipo `CustomTokens` — habilita autocompletado de tokens propios (`$primary`, `$surface`, etc.)
- Para colores que no son tokens (ej. hex dinámicos), usar `style={{ backgroundColor: hex }}` en lugar de `bg={hex as any}`
- En tests: Tamagui requiere mock manual en `src/__mocks__/tamagui.tsx` y `src/__mocks__/@tamagui/config.ts`; el `render` de tests debe envolverse en `TamaguiProvider` (ver `src/test-utils.tsx`)

## TypeScript

- Sin `any` — todo tipado explícito. Las únicas excepciones aceptadas son fricciones documentadas del ecosistema
- Componentes con `React.FC<Props>` o tipo de props explícito
- Tipos de API en `features/pokedex/types/pokemon.types.ts`
- Tipos del entrenador en `features/trainer/types/trainer.types.ts`
- Tipos de formularios via `yup.InferType<typeof schema>` — la fuente de verdad es el schema
- `npx tsc --noEmit` debe pasar limpio antes de considerar algo terminado

## Tests

- Stack: `jest-expo` + `@testing-library/react-native`
- Render helper con contexto: `import { render } from '../../../test-utils'` (no desde `@testing-library/react-native` directamente)
- Ejecutar: `npm test` / `npm run test:coverage`
- Cobertura apuntada a: schemas, store, utils y componentes UI aislados

## Commits

- Seguir el estándar **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, etc.)
- No agregar al modelo de IA como co-autor (`Co-Authored-By`) en ningún commit

## Expo SDK 54 — notas importantes

- La Nueva Arquitectura está habilitada por defecto — no deshabilitar
- `tsconfig.json` extiende `expo/tsconfig.base` que usa `"module": "preserve"` —
  requiere TypeScript 5.5+. No bajar la versión de TypeScript
- Documentación de referencia: https://docs.expo.dev/versions/v54.0.0/
