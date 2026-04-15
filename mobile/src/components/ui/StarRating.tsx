import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/theme';

interface StarRatingProps {
  rating: number;
  size?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 20,
  editable = false,
  onRatingChange,
}) => {
  const handlePress = (star: number) => {
    if (editable && onRatingChange) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRatingChange(star);
    }
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const halfFilled = !filled && rating >= star - 0.5;
        
        const icon = filled ? 'star' : halfFilled ? 'star-half' : 'star-outline';
        const color = filled || halfFilled ? colors.warning[400] : colors.neutral[300];

        if (editable) {
          return (
            <TouchableOpacity
              key={star}
              onPress={() => handlePress(star)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Ionicons name={icon} size={size} color={color} style={styles.star} />
            </TouchableOpacity>
          );
        }

        return (
          <Ionicons key={star} name={icon} size={size} color={color} style={styles.star} />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});
