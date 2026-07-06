import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'tamagui';

export interface ReleaseModalProps {
  visible: boolean;
  pokemonName: string;
  onConfirm: () => void;
  onCancel: () => void;
  context: 'detail' | 'team' | 'profile';
}

type ContextText = {
  title: (name: string) => string;
  body: (name: string) => string;
  cancel: string;
  confirm: string | ((name: string) => string);
};

const TEXTS: Record<ReleaseModalProps['context'], ContextText> = {
  detail: {
    title: (name) => `¿Dejar ir a ${name}?`,
    body: (name) =>
      `¿Estás seguro de que quieres liberar a ${name}? Una vez que se vaya, deberás encontrarlo de nuevo en tu aventura.`,
    cancel: 'No, quedármelo',
    confirm: 'Sí, liberarlo',
  },
  team: {
    title: (name) => `¿Liberar a ${name} de tu equipo?`,
    body: (name) =>
      `${name} abandonará tu equipo y regresará a la naturaleza. Esta acción no se puede deshacer.`,
    cancel: 'Cancelar',
    confirm: 'Liberar',
  },
  profile: {
    title: (name) => `¿Liberar a tu compañero ${name}?`,
    body: (name) =>
      `${name} ha sido tu compañero desde el inicio. Si lo liberas, podrás elegir un nuevo Pokémon inicial la próxima vez que actualices tu perfil.`,
    cancel: 'Cancelar',
    confirm: (name) => `Liberar a ${name}`,
  },
};

export function ReleaseModal({
  visible,
  pokemonName,
  onConfirm,
  onCancel,
  context,
}: ReleaseModalProps) {
  const text = TEXTS[context];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{text.title(pokemonName)}</Text>
          <Text style={styles.body}>{text.body(pokemonName)}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.btnCancel} onPress={onCancel}>
              <Text style={styles.btnCancelText}>{text.cancel}</Text>
            </Pressable>
            <Pressable style={styles.btnConfirm} onPress={onConfirm}>
              <Text style={styles.btnConfirmText}>
                {typeof text.confirm === 'function'
                  ? text.confirm(pokemonName)
                  : text.confirm}
              </Text>
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
    backgroundColor: '#E53935',
  },
  btnConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
