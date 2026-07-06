import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { CapturedPokemon } from '../../features/trainer/types/trainer.types';

interface Props {
  visible: boolean;
  newPokemon: CapturedPokemon | null;
  activeTeam: CapturedPokemon[];
  onSendToBox: () => void;
  onSwap: (teamMemberId: number) => void;
  onCancel: () => void;
}

export const TeamFullModal: React.FC<Props> = ({
  visible,
  newPokemon,
  activeTeam,
  onSendToBox,
  onSwap,
  onCancel,
}) => {
  if (!newPokemon) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Image
              source={{ uri: newPokemon.sprite }}
              style={styles.newSprite}
              resizeMode="contain"
              accessibilityLabel={newPokemon.name}
            />
            <View style={styles.headerTextBlock}>
              <Text style={styles.cardTitle}>¡Equipo completo! ⚡</Text>
              <Text style={styles.cardSubtitle}>
                <Text style={styles.highlight}>{newPokemon.name}</Text> quiere unirse.{'\n'}
                Toca a quién reemplaza o envíalo al Laboratorio.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Selecciona quién sale del equipo</Text>

          <ScrollView style={styles.teamScroll} showsVerticalScrollIndicator={false}>
            {activeTeam.map((member) => (
              <Pressable
                key={member.id}
                style={styles.memberRow}
                onPress={() => onSwap(member.id)}
                accessibilityRole="button"
                accessibilityLabel={`Reemplazar a ${member.name}`}
              >
                <Image
                  source={{ uri: member.sprite }}
                  style={styles.memberSprite}
                  resizeMode="contain"
                />
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.swapArrow}>⇄</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.footerActions}>
            <Pressable
              style={styles.btnBox}
              onPress={onSendToBox}
              accessibilityRole="button"
              accessibilityLabel="Enviar al Laboratorio"
            >
              <Text style={styles.btnBoxText}>🧪 Enviar al Laboratorio</Text>
            </Pressable>
            <Pressable
              style={styles.btnCancelFull}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancelar captura"
            >
              <Text style={styles.btnCancelText}>Cancelar captura</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerTextBlock: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  highlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  newSprite: {
    width: 72,
    height: 72,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  teamScroll: {
    maxHeight: 280,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#eee',
    marginBottom: 8,
    backgroundColor: '#fafafa',
    gap: 12,
  },
  memberSprite: {
    width: 50,
    height: 50,
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  swapArrow: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '700',
  },
  footerActions: {
    gap: 10,
  },
  btnBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnBoxText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  btnCancelFull: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  btnCancelText: {
    color: '#666',
    fontSize: 14,
  },
});
