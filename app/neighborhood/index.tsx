import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/ui/Screen';
import { NeighborhoodHub } from '@/features/neighborhood/NeighborhoodHub';
import { useTheme } from '@/theme/useTheme';

export default function NeighborhoodScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Screen withTopInset={false}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.xxl,
          gap: theme.spacing.lg,
        }}
      >
        <NeighborhoodHub />
      </ScrollView>
    </Screen>
  );
}
