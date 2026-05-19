import { View, type ViewProps } from 'react-native';

import { Body } from './Body';
import { Card } from './Card';
import { SectionLabel } from './SectionLabel';

type Props = ViewProps & {
  kicker: string;
  value: string;
  sub?: string;
  className?: string;
};

// "THIS WEEK · 5 / 7 · 3 to go" stat tile per Figma 08·home (`72:62`).
export function Stat({ kicker, value, sub, className = '', ...rest }: Props) {
  return (
    <Card padding="md" radius="xl" className={`flex-1 ${className}`} {...rest}>
      <SectionLabel>{kicker}</SectionLabel>
      <Body
        size="lg"
        weight="semibold"
        className="text-text-primary mt-1"
        style={{ fontSize: 28, lineHeight: 34 }}
      >
        {value}
      </Body>
      {sub ? (
        <Body size="xs" color="muted" weight="regular">
          {sub}
        </Body>
      ) : (
        <View className="h-4" />
      )}
    </Card>
  );
}
