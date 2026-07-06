import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PokemonWithId } from '../features/pokedex/types/pokemon.types'

export function usePokemonSearch(cachedPokemons: PokemonWithId[]) {
  const [rawTerm, setRawTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleSearchChange(text: string) {
    setRawTerm(text)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDebouncedTerm(text.toLowerCase().trim())
    }, 400)
  }

  function clearSearch() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setRawTerm('')
    setDebouncedTerm('')
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const localResults = useMemo(() => {
    if (!debouncedTerm) return cachedPokemons
    return cachedPokemons.filter(
      (p) =>
        p.name.includes(debouncedTerm) ||
        String(p.id).includes(debouncedTerm)
    )
  }, [debouncedTerm, cachedPokemons])

  const shouldFetchFromApi =
    debouncedTerm.length >= 2 && localResults.length === 0

  const {
    data: apiResult,
    isLoading: isLoadingApi,
    isError: isApiError,
  } = useQuery({
    queryKey: ['pokemon-search', debouncedTerm],
    queryFn: async () => {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${debouncedTerm}`
      )
      if (!res.ok) throw new Error('Not found')
      return res.json()
    },
    enabled: shouldFetchFromApi,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  // isSearching reacts immediately on first keystroke, not after debounce
  const isSearching = rawTerm.length > 0
  const isDebouncing = isSearching && rawTerm !== debouncedTerm
  const hasNoResults =
    !isDebouncing &&
    debouncedTerm.length > 0 &&
    localResults.length === 0 &&
    isApiError
  const showApiResult =
    !isDebouncing && !!apiResult && localResults.length === 0

  return {
    rawTerm,
    handleSearchChange,
    clearSearch,
    localResults,
    apiResult,
    isLoadingApi,
    isApiError,
    isSearching,
    isDebouncing,
    hasNoResults,
    showApiResult,
    debouncedTerm,
  }
}
