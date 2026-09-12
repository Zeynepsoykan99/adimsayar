import { Ionicons } from '@expo/vector-icons';
import { Pressable, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';
import type { ThemeColors } from '@/theme/themes';

type IconButtonProps = {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  color?: keyof ThemeColors;
  size?: number;
  style?: ViewStyle;
};

export function IconButton({
  name,
  onPress,
  accessibilityLabel,
  color = 'textMuted',
  size = 20,
  style,
}: IconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={theme.spacing.sm}
      style={({ pressed }) => [{ opacity: pressed ? theme.opacity.pressed : 1 }, style]}
    >
      <Ionicons name={name} size={size} color={theme.colors[color]} />
    </Pressable>
  );
}
