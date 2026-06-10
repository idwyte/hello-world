// Obsidian Kinetic: Settings · Voice picker.
// Originally Figma node 104:624 (legacy skin); re-skinned to the
// OptionRow + Button patterns. Selection state and navigation unchanged.
//
// FIGMA-DIFF (stub):
//   - Per-card play-preview button not wired (no audio assets yet).
//   - Stealth Mode pairing hint card omitted; promote in full build.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="Voice"
        onPress={() => router.back()}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackMd,
          paddingBottom: 40,
          gap: spacing.stackMd,
        }}
      >
        <View style={{ gap: spacing.stackSm }}>
          {VOICES.map((v) => {
            const isSelected = v.id === selected;
            return (
              <Pressable
                key={v.id}
                onPress={() => setSelected(v.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={v.name}
                style={({ pressed }) => ({
                  backgroundColor: color.surfaceContainerLow,
                  borderColor: isSelected
                    ? color.primaryContainer
                    : glass.border,
                  borderWidth: isSelected ? 2 : 1,
                  borderRadius: radius.xl,
                  padding: spacing.stackMd,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing.gutter,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{
                      ...(isSelected ? type.labelButton : type.bodyLg),
                      color: isSelected
                        ? color.primaryFixedDim
                        : color.onSurface,
                    }}
                  >
                    {v.name}
                  </Text>
                  <Text
                    style={{
                      ...type.bodyMd,
                      fontSize: 14,
                      lineHeight: 20,
                      color: color.onSurfaceVariant,
                    }}
                  >
                    {v.description}
                  </Text>
                </View>
                {isSelected ? (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: radius.full,
                      backgroundColor: color.primaryContainer,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check
                      size={16}
                      color={color.onPrimaryFixed}
                      strokeWidth={3}
                    />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: spacing.containerPadding,
          paddingBottom: spacing.stackLg + spacing.stackSm,
        }}
      >
        <Button
          label="Save"
          onPress={() => router.back()}
          style={{ width: '100%' }}
        />
      </View>
    </SafeAreaView>
  );
}
