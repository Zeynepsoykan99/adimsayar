import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/ui/Screen';
import { PhoneSignIn } from '@/features/auth/PhoneSignIn';
import { useTheme } from '@/theme/useTheme';

export default function NeighborhoodSignInScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSignedIn = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/neighborhood');
  }, [router]);

  return (
    <Screen withTopInset={false}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.xxl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <PhoneSignIn onSignedIn={handleSignedIn} />
      </ScrollView>
    </Screen>
  );
}
