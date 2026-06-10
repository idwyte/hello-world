// Obsidian Kinetic: st · Check Email — Figma node 50:185.
// Cyan envelope, CHECK YOUR INBOX kicker, Open mail app + Resend link
// (ghost, gated by a 30 s countdown). Resend wiring unchanged.
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { Alert, Linking } from 'react-native';

import { StateScreen } from '@/components/obsidian';
import { sendMagicLink } from '@/lib/auth';
import { color } from '@/lib/obsidian/tokens';

const RESEND_INTERVAL_S = 30;

export default function CheckEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [remaining, setRemaining] = useState(RESEND_INTERVAL_S);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const id = setInterval(
      () => setRemaining((r) => (r > 0 ? r - 1 : 0)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  async function handleResend() {
    if (remaining > 0 || resending || !email) return;
    setResending(true);
    try {
      await sendMagicLink(email);
      setRemaining(RESEND_INTERVAL_S);
    } catch (e) {
      Alert.alert(
        'Could not resend',
        e instanceof Error ? e.message : 'Please try again in a moment.',
      );
    } finally {
      setResending(false);
    }
  }

  const ghostLabel =
    remaining > 0
      ? `Resend in 0:${String(remaining).padStart(2, '0')}`
      : resending
        ? 'Sending…'
        : 'Resend link';

  return (
    <StateScreen
      onBack={() => router.back()}
      icon={<Mail size={56} color={color.secondaryContainer} strokeWidth={1.5} />}
      kicker="CHECK YOUR INBOX"
      title="Check your email"
      body={`We've sent a sign-in link to ${email || 'your email'}. Tap it on this device and you'll be straight in.`}
      primaryLabel="Open mail app"
      onPrimary={() => {
        Linking.openURL('mailto:').catch(() => router.replace('/home'));
      }}
      ghostLabel={ghostLabel}
      onGhost={() => void handleResend()}
    />
  );
}
