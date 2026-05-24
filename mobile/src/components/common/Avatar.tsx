import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/src/constants/theme';

export function Avatar({ uri, name, size = 48 }: { uri?: string | null; name: string; size?: number }) {
  const imageStyle = useMemo(
    () => ({ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E8ECF0' as const }),
    [size],
  );
  const fallbackStyle = useMemo(() => ({ width: size, height: size, borderRadius: size / 2 }), [size]);
  const initialsStyle = useMemo(() => ({ fontSize: size / 2.6 }), [size]);
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  if (uri) {
    return <Image source={{ uri }} style={imageStyle} contentFit="cover" />;
  }

  return (
    <View style={[styles.fallback, fallbackStyle]}>
      <Text style={[styles.initials, initialsStyle]}>{initials || '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#EEE8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontFamily: theme.typography.heading,
  },
});
