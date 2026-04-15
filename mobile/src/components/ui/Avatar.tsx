import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { borderRadius, typography, colors as themeColors } from '@/constants/theme';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 44,
  showBorder = false,
}) => {
  const { colors } = useTheme();

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: themeColors.primary[100],
    borderWidth: showBorder ? 2 : 0,
    borderColor: colors.background,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, containerStyle]}
      />
    );
  }

  const fontSize = size * 0.36;

  return (
    <View style={[styles.fallback, containerStyle]}>
      <Text style={[styles.initials, { fontSize, color: themeColors.primary[600] }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    overflow: 'hidden',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
  },
});
