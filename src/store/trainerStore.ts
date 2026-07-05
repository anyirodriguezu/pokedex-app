import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TrainerStoreState,
  Step1Data,
  Step2Data,
  TrainerProfile,
  CapturedPokemon,
} from '../features/trainer/types/trainer.types';

export const useTrainerStore = create<TrainerStoreState>()(
  persist(
    (set, get) => ({
      profile: null,
      step1Data: null,
      isEditing: false,
      captured: [],

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
        set({ profile: null, step1Data: null, isEditing: false });
      },

      startEdit: () => {
        set({ isEditing: true });
      },

      startCreate: () => {
        set({ isEditing: false, step1Data: null });
      },

      capture: (pokemon: CapturedPokemon) => {
        const captured = get().captured;
        if (captured.some((c) => c.id === pokemon.id)) return;
        set({ captured: [...captured, pokemon] });
      },

      release: (id: number) => {
        set({ captured: get().captured.filter((c) => c.id !== id) });
      },

      isCaptured: (id: number) => get().captured.some((c) => c.id === id),
    }),
    {
      name: 'trainer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ profile: state.profile, captured: state.captured }),
    }
  )
);
