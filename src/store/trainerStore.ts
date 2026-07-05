import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TrainerStoreState,
  Step1Data,
  Step2Data,
  TrainerProfile,
} from '../features/trainer/types/trainer.types';

export const useTrainerStore = create<TrainerStoreState>()(
  persist(
    (set, get) => ({
      profile: null,
      step1Data: null,
      isEditing: false,

      setStep1Data: (data: Step1Data) => {
        set({ step1Data: data });
      },

      setStep2Data: (data: Step2Data) => {
        const step1 = get().step1Data;
        if (!step1) return;
        const profile: TrainerProfile = { ...step1, ...data };
        set({ profile });
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
    }),
    {
      name: 'trainer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);