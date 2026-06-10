// Obsidian Kinetic — Input.
// Figma: Input [3] — Default / Focused / Error. Mono caps label above;
// dark field; 1px border → Cyan Pulse on focus, error palette on error.
import { useState } from 'react';
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { color, radius, spacing, type } from '@/lib/obsidian/tokens';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Non-empty string switches the field into the error state. */
  error?: string;
  containerStyle?: ViewStyle;
};

export function Input({ label, error, containerStyle, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? color.error
    : focused
      ? color.secondaryContainer
      : color.outlineVariant;

  return (
    <View style={containerStyle}>
      <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
        {label}
      </Text>
      <TextInput
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        placeholderTextColor={color.outline}
        style={{
          marginTop: spacing.stackSm,
          paddingHorizontal: spacing.stackMd,
          paddingVertical: 14,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor,
          backgroundColor: color.surfaceContainerLow,
          color: color.onSurface,
          ...type.bodyMd,
        }}
      />
      {error ? (
        <Text
          style={{
            ...type.labelCaps,
            color: color.error,
            marginTop: spacing.stackSm,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
