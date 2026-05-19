import { Pressable, type PressableProps, View } from 'react-native';

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

// Settings-list row. Lives inside a <Card padding="none">; rows separated by
// 1-px borders via the parent's divider styling.
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
          <Body size="sm" color="muted">
            {sublabel}
          </Body>
        ) : null}
      </View>
      {trailing ? (
        <View className="ml-2">{trailing}</View>
      ) : showChevron ? (
        <Body size="md" color="muted">
          ›
        </Body>
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View
        className={`flex-row items-center px-4 h-14 ${className}`}
      >
        {Content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 h-14 active:bg-surface-sunken ${className}`}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
    >
      {Content}
    </Pressable>
  );
}
