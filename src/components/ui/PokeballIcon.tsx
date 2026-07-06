import React from 'react';
import { View } from 'react-native';

interface Props {
  size?: number;
  open?: boolean;
}

export const PokeballIcon: React.FC<Props> = ({ size = 22, open = false }) => {
  const r = size / 2;
  const lineH = Math.max(2, Math.round(size * 0.1));
  const btnR = Math.round(size * 0.19);

  if (open) {
    // Two halves separated to show the ball is open (releasing)
    return (
      <View style={{ width: size, height: size + 7, alignItems: 'center', justifyContent: 'center' }}>
        {/* Top half — raised */}
        <View style={{
          width: size, height: r,
          backgroundColor: '#EF4444',
          borderTopLeftRadius: r, borderTopRightRadius: r,
          borderWidth: 2, borderColor: '#fff',
          borderBottomWidth: 0,
          marginBottom: 5,
        }}>
          <View style={{
            position: 'absolute', top: 3, left: 5,
            width: size * 0.28, height: r * 0.32,
            backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 4,
          }} />
        </View>
        {/* Bottom half */}
        <View style={{
          width: size, height: r,
          backgroundColor: '#fff',
          borderBottomLeftRadius: r, borderBottomRightRadius: r,
          borderWidth: 2, borderColor: '#fff',
          borderTopWidth: 0,
        }} />
        {/* Center button floating between halves */}
        <View style={{
          position: 'absolute',
          top: r - btnR - 3,
          width: btnR * 2, height: btnR * 2, borderRadius: btnR,
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderWidth: 2, borderColor: '#fff',
        }} />
      </View>
    );
  }

  // Closed pokeball
  return (
    <View style={{
      width: size, height: size, borderRadius: r,
      overflow: 'hidden',
      borderWidth: 2, borderColor: '#fff',
    }}>
      {/* Top half red */}
      <View style={{ width: size, height: r, backgroundColor: '#EF4444' }}>
        <View style={{
          position: 'absolute', top: 2, left: 4,
          width: size * 0.28, height: r * 0.32,
          backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 4,
        }} />
      </View>
      {/* Bottom half white */}
      <View style={{ width: size, height: r, backgroundColor: '#fff' }} />
      {/* Dividing line */}
      <View style={{
        position: 'absolute', top: r - lineH / 2,
        width: size, height: lineH, backgroundColor: '#fff',
      }} />
      {/* Center button */}
      <View style={{
        position: 'absolute',
        top: r - btnR, left: r - btnR,
        width: btnR * 2, height: btnR * 2, borderRadius: btnR,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderWidth: 2, borderColor: '#fff',
      }} />
    </View>
  );
};
