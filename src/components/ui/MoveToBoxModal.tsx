import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'tamagui';
import { Colors } from '../../constants/colors';

interface Props {
  visible: boolean;
  pokemonName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MoveToBoxModal({ visible, pokemonName, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>🧪 ¿Enviar al Laboratorio?</Text>
          <Text style={styles.body}>
            {`${pokemonName} será guardado en el Laboratorio Pokémon. Puedes recuperarlo al equipo en cualquier momento usando la Máquina de Transferencias.`}
          </Text>
          <View style={styles.actions}>
            <Pressable style={styles.btnCancel} onPress={onCancel}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.btnConfirm} onPress={onConfirm}>
              <Text style={styles.btnConfirmText}>Al Laboratorio</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnCancelText: {
    color: Colors.text,
    fontSize: 14,
  },
  btnConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.indigo,
  },
  btnConfirmText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
});
