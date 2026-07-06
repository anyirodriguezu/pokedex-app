import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { ReleaseModal } from '../../../components/ui/ReleaseModal';
import { Colors } from '../../../constants/colors';
import { TrainerStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { TrainerCard } from '../components/TrainerCard';
import { Text, YStack } from 'tamagui';

type Props = NativeStackScreenProps<TrainerStackParamList, 'Summary'>;

export const SummaryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { profile, isEditing, startEdit, setStep1Data, resetProfile, releaseStarterPokemon } = useTrainerStore();
  const fromEdit = route.params?.fromEdit ?? false;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [showReleaseModal, setShowReleaseModal] = useState(false);

  useEffect(() => {
    if (!profile && !isEditing) {
      navigation.popToTop();
    }
  }, [profile, isEditing, navigation]);

  useEffect(() => {
    if (fromEdit) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [fromEdit, toastOpacity]);

  const handleEditProfile = () => {
    if (!profile) return;
    setStep1Data({ fullName: profile.fullName, age: profile.age, email: profile.email });
    startEdit();
    navigation.navigate('Step1PersonalData', { mode: 'edit' });
  };

  const handleNewProfile = () => {
    resetProfile();
  };

  if (!profile) {
    return null;
  }

  const handleConfirmReleaseStarter = () => {
    releaseStarterPokemon();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowReleaseModal(false);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        accessibilityLabel="Pantalla de perfil de entrenador"
      >
        <Text
          fontSize={26}
          fontWeight="800"
          color="$appText"
          style={{ textAlign: 'center' }}
          accessibilityRole="header"
        >
          ¡Registro completado! 🎉
        </Text>
        <Text
          fontSize={15}
          color="$textSecondary"
          style={{ textAlign: 'center' }}
          mt="$-2"
        >
          Tu tarjeta de entrenador está lista
        </Text>

        <TrainerCard profile={profile} />

        <YStack gap="$3">
          <Button label="Editar perfil" onPress={handleEditProfile} variant="outline" />
          {profile.starterPokemon && (
            <Button
              label={`Liberar a ${profile.starterPokemon.name}`}
              variant="outline"
              onPress={() => setShowReleaseModal(true)}
            />
          )}
          <Button label="Crear nuevo perfil" onPress={handleNewProfile} variant="secondary" />
        </YStack>
      </ScrollView>

      <ReleaseModal
        visible={showReleaseModal}
        pokemonName={profile.starterPokemon?.name ?? ''}
        context="profile"
        onConfirm={handleConfirmReleaseStarter}
        onCancel={() => setShowReleaseModal(false)}
      />

      <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
        <Text fontSize={14} fontWeight="600" color="$textLight">
          ✅ Perfil actualizado correctamente
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  toast: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 100,
    elevation: 8,
  },
});
