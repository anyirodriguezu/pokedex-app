import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { TrainerStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { TrainerCard } from '../components/TrainerCard';
import { Text, YStack } from 'tamagui';

type Props = NativeStackScreenProps<TrainerStackParamList, 'Summary'>;

export const SummaryScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, isEditing, startEdit } = useTrainerStore();

  useEffect(() => {
    if (!profile && !isEditing) {
      navigation.popToTop();
    }
  }, [profile, isEditing, navigation]);

  const handleEditProfile = () => {
    startEdit();
    navigation.popToTop();
  };

  if (!profile) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text fontSize={26} fontWeight="800" color="$appText" text="center">
        ¡Registro completado! 🎉
      </Text>
      <Text fontSize={15} color="$textSecondary" text="center" mt="$-2">
        Tu tarjeta de entrenador está lista
      </Text>

      <TrainerCard profile={profile} />

      <Button label="Editar perfil" onPress={handleEditProfile} variant="outline" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
});
