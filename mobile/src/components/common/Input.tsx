import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { theme } from '@/src/constants/theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  multiline?: boolean;
  secureToggle?: boolean;
};

export function Input({ label, error, helperText, secureTextEntry, secureToggle, multiline, style, ...props }: InputProps) {
  const [isSecure, setIsSecure] = useState(Boolean(secureTextEntry));

  const description = useMemo(() => error ?? helperText, [error, helperText]);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputContainer, multiline && styles.multilineContainer, error && styles.errorBorder]}>
        <TextInput
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, multiline && styles.multilineInput, style]}
          secureTextEntry={secureToggle ? isSecure : secureTextEntry}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...props}
        />
        {secureToggle ? (
          <Pressable onPress={() => setIsSecure((current) => !current)} style={styles.iconButton}>
            <Ionicons name={isSecure ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {description ? <Text style={[styles.description, error && styles.errorText]}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.heading,
    fontWeight: '700',
  },
  inputContainer: {
    minHeight: 50,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    minHeight: 120,
    paddingTop: theme.spacing.md,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.body,
  },
  multilineInput: {
    minHeight: 100,
  },
  description: {
    color: theme.colors.muted,
    fontSize: theme.typography.sizes.xs,
  },
  errorBorder: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
  },
  iconButton: {
    paddingLeft: theme.spacing.sm,
  },
});
