import { useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

import { semantic } from '@/lib/theme';

import { Body } from './Body';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
};

export function TextField({
  label,
  error,
  leadingIcon,
  trailingIcon,
  className = '',
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? 'border-feedback-danger'
    : focused
      ? 'border-interactive-primary'
      : 'border-border-default';

  return (
    <View className={className}>
      {label ? (
        <Body size="xs" color="muted" weight="medium" className="mb-2">
          {label}
        </Body>
      ) : null}
      <View
        className={`flex-row items-center bg-surface-raised border ${borderColor} rounded-lg px-4 h-12`}
      >
        {leadingIcon ? <View className="mr-2">{leadingIcon}</View> : null}
        <TextInput
          className="flex-1 text-text-primary font-sans text-body-md"
          placeholderTextColor={semantic.textMuted}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {trailingIcon ? <View className="ml-2">{trailingIcon}</View> : null}
      </View>
      {error ? (
        <Body size="xs" color="danger" weight="medium" className="mt-1">
          {error}
        </Body>
      ) : null}
    </View>
  );
}
