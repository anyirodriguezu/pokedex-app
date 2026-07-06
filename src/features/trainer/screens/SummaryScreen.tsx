import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/ui/Button';
import { ReleaseModal } from '../../../components/ui/ReleaseModal';
import { Colors } from '../../../constants/colors';
import { TrainerStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { TrainerCard } from '../components/TrainerCard';
import { Text, YStack } from 'tamagui';

type Props = NativeStackScreenProps<TrainerStackParamList, 'Summary'>;

export const SummaryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { profile, isEditing, startEdit, setStep1Data, releaseStarterPokemon } =
    useTrainerStore();
  const fromEdit = route.params?.fromEdit ?? false;
  const insets = useSafeAreaInsets();
  const bannerTranslateY = useRef(new Animated.Value(-80)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;
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
        Animated.parallel([
          Animated.timing(bannerTranslateY, { toValue: 0, duration: 350, useNativeDriver: true }),
          Animated.timing(bannerOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]),
        Animated.delay(2000),
        Animated.parallel([
          Animated.timing(bannerTranslateY, { toValue: -80, duration: 300, useNativeDriver: true }),
          Animated.timing(bannerOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [fromEdit, bannerTranslateY, bannerOpacity]);

  const handleEditBasic = () => {
    if (!profile) return;
    setStep1Data({ fullName: profile.fullName, age: profile.age, email: profile.email });
    startEdit();
    navigation.navigate('Step1PersonalData', { mode: 'edit-basic' });
  };

  const handleEditPreferences = () => {
    if (!profile) return;
    setStep1Data({ fullName: profile.fullName, age: profile.age, email: profile.email });
    startEdit();
    navigation.navigate('Step2Preferences', { mode: 'edit-preferences' });
  };

  const handleConfirmReleaseStarter = () => {
    releaseStarterPokemon();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowReleaseModal(false);
  };

  if (!profile) {
    return null;
  }

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
          Tu Tarjeta de Entrenador 🎖️
        </Text>
        <Text
          fontSize={15}
          color="$textSecondary"
          style={{ textAlign: 'center' }}
          mt="$-2"
        >
          Gestiona tu perfil de aventurero
        </Text>

        <TrainerCard profile={profile} />

        <YStack gap="$3">
          <Button label="✏️ Editar datos básicos" onPress={handleEditBasic} variant="outline" />
          <Button
            label="🎮 Editar preferencias"
            onPress={handleEditPreferences}
            variant="outline"
          />
          {profile.starterPokemon && (
            <Button
              label={`🔓 Liberar a ${profile.starterPokemon.name}`}
              variant="secondary"
              onPress={() => setShowReleaseModal(true)}
            />
          )}
        </YStack>
      </ScrollView>

      <ReleaseModal
        visible={showReleaseModal}
        pokemonName={profile.starterPokemon?.name ?? ''}
        context="profile"
        onConfirm={handleConfirmReleaseStarter}
        onCancel={() => setShowReleaseModal(false)}
      />

      <Animated.View
        style={[
          styles.banner,
          {
            top: insets.top + 8,
            opacity: bannerOpacity,
            transform: [{ translateY: bannerTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        <Text fontSize={22}>✅</Text>
        <YStack ml="$2" gap="$0.5">
          <Text fontSize={14} fontWeight="700" color="$textLight">
            Perfil actualizado
          </Text>
          <Text fontSize={12} fontWeight="400" color="$textLight" opacity={0.85}>
            Los cambios se guardaron correctamente
          </Text>
        </YStack>
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
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: Colors.success,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
});
