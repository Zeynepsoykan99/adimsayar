import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './AppText';
import { useTheme } from '@/theme/useTheme';

/** Giriş formu gibi yerlerde gereken klavye/otomatik doldurma ayarları. */
type InputOptions = Pick<
  TextInputProps,
  'secureTextEntry' | 'keyboardType' | 'autoCapitalize' | 'autoComplete' | 'textContentType'
>;

type TextFieldProps = InputOptions & {
  label: string;
  value: string;
  placeholder?: string;
  error?: string | null;
  /** Alandan çıkıldığında (blur) veya klavyede "tamam"a basıldığında çağrılır. */
  onCommit?: (value: string) => void;
  /** Her tuş vuruşunda çağrılır (formlarda canlı değer için). */
  onChangeText?: (value: string) => void;
};

export function TextField({
  label,
  value,
  placeholder,
  error,
  onCommit,
  onChangeText,
  ...inputOptions
}: TextFieldProps) {
  const theme = useTheme();
  const [raw, setRaw] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  // Dışarıdaki değer değiştiğinde alanı eşitler (effect kullanmadan).
  if (value !== syncedValue) {
    setSyncedValue(value);
    setRaw(value);
  }

  const hasError = Boolean(error);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>
      <TextInput
        {...inputOptions}
        value={raw}
        onChangeText={(next) => {
          setRaw(next);
          onChangeText?.(next);
        }}
        onBlur={() => onCommit?.(raw)}
        onSubmitEditing={() => onCommit?.(raw)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          theme.typography.bodyStrong,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: hasError ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
          },
        ]}
      />
      {hasError ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
