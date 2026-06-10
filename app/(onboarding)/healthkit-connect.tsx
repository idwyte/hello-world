// Obsidian Kinetic: HealthKit permission ask (iOS only — Android
// fail-silently skips to /paywall; Health Connect is a later phase).
// Connect doesn't call HKHealthStore yet — wiring lands with the
// native HealthKit module.
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { Platform } from 'react-native';

import { StateScreen } from '@/components/obsidian';
import { color } from '@/lib/obsidian/tokens';

export default function HealthkitConnect() {
  const router = useRouter();
  const finish = () => router.replace('/paywall');

  useEffect(() => {
    if (Platform.OS === 'android') {
      router.replace('/paywall');
    }
  }, [router]);

  if (Platform.OS === 'android') return null;

  return (
    <StateScreen
      onBack={finish}
      headerVariant="close"
      icon={<Heart size={56} color={color.secondaryContainer} strokeWidth={1.5} />}
      kicker="APPLE HEALTH"
      title="Log sessions to Health"
      body="Each session counts as Mindful Minutes, and your index history stays exportable. Optional — you can connect later in Settings."
      primaryLabel="Connect Health"
      onPrimary={finish}
      ghostLabel="Skip for now"
      onGhost={finish}
    />
  );
}
