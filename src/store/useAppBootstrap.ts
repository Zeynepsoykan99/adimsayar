import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { todayKey } from '@/utils/date';
import { useCaloriesStore } from './useCaloriesStore';
import { useProfileStore } from './useProfileStore';
import { useSettingsStore } from './useSettingsStore';
import { useStepsStore } from './useStepsStore';
import { useWaterStore } from './useWaterStore';

/** Gün dönümü kontrolü aralığı. */
const DAY_CHECK_INTERVAL_MS = 30000;

/**
 * Uygulama açılışında store'ları doldurur ve günlük verileri aktif güne bağlar.
 *
 * Gün, cihazın saat dilimine göre gece 00:00'da değişir. Tarih değiştiğinde
 * adım/kalori/su store'ları yeni gün anahtarıyla yeniden yüklenir; böylece
 * ertesi gün uygulama açıldığında dünkü veriler ekrana gelmez.
 */
export function useAppBootstrap(): { ready: boolean } {
  const settingsReady = useSettingsStore((state) => state.ready);
  const loadSettings = useSettingsStore((state) => state.load);
  const loadProfile = useProfileStore((state) => state.load);
  const loadSteps = useStepsStore((state) => state.load);
  const watchSteps = useStepsStore((state) => state.watch);
  const loadCalories = useCaloriesStore((state) => state.load);
  const loadWater = useWaterStore((state) => state.load);

  const [date, setDate] = useState(todayKey());

  useEffect(() => {
    void loadSettings();
    void loadProfile();
  }, [loadSettings, loadProfile]);

  useEffect(() => {
    void loadSteps(date);
    void loadCalories(date);
    void loadWater(date);
    return watchSteps(date);
  }, [date, loadSteps, loadCalories, loadWater, watchSteps]);

  useEffect(() => {
    const check = () => {
      const current = todayKey();
      setDate((previous) => (previous === current ? previous : current));
    };

    const interval = setInterval(check, DAY_CHECK_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') check();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  return { ready: settingsReady };
}
