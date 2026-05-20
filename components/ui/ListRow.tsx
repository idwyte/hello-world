import { ChevronRight } from 'lucide-react-native';
import { Pressable, type PressableProps, View } from 'react-native';

import { semantic } from '@/lib/theme';
import { Body } from './Body';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  sublabel?: string;
  leadingIcon?: React.ReactNode;
  trailing?: React.ReactNode;
  destructive?: boolean;
  showChevron?: boolean;
  className?: string;
};

// Settings-list row per Figma 11·settings (`94:229`).
// Padding px-5 (20) py-4 (16). Title 16/24 ink (danger for destructive).
// Trailing slot supports: value text + chevron, toggle, just chevron, nothing.
export function ListRow({
  label,
  sublabel,
  leadingIcon,
  trailing,
  destructive = false,
  showChevron = false,
  className = '',
  onPress,
  ...rest
}: Props) {
  const Content = (
    <>
      {leadingIcon ? <View className="mr-3">{leadingIcon}</View> : null}
      <View className="flex-1">
        <Body
          size="md"
          color={destructive ? 'danger' : 'primary'}
          weight="regular"
        >
          {label}
        </Body>
        {sublabel ? (
          <Body
            color="muted"
            style={{ fontSize: 13, lineHeight: 18 }}
            className="mt-0.5"
          >
            {sublabel}
          </Body>
        ) : null}
      </View>
      {trailing ? (
        <View className="ml-2.5 flex-row items-center">{trailing}</View>
      ) : null}
      {showChevron && !trailing ? (
        <ChevronRight
          size={18}
          color={semantic.textMuted}
          strokeWidth={2}
        />
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View
        className={`flex-row items-center px-5 py-4 ${className}`}
      >
        {Content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-5 py-4 active:bg-surface-sunken ${className}`}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
    >
      {Content}
    </Pressable>
  );
}
