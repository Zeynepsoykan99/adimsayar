import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from './AppText';
import { useTheme } from '@/theme/useTheme';

type TextFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onCommit: (value: string) => void;
};

export function TextField({ label, value, placeholder, onCommit }: TextFieldProps) {
  const theme = useTheme();
  const [raw, setRaw] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  // Dışarıdaki değer değiştiğinde alanı eşitler (effect kullanmadan).
  if (value !== syncedValue) {
    setSyncedValue(value);
    setRaw(value);
  }

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>
      <TextInput
        value={raw}
        onChangeText={setRaw}
        onBlur={() => onCommit(raw)}
        onSubmitEditing={() => onCommit(raw)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          theme.typography.bodyStrong,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
