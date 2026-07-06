import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TrainerStoreState,
  Step1Data,
  Step2Data,
  TrainerProfile,
  CapturedPokemon,
  MAX_ACTIVE_TEAM,
} from '../features/trainer/types/trainer.types';

export const useTrainerStore = create<TrainerStoreState>()(
  persist(
    (set, get) => ({
      profile: null,
      step1Data: null,
      isEditing: false,
      activeTeam: [],
      box: [],
      hasSeenSplash: false,

      setStep1Data: (data: Step1Data) => {
        set({ step1Data: data });
      },

      setStep2Data: (data: Step2Data) => {
        const step1 = get().step1Data;
        if (!step1) return;
        const existing = get().profile;
        const profile: TrainerProfile = {
          ...step1,
          ...data,
          starterPokemon: existing?.starterPokemon ?? null,
        };
        set({ profile });
      },

      setStarterPokemon: (pokemon: CapturedPokemon) => {
        const profile = get().profile;
        if (!profile) return;
        set({ profile: { ...profile, starterPokemon: pokemon }, isEditing: false });
      },

      resetProfile: () => {
        set({ profile: null, step1Data: null, isEditing: false, hasSeenSplash: false });
      },

      setHasSeenSplash: (value: boolean) => {
        set({ hasSeenSplash: value });
      },

      startEdit: () => {
        set({ isEditing: true });
      },

      startCreate: () => {
        set({ isEditing: false, step1Data: null });
      },

      capture: (pokemon: CapturedPokemon) => {
        const { activeTeam, box } = get();
        const alreadyCaptured =
          activeTeam.some((c) => c.id === pokemon.id) ||
          box.some((c) => c.id === pokemon.id);
        if (alreadyCaptured) return;

        if (activeTeam.length < MAX_ACTIVE_TEAM) {
          set({ activeTeam: [...activeTeam, pokemon] });
        } else {
          set({ box: [...box, pokemon] });
        }
      },

      captureToBox: (pokemon: CapturedPokemon) => {
        const { activeTeam, box } = get();
        const alreadyCaptured =
          activeTeam.some((c) => c.id === pokemon.id) ||
          box.some((c) => c.id === pokemon.id);
        if (alreadyCaptured) return;
        set({ box: [...box, pokemon] });
      },

      release: (id: number) => {
        set({
          activeTeam: get().activeTeam.filter((c) => c.id !== id),
          box: get().box.filter((c) => c.id !== id),
        });
      },

      releaseStarterPokemon: () => {
        const profile = get().profile;
        if (!profile) return;
        set({ profile: { ...profile, starterPokemon: null } });
      },

      isCaptured: (id: number) => {
        const { activeTeam, box } = get();
        return activeTeam.some((c) => c.id === id) || box.some((c) => c.id === id);
      },

      isInActiveTeam: (id: number) => get().activeTeam.some((c) => c.id === id),

      moveToTeam: (id: number) => {
        const { activeTeam, box } = get();
        if (activeTeam.length >= MAX_ACTIVE_TEAM) return;
        const pokemon = box.find((c) => c.id === id);
        if (!pokemon) return;
        set({
          activeTeam: [...activeTeam, pokemon],
          box: box.filter((c) => c.id !== id),
        });
      },

      moveToBox: (id: number) => {
        const { activeTeam, box } = get();
        const pokemon = activeTeam.find((c) => c.id === id);
        if (!pokemon) return;
        set({
          activeTeam: activeTeam.filter((c) => c.id !== id),
          box: [...box, pokemon],
        });
      },

      swapPokemon: (boxId: number, teamId: number) => {
        const { activeTeam, box } = get();
        const boxPokemon = box.find((c) => c.id === boxId);
        const teamPokemon = activeTeam.find((c) => c.id === teamId);
        if (!boxPokemon || !teamPokemon) return;
        set({
          activeTeam: activeTeam.map((c) => (c.id === teamId ? boxPokemon : c)),
          box: box.map((c) => (c.id === boxId ? teamPokemon : c)),
        });
      },
    }),
    {
      name: 'trainer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        activeTeam: state.activeTeam,
        box: state.box,
      }),
    }
  )
);
