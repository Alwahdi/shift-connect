import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography } from '@/config/theme';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, name = '', size = 44 }) => {
  const { colors } = useTheme();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View style={[
      styles.placeholder,
      {
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: colors.primary + '20',
      },
    ]}>
      <Text style={[styles.initials, { color: colors.primary, fontSize: size * 0.38 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: { backgroundColor: '#E5E7EB' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: Typography.weights.bold },
});
