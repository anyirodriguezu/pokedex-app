import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, XStack } from 'tamagui';
import { getPokemonIdFromUrl, getPokemonImageUrl, capitalize } from '../../../utils/pokemonHelpers';
import { EvolutionChainLink, EvolutionDetail } from '../types/pokemon.types';

interface EvolutionNode {
  id: number;
  name: string;
  trigger: string;
}

type EvolutionStage = EvolutionNode[];

function buildTriggerLabel(detail: EvolutionDetail): string {
  const t = detail.trigger.name;

  if (t === 'level-up') {
    if (detail.min_level) return `Nv. ${detail.min_level}`;
    if (detail.min_happiness) return 'Amistad ♥';
    if (detail.min_affection) return 'Cariño ♥';
    if (detail.min_beauty) return 'Belleza';
    if (detail.known_move) return `Mov: ${capitalize(detail.known_move.name.replace(/-/g, ' '))}`;
    if (detail.known_move_type) return `Tipo ${capitalize(detail.known_move_type.name)}`;
    if (detail.location) return capitalize(detail.location.name.replace(/-/g, ' '));
    if (detail.time_of_day === 'night') return 'Noche';
    if (detail.time_of_day === 'day') return 'Día';
    if (detail.needs_overworld_rain) return 'Con lluvia';
    if (detail.turn_upside_down) return 'Boca abajo';
    return 'Nivel';
  }
  if (t === 'use-item') {
    const item = detail.item ?? detail.held_item;
    return item ? capitalize(item.name.replace(/-/g, ' ')) : 'Objeto';
  }
  if (t === 'trade') {
    if (detail.held_item) return `Intercambio\n${capitalize(detail.held_item.name.replace(/-/g, ' '))}`;
    if (detail.trade_species) return `Intercambio\n${capitalize(detail.trade_species.name)}`;
    return 'Intercambio';
  }
  if (t === 'shed') return 'Muda';
  if (t === 'spin') return 'Girar';
  if (t === 'tower-of-darkness') return 'Torre Oscura';
  if (t === 'tower-of-waters') return 'Torre Agua';
  if (t === 'three-critical-hits') return '3 Críticos';
  if (t === 'take-damage') return 'Recibir daño';
  if (t === 'other') return 'Especial';
  return capitalize(t.replace(/-/g, ' '));
}

function parseChain(link: EvolutionChainLink): EvolutionStage[] {
  const stages: EvolutionStage[] = [];

  function traverse(node: EvolutionChainLink, depth: number) {
    if (!stages[depth]) stages[depth] = [];

    const id = getPokemonIdFromUrl(node.species.url);
    const detail = node.evolution_details[0];
    const trigger = detail ? buildTriggerLabel(detail) : '';

    stages[depth].push({ id, name: node.species.name, trigger });

    for (const child of node.evolves_to) {
      traverse(child, depth + 1);
    }
  }

  traverse(link, 0);
  return stages;
}

interface Props {
  chain: EvolutionChainLink;
  currentId: number;
  onPress: (id: number, name: string) => void;
}

export const PokemonEvolutionChain: React.FC<Props> = ({ chain, currentId, onPress }) => {
  const stages = parseChain(chain);

  if (stages.length <= 1) return null;

  // Layout: stages separated by arrow columns
  // For branching (multiple per stage), stack pokemon vertically in their column
  return (
    <Card bg="$surface" rounded={16} p="$4" elevation={2} gap="$3">
      <XStack items="center" gap="$2">
        <View style={styles.sectionBar} />
        <Text fontSize={16} fontWeight="700" color="$appText" letterSpacing={0.3}>
          Cadena de evolución
        </Text>
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chainRow}>
          {stages.map((stage, stageIndex) => (
            <React.Fragment key={stageIndex}>
              {/* Arrow + triggers column between stages */}
              {stageIndex > 0 && (
                <View style={styles.arrowCol}>
                  {stage.map((node, nodeIndex) => (
                    <View key={nodeIndex} style={styles.arrowBlock}>
                      <Text style={styles.arrowIcon}>→</Text>
                      {node.trigger.split('\n').map((line, li) => (
                        <Text key={li} style={styles.triggerText}>{line}</Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {/* Stage pokemon column */}
              <View style={styles.stageCol}>
                {stage.map((node) => {
                  const isCurrent = node.id === currentId;
                  return (
                    <Pressable
                      key={node.id}
                      style={[styles.evoCard, isCurrent && styles.evoCardCurrent]}
                      onPress={() => !isCurrent && onPress(node.id, node.name)}
                      accessibilityRole="button"
                      accessibilityLabel={capitalize(node.name)}
                      accessibilityState={{ selected: isCurrent }}
                    >
                      <Image
                        source={{ uri: getPokemonImageUrl(node.id) }}
                        style={styles.evoSprite}
                        resizeMode="contain"
                      />
                      <Text style={[styles.evoName, isCurrent && styles.evoNameCurrent]} numberOfLines={1}>
                        {capitalize(node.name)}
                      </Text>
                      {isCurrent && (
                        <View style={styles.currentDot} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  stageCol: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  arrowCol: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  arrowBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
    gap: 2,
    paddingHorizontal: 4,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#aaa',
    fontWeight: '300',
  },
  triggerText: {
    fontSize: 9,
    color: '#888',
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: 60,
  },
  evoCard: {
    alignItems: 'center',
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 4,
    position: 'relative',
  },
  evoCardCurrent: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  evoSprite: {
    width: 56,
    height: 56,
  },
  evoName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
  },
  evoNameCurrent: {
    color: '#6366F1',
    fontWeight: '800',
  },
  currentDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  sectionBar: { width: 4, height: 18, borderRadius: 2, backgroundColor: '#6366F1' },
});
