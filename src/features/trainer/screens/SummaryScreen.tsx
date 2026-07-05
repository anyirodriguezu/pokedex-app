import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Colors } from '../../../constants/colors';
import { TrainerStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { TrainerCard } from '../components/TrainerCard';
import { Text, YStack } from 'tamagui';

type Props = NativeStackScreenProps<TrainerStackParamList, 'Summary'>;

export const SummaryScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, isEditing, startEdit, resetProfile } = useTrainerStore();

  useEffect(() => {
    if (!profile && !isEditing) {
      navigation.popToTop();
    }
  }, [profile, isEditing, navigation]);

  const handleEditProfile = () => {
    startEdit();
    navigation.popToTop();
  };

  const handleNewProfile = () => {
    resetProfile();
  };

  if (!profile) {
    return null;
  }

  return (
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
        <Button label="Crear nuevo perfil" onPress={handleNewProfile} variant="secondary" />
      </YStack>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
});