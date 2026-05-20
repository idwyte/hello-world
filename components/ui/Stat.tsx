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

// Stat tile per Figma 08·home (`72:62`).
// Fixed width 173 px (NOT flex-1): two stats with gap-3 between them tile
// exactly into the 358-px content column. bg surface, no border, p-16,
// rounded-16. Kicker uses 'tight' tracking (1.2 px).
export function Stat({ kicker, value, sub, className = '', ...rest }: Props) {
  return (
    <Card
      padding="md"
      radius="card"
      className={`w-[173px] ${className}`}
      {...rest}
    >
      <SectionLabel tracking="tight">{kicker}</SectionLabel>
      <Body
        weight="semibold"
        color="primary"
        className="mt-1"
        style={{ fontSize: 28, lineHeight: 34 }}
      >
        {value}
      </Body>
      {sub ? (
        <Body size="xs" color="muted" weight="regular" className="mt-0.5">
          {sub}
        </Body>
      ) : (
        <View className="h-4" />
      )}
    </Card>
  );
}
