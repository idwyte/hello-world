import { ChevronLeft } from 'lucide-react-native';
import { Pressable, View, type ViewProps } from 'react-native';

import { semantic } from '@/lib/theme';

import { Body } from './Body';

// 4 variants observed in Figma:
//   greeting     — home (`80:847`)     · h-14, items-end, greeting + name + right trailing
//   title        — progress (`80:854`) · h-14, items-center, big title + optional trailing pill
//   large-title  — program/settings (`84:877`) · h-20 stacked, trailing row + big title row
//   detail       — legal viewer (`84:869`/`84:871`) · h-14, back chevron + centered title
type Kind = 'greeting' | 'large-title' | 'title' | 'detail';

type Props = ViewProps & {
  kind: Kind;
  greeting?: string;
  name?: string;
  title?: string;
  trailing?: React.ReactNode;
  onBack?: () => void;
  className?: string;
};

export function ScreenHeader({
  kind,
  greeting,
  name,
  title,
  trailing,
  onBack,
  className = '',
  ...rest
}: Props) {
  if (kind === 'detail') {
    // Back chevron (44×44 hit target) + centered title + balancing 44×44
    // slot so the title is screen-centered. Sub-page chrome shared by the
    // legal viewer and other detail screens.
    return (
      <View
        className={`h-14 flex-row items-center px-4 ${className}`}
        {...rest}
      >
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          className="w-11 h-11 items-center justify-center active:opacity-60"
        >
          <ChevronLeft size={24} color={semantic.textPrimary} />
        </Pressable>
        <View className="flex-1 items-center">
          {title ? (
            <Body
              weight="semibold"
              color="primary"
              style={{ fontSize: 17, lineHeight: 24 }}
            >
              {title}
            </Body>
          ) : null}
        </View>
        <View className="w-11 h-11 items-center justify-center">{trailing}</View>
      </View>
    );
  }

  if (kind === 'greeting') {
    return (
      <View
        className={`h-14 flex-row items-end justify-between px-4 py-1.5 ${className}`}
        {...rest}
      >
        <View>
          {greeting ? (
            <Body size="sm" color="muted">
              {greeting}
            </Body>
          ) : null}
          {name ? (
            <Body
              weight="semibold"
              color="primary"
              style={{ fontSize: 22, lineHeight: 28 }}
            >
              {name}
            </Body>
          ) : null}
        </View>
        {trailing}
      </View>
    );
  }

  if (kind === 'title') {
    return (
      <View
        className={`h-14 flex-row items-center justify-between px-4 ${className}`}
        {...rest}
      >
        {title ? (
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 28, lineHeight: 36 }}
          >
            {title}
          </Body>
        ) : null}
        {trailing}
      </View>
    );
  }

  // large-title — h-20 (44 + 36), trailing on top row, title on bottom row
  return (
    <View className={`h-20 px-4 ${className}`} {...rest}>
      <View className="h-11 flex-row items-center justify-end">
        {trailing}
      </View>
      <View className="h-9 flex-row items-end">
        {title ? (
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 28, lineHeight: 36 }}
          >
            {title}
          </Body>
        ) : null}
      </View>
    </View>
  );
}
