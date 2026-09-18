import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NumberField } from '@/components/ui/NumberField';
import { formatTurkishMobile, isVerificationCode, normalizeTurkishMobile } from '@/domain/phone';
import { getSocialServices } from '@/services';
import {
  PhoneAuthError,
  type PhoneAuthErrorCode,
  type PhoneVerification,
} from '@/services/social/AuthService';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/theme/useTheme';
import { isolateLtr } from '@/utils/bidi';

/** Aynı numaraya yeni kod istemeden önce beklenecek süre — gereksiz SMS maliyetini sınırlar. */
const RESEND_COOLDOWN_SECONDS = 60;

const ERROR_KEYS: Record<PhoneAuthErrorCode, string> = {
  invalidPhone: 'auth.errors.invalidPhone',
  invalidCode: 'auth.errors.invalidCode',
  codeExpired: 'auth.errors.codeExpired',
  tooManyRequests: 'auth.errors.tooManyRequests',
  network: 'auth.errors.network',
  unknown: 'auth.errors.unknown',
};

function errorCodeOf(error: unknown): PhoneAuthErrorCode {
  return error instanceof PhoneAuthError ? error.code : 'unknown';
}

type PhoneSignInProps = {
  /** Oturum açıldığında çağrılır (kod doğrulandığında veya Android kodu kendiliğinden okuduğunda). */
  onSignedIn: () => void;
};

/** İki adımlı telefonla giriş: numara → SMS kodu. Yalnızca Türkiye cep numaraları. */
export function PhoneSignIn({ onSignedIn }: PhoneSignInProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const user = useAuthStore((state) => state.user);
  const start = useAuthStore((state) => state.start);

  const [phoneRaw, setPhoneRaw] = useState('');
  const [codeRaw, setCodeRaw] = useState('');
  const [phoneE164, setPhoneE164] = useState<string | null>(null);
  const [verification, setVerification] = useState<PhoneVerification | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<PhoneAuthErrorCode | null>(null);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    start();
  }, [start]);

  // Oturum açıldığı anda (Android SMS'i kendiliğinden okumuş olabilir) ekran kapanır.
  const signedInHandled = useRef(false);
  useEffect(() => {
    if (user && !signedInHandled.current) {
      signedInHandled.current = true;
      onSignedIn();
    }
  }, [user, onSignedIn]);

  // Yeniden gönderme geri sayımı: yalnızca kod adımında ve süre dolana kadar çalışır.
  const waiting = verification !== null && now < resendAt;
  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [waiting]);

  const sendCode = async (e164: string) => {
    setBusy(true);
    setError(null);
    try {
      const next = await getSocialServices().auth.startPhoneSignIn(e164);
      setPhoneE164(e164);
      setVerification(next);
      setCodeRaw('');
      const sentAt = Date.now();
      setNow(sentAt);
      setResendAt(sentAt + RESEND_COOLDOWN_SECONDS * 1000);
    } catch (caught) {
      setError(errorCodeOf(caught));
    } finally {
      setBusy(false);
    }
  };

  const submitPhone = () => {
    const e164 = normalizeTurkishMobile(phoneRaw);
    if (!e164) {
      setError('invalidPhone');
      return;
    }
    void sendCode(e164);
  };

  const submitCode = async () => {
    if (!verification) return;
    if (!isVerificationCode(codeRaw)) {
      setError('invalidCode');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await verification.confirm(codeRaw.replace(/\s/g, ''));
    } catch (caught) {
      setError(errorCodeOf(caught));
    } finally {
      setBusy(false);
    }
  };

  const changeNumber = () => {
    setVerification(null);
    setPhoneE164(null);
    setError(null);
  };

  const errorText = error ? t(ERROR_KEYS[error]) : null;

  if (!verification || !phoneE164) {
    return (
      <Card>
        <NumberField
          key="phone"
          label={t('auth.phoneLabel')}
          placeholder={t('auth.phonePlaceholder')}
          value={null}
          error={errorText}
          onChangeRaw={setPhoneRaw}
          onCommit={() => undefined}
        />
        <Button label={t('auth.sendCode')} onPress={submitPhone} disabled={busy} />
      </Card>
    );
  }

  const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000));

  return (
    <Card>
      <AppText variant="body" color="textMuted">
        {t('auth.codeSentTo', { phone: isolateLtr(formatTurkishMobile(phoneE164)) })}
      </AppText>
      <NumberField
        key="code"
        label={t('auth.codeLabel')}
        placeholder={t('auth.codePlaceholder')}
        value={null}
        error={errorText}
        onChangeRaw={setCodeRaw}
        onCommit={() => undefined}
      />
      <Button label={t('auth.verify')} onPress={() => void submitCode()} disabled={busy} />
      <View style={{ gap: theme.spacing.sm }}>
        <Button
          label={secondsLeft > 0 ? t('auth.resendIn', { seconds: secondsLeft }) : t('auth.resend')}
          variant="ghost"
          disabled={busy || secondsLeft > 0}
          onPress={() => void sendCode(phoneE164)}
        />
        <Button
          label={t('auth.changeNumber')}
          variant="ghost"
          disabled={busy}
          onPress={changeNumber}
        />
      </View>
    </Card>
  );
}
