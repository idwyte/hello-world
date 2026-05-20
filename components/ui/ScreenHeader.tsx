import { View, type ViewProps } from 'react-native';

import { Body } from './Body';

// 3 variants observed in Figma across the 4 tab destinations:
//   greeting     — home (`80:847`)     · h-14, items-end, greeting + name + right trailing
//   title        — progress (`80:854`) · h-14, items-center, big title + optional trailing pill
//   large-title  — program/settings (`84:877`) · h-20 stacked, trailing row + big title row
type Kind = 'greeting' | 'large-title' | 'title';

type Props = ViewProps & {
  kind: Kind;
  greeting?: string;
  name?: string;
  title?: string;
  trailing?: React.ReactNode;
  className?: string;
};

export function ScreenHeader({
  kind,
  greeting,
  name,
  title,
  trailing,
  className = '',
  ...rest
}: Props) {
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
