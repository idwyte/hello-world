import { Pressable, Text, View } from 'react-native';

import type { Question } from '@/lib/assessment-questions';

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
  return (
    <View>
      <Text className="text-ink text-2xl font-semibold leading-8">
        {question.prompt}
      </Text>
      {question.help ? (
        <Text className="text-muted text-sm mt-2 leading-5">{question.help}</Text>
      ) : null}

      <View className="mt-6 gap-3">
        {question.choices.map((c, idx) => {
          const selected = isSelected(question, value, c.value);
          return (
            <Pressable
              key={`${question.id}-${idx}`}
              onPress={() => {
                if (question.kind === 'multi') {
                  const current = Array.isArray(value) ? [...(value as unknown[])] : [];
                  if (current.includes(c.value)) {
                    onSelect(current.filter((v) => v !== c.value));
                  } else {
                    // "none" is exclusive
                    if (c.value === 'none') {
                      onSelect(['none']);
                    } else {
                      onSelect([...current.filter((v) => v !== 'none'), c.value]);
                    }
                  }
                } else {
                  onSelect(c.value);
                }
              }}
              accessibilityRole={question.kind === 'multi' ? 'checkbox' : 'radio'}
              accessibilityState={{ checked: selected }}
              accessibilityLabel={c.label}
              className={`py-4 px-5 rounded-xl border active:opacity-80 ${
                selected
                  ? 'bg-accent border-accent'
                  : 'bg-surface border-border'
              }`}
            >
              <Text
                className={`text-base ${
                  selected ? 'text-ink font-semibold' : 'text-ink'
                }`}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
