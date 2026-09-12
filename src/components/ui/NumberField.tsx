import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from './AppText';
import { useTheme } from '@/theme/useTheme';

type NumberFieldProps = {
  label: string;
  /** Kaydedilmiş değer; null ise alan boş görünür. */
  value: number | null;
  unit?: string;
  placeholder?: string;
  error?: string | null;
  /** Alandan çıkıldığında (blur) çağrılır — ayrı Kaydet butonu yoktur. */
  onCommit: (raw: string) => void;
  onChangeRaw?: (raw: string) => void;
};

function toText(value: number | null): string {
  return value === null ? '' : String(value);
}

export function NumberField({
  label,
  value,
  unit,
  placeholder,
  error,
  onCommit,
  onChangeRaw,
}: NumberFieldProps) {
  const theme = useTheme();
  const [raw, setRaw] = useState(toText(value));
  const [syncedValue, setSyncedValue] = useState(value);

  // Dışarıdaki değer değiştiğinde (kaydedildi veya sıfırlandı) alanı eşitler.
  // React'in önerdiği "prop değişince state'i ayarla" kalıbı; effect kullanmaz.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setRaw(toText(value));
  }

  const hasError = Boolean(error);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: hasError ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <TextInput
          value={raw}
          onChangeText={(next) => {
            setRaw(next);
            onChangeRaw?.(next);
          }}
          onBlur={() => onCommit(raw)}
          onSubmitEditing={() => onCommit(raw)}
          keyboardType="number-pad"
          inputMode="numeric"
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, theme.typography.bodyStrong, { color: theme.colors.text }]}
        />
        {unit ? (
          <AppText variant="body" color="textMuted">
            {unit}
          </AppText>
        ) : null}
      </View>

      {hasError ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    padding: 0,
  },
});
