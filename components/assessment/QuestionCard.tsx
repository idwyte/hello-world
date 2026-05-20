import { Pressable, View } from 'react-native';

import type { Question } from '@/lib/assessment-questions';
import { Body } from '@/components/ui';
import { semantic } from '@/lib/theme';

type Props = {
  question: Question;
  value: unknown;
  onSelect: (value: unknown) => void;
};

function isSelected(question: Question, current: unknown, choiceValue: unknown) {
  if (question.kind === 'multi') {
    if (Array.isArray(current)) {
      return (current as unknown[]).includes(choiceValue);
    }
    return false;
  }
  return current === choiceValue;
}

export function QuestionCard({ question, value, onSelect }: Props) {
  const layout = question.layout ?? 'list';

  function handleSelect(choiceValue: unknown) {
    if (question.kind === 'multi') {
      const current = Array.isArray(value) ? [...(value as unknown[])] : [];
      if (current.includes(choiceValue)) {
        onSelect(current.filter((v) => v !== choiceValue));
      } else if (choiceValue === 'none') {
        onSelect(['none']);
      } else {
        onSelect([...current.filter((v) => v !== 'none'), choiceValue]);
      }
    } else {
      onSelect(choiceValue);
    }
  }

  return (
    <View>
      <Body
        weight="semibold"
        color="primary"
        style={{ fontSize: 28, lineHeight: 36 }}
      >
        {question.prompt}
      </Body>
      {question.help ? (
        <Body size="sm" color="muted" className="mt-2">
          {question.help}
        </Body>
      ) : null}

      {layout === 'list' ? (
        <ListChoices
          question={question}
          value={value}
          onSelect={handleSelect}
        />
      ) : layout === 'grid' ? (
        <GridChoices
          question={question}
          value={value}
          onSelect={handleSelect}
        />
      ) : (
        <SegmentedChoices
          question={question}
          value={value}
          onSelect={handleSelect}
        />
      )}
    </View>
  );
}

// Figma 09 · intimacy — stacked full-width cards, 358×64, surface bg,
// selected = accent stroke 2 + Semi Bold label.
function ListChoices({ question, value, onSelect }: Props) {
  return (
    <View className="mt-6 gap-3">
      {question.choices.map((c, idx) => {
        const selected = isSelected(question, value, c.value);
        return (
          <Pressable
            key={`${question.id}-${idx}`}
            onPress={() => onSelect(c.value)}
            accessibilityRole={question.kind === 'multi' ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: selected }}
            accessibilityLabel={c.label}
            className="bg-surface-raised rounded-[14px] px-5 h-16 justify-center active:opacity-80"
            style={{
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? semantic.interactivePrimary : semantic.borderDefault,
            }}
          >
            <Body
              color="primary"
              weight={selected ? 'semibold' : 'regular'}
              style={{ fontSize: 16, lineHeight: 24 }}
            >
              {c.label}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
}

// Figma 06 · age — 2-column grid of band cards (171×64 each, gap-3).
// Two stats per row with gap-3 fits a 358-wide content column exactly
// (171 + 12 + 171 = 354 ≈ row).
function GridChoices({ question, value, onSelect }: Props) {
  return (
    <View className="mt-6 flex-row flex-wrap gap-3">
      {question.choices.map((c, idx) => {
        const selected = isSelected(question, value, c.value);
        return (
          <Pressable
            key={`${question.id}-${idx}`}
            onPress={() => onSelect(c.value)}
            accessibilityRole={question.kind === 'multi' ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: selected }}
            accessibilityLabel={c.label}
            className="bg-surface-raised rounded-[14px] h-16 items-center justify-center active:opacity-80"
            style={{
              width: '48%',
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? semantic.interactivePrimary : semantic.borderDefault,
            }}
          >
            <Body
              color="primary"
              weight={selected ? 'semibold' : 'regular'}
              style={{ fontSize: 17, lineHeight: 24 }}
            >
              {c.label}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
}

// Figma 07/08 · strength/cardio — horizontal segmented control,
// 8 cells × 42 wide + gap-1, centered. Selected = accent fill.
function SegmentedChoices({ question, value, onSelect }: Props) {
  return (
    <View className="mt-6 flex-row gap-1 justify-center">
      {question.choices.map((c, idx) => {
        const selected = isSelected(question, value, c.value);
        return (
          <Pressable
            key={`${question.id}-${idx}`}
            onPress={() => onSelect(c.value)}
            accessibilityRole={question.kind === 'multi' ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: selected }}
            accessibilityLabel={c.label}
            className="h-14 items-center justify-center rounded-xl active:opacity-80"
            style={{
              width: 42,
              backgroundColor: selected ? semantic.interactivePrimary : semantic.surfaceRaised,
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? semantic.interactivePrimary : semantic.borderDefault,
            }}
          >
            <Body
              color="primary"
              weight="semibold"
              style={{ fontSize: 17, lineHeight: 24 }}
            >
              {c.label}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
}
