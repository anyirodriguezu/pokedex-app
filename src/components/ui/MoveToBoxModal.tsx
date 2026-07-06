import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'tamagui';

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
          <Text style={styles.title}>📦 ¿Enviar a la Caja PC?</Text>
          <Text style={styles.body}>
            {`${pokemonName} será guardado en tu Caja PC. Podrás recuperarlo y añadirlo a tu equipo en cualquier momento.`}
          </Text>
          <View style={styles.actions}>
            <Pressable style={styles.btnCancel} onPress={onCancel}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.btnConfirm} onPress={onConfirm}>
              <Text style={styles.btnConfirmText}>Enviar a la Caja</Text>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
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
    borderColor: '#ddd',
  },
  btnCancelText: {
    color: '#444',
    fontSize: 14,
  },
  btnConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  btnConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
