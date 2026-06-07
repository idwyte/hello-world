// Figma: 22 · voice picker — node 104:624
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=104-624
// Spec: docs/hone-roadmap-state.md line 100 (Figma-derived).
//
// 4 voice cards (Calm = default · Firm · Whisper · Silent/haptics-only) ·
// per-card play preview · accent stroke + check on selection · Stealth Mode
// pairing hint at bottom.
//
// FIGMA-DIFF (stub):
//   - Per-card play-preview button not wired (no audio assets yet).
//   - Selected state shown via accent border, no check badge yet.
//   - Stealth Mode pairing hint card omitted; promote in full build.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, ScreenHeader } from '@/components/ui';
import { semantic } from '@/lib/theme';

type Voice = { id: string; name: string; description: string };

const VOICES: Voice[] = [
  { id: 'calm', name: 'Calm', description: 'Soft, encouraging tone' },
  { id: 'firm', name: 'Firm', description: 'Direct, focused cues' },
  { id: 'whisper', name: 'Whisper', description: 'Quiet, intimate guidance' },
  { id: 'silent', name: 'Silent · haptics only', description: 'Vibration cues only' },
];

export default function VoicePicker() {
  const router = useRouter();
  const [selected, setSelected] = useState('calm');

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScreenHeader kind="detail" title="Voice" onBack={() => router.back()} />

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-32 gap-2.5">
        {VOICES.map((v) => {
          const isSelected = v.id === selected;
          return (
            <Pressable
              key={v.id}
              onPress={() => setSelected(v.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={v.name}
            >
              <Card
                padding="md"
                radius="card-tight"
                className={isSelected ? 'border-2' : 'border'}
                style={{
                  borderColor: isSelected
                    ? semantic.interactivePrimary
                    : semantic.borderDefault,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Body weight="semibold" color="primary" style={{ fontSize: 17, lineHeight: 24 }}>
                      {v.name}
                    </Body>
                    <Body size="sm" color="muted" className="mt-0.5">
                      {v.description}
                    </Body>
                  </View>
                  {isSelected ? (
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center ml-2"
                      style={{ backgroundColor: semantic.interactivePrimary }}
                    >
                      <Check
                        size={16}
                        color={semantic.textPrimary}
                        strokeWidth={3}
                      />
                    </View>
                  ) : null}
                </View>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8">
        <Button
          label="Save"
          variant="primary"
          size="lg"
          radius="cta"
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}
