import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { borderRadius } from '@/constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadiusValue?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 16,
  borderRadiusValue = borderRadius.sm,
  style,
}) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius: borderRadiusValue,
          backgroundColor: colors.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={[skeletonStyles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={skeletonStyles.row}>
        <SkeletonLoader width={44} height={44} borderRadiusValue={22} />
        <View style={skeletonStyles.textBlock}>
          <SkeletonLoader width={140} height={16} />
          <SkeletonLoader width={100} height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
      <SkeletonLoader height={14} style={{ marginTop: 16 }} />
      <SkeletonLoader width="70%" height={14} style={{ marginTop: 8 }} />
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBlock: {
    marginLeft: 12,
    flex: 1,
  },
});
