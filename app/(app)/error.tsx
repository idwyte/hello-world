// Obsidian Kinetic: st · Error — Figma node 50:220.
// Generic data-load failure. Route params: title / message / retryHref.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { StateScreen } from '@/components/obsidian';
import { color, radius, type } from '@/lib/obsidian/tokens';

export default function ErrorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title?: string;
    message?: string;
    retryHref?: string;
  }>();

  return (
    <StateScreen
      onBack={() => router.back()}
      icon={
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.full,
            borderWidth: 2,
            borderColor: color.error,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{ ...type.headlineLg, color: color.error, lineHeight: 36 }}
          >
            !
          </Text>
        </View>
      }
      kicker="SOMETHING WENT WRONG"
      title={params.title || "We couldn't load that"}
      body={
        params.message ||
        "Check your connection and try again. Your progress is saved — nothing's lost."
      }
      primaryLabel="Try again"
      onPrimary={() =>
        router.replace(
          (params.retryHref || '/home') as Parameters<
            typeof router.replace
          >[0],
        )
      }
    />
  );
}
