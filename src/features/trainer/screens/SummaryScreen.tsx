import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Colors } from '../../../constants/colors';
import { TrainerStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { TrainerCard } from '../components/TrainerCard';

type Props = NativeStackScreenProps<TrainerStackParamList, 'Summary'>;

export const SummaryScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, startEdit } = useTrainerStore();

  const handleEditProfile = () => {
    startEdit();
    navigation.navigate('Step1PersonalData');
  };

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay datos de entrenador aún.</Text>
        <Button label="Crear perfil" onPress={() => navigation.navigate('Step1PersonalData')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.congrats}>¡Registro completado! 🎉</Text>
      <Text style={styles.subtitle}>Tu tarjeta de entrenador está lista</Text>

      <TrainerCard profile={profile} />

      <Button label="Editar perfil" onPress={handleEditProfile} variant="outline" />
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
  congrats: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: -8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
