import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NoticeBanner } from '@/components/ui/NoticeBanner';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TextField } from '@/components/ui/TextField';
import { isStrongEnoughPassword, normalizeEmail, PASSWORD_MIN_LENGTH } from '@/domain/credentials';
import { getSocialServices } from '@/services';
import { AuthError, type AuthErrorCode } from '@/services/social/AuthService';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTheme } from '@/theme/useTheme';

type Mode = 'signIn' | 'signUp' | 'reset';

/** Sunucu hatalarına ek olarak formun kendi yakaladığı durum. */
type FormErrorCode = AuthErrorCode | 'passwordRequired';

const ERROR_KEYS: Record<FormErrorCode, string> = {
  invalidEmail: 'auth.errors.invalidEmail',
  weakPassword: 'auth.errors.weakPassword',
  passwordRequired: 'auth.errors.passwordRequired',
  wrongCredentials: 'auth.errors.wrongCredentials',
  emailInUse: 'auth.errors.emailInUse',
  tooManyRequests: 'auth.errors.tooManyRequests',
  network: 'auth.errors.network',
  unknown: 'auth.errors.unknown',
};

/** Hangi hata hangi alanın altında gösterilir; geri kalanlar formun altında. */
const EMAIL_ERRORS: FormErrorCode[] = ['invalidEmail', 'emailInUse'];
const PASSWORD_ERRORS: FormErrorCode[] = ['weakPassword', 'passwordRequired'];

const TITLE_KEYS: Record<Mode, string> = {
  signIn: 'auth.signInTitle',
  signUp: 'auth.signUpTitle',
  reset: 'auth.resetTitle',
};

function errorCodeOf(error: unknown): FormErrorCode {
  return error instanceof AuthError ? error.code : 'unknown';
}

type EmailAuthFormProps = {
  /** Oturum açıldığında çağrılır (giriş veya hesap oluşturma sonrası). */
  onSignedIn: () => void;
};

/**
 * E-posta + şifre: giriş, hesap oluşturma ve şifre sıfırlama.
 * E-posta doğrulaması beklenmez; hesap oluşturulunca oturum hemen açılır.
 */
export function EmailAuthForm({ onSignedIn }: EmailAuthFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const user = useAuthStore((state) => state.user);
  const start = useAuthStore((state) => state.start);
  const language = useSettingsStore((state) => state.resolvedLanguage);

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<FormErrorCode | null>(null);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    start();
  }, [start]);

  const signedInHandled = useRef(false);
  useEffect(() => {
    if (user && !signedInHandled.current) {
      signedInHandled.current = true;
      onSignedIn();
    }
  }, [user, onSignedIn]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setResetSent(false);
    setPassword('');
  };

  const submit = async () => {
    const normalized = normalizeEmail(email);
    if (!normalized) {
      setError('invalidEmail');
      return;
    }
    if (mode === 'signIn' && password.length === 0) {
      setError('passwordRequired');
      return;
    }
    if (mode === 'signUp' && !isStrongEnoughPassword(password)) {
      setError('weakPassword');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const auth = getSocialServices().auth;
      if (mode === 'signIn') await auth.signIn(normalized, password);
      else if (mode === 'signUp') await auth.signUp(normalized, password);
      else {
        await auth.sendPasswordReset(normalized, language);
        setResetSent(true);
      }
    } catch (caught) {
      setError(errorCodeOf(caught));
    } finally {
      setBusy(false);
    }
  };

  const message = (code: FormErrorCode) => t(ERROR_KEYS[code], { min: PASSWORD_MIN_LENGTH });
  const emailError = error && EMAIL_ERRORS.includes(error) ? message(error) : null;
  const passwordError = error && PASSWORD_ERRORS.includes(error) ? message(error) : null;
  const formError = error && !emailError && !passwordError ? message(error) : null;

  const submitLabel =
    mode === 'signIn'
      ? t('auth.signInButton')
      : mode === 'signUp'
        ? t('auth.signUpButton')
        : t('auth.resetButton');

  return (
    <Card>
      <SectionHeader title={t(TITLE_KEYS[mode])} />

      {mode === 'reset' ? (
        <AppText variant="body" color="textMuted">
          {t('auth.resetIntro')}
        </AppText>
      ) : null}

      <TextField
        key={'email-' + mode}
        label={t('auth.emailLabel')}
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        error={emailError}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />

      {mode !== 'reset' ? (
        <View style={{ gap: theme.spacing.xxs }}>
          <TextField
            key={'password-' + mode}
            label={t('auth.passwordLabel')}
            value={password}
            error={passwordError}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
            textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
          />
          {mode === 'signUp' && !passwordError ? (
            <AppText variant="caption" color="textMuted">
              {t('auth.passwordHint', { min: PASSWORD_MIN_LENGTH })}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {formError ? (
        <AppText variant="caption" color="danger">
          {formError}
        </AppText>
      ) : null}

      {resetSent ? <NoticeBanner body={t('auth.resetSent')} /> : null}

      <Button label={submitLabel} onPress={() => void submit()} disabled={busy} />

      <View style={{ gap: theme.spacing.sm }}>
        {mode === 'signIn' ? (
          <>
            <Button
              label={t('auth.forgotPassword')}
              variant="ghost"
              disabled={busy}
              onPress={() => switchMode('reset')}
            />
            <Button
              label={t('auth.toSignUp')}
              variant="ghost"
              disabled={busy}
              onPress={() => switchMode('signUp')}
            />
          </>
        ) : (
          <Button
            label={mode === 'signUp' ? t('auth.toSignIn') : t('auth.backToSignIn')}
            variant="ghost"
            disabled={busy}
            onPress={() => switchMode('signIn')}
          />
        )}
      </View>
    </Card>
  );
}
