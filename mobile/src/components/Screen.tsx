import { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { getPalette, spacing } from '@/src/constants/theme';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const scheme = useColorScheme();
  const palette = getPalette(scheme);

  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
});
