import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage üzerine ince JSON sarmalayıcı.
 * Bu dosya YALNIZCA mock repository'ler tarafından kullanılır; ekranlar ve
 * store'lar buraya doğrudan erişmez. Sonraki fazda SQLite/Firestore'a geçilirken
 * repository'nin içi değişir, arayüz aynı kalır.
 */
const PREFIX = 'adimsayar:v1:';

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Faz 1: yazma hatası sessizce yutulur, uygulama bellekteki değerle devam eder.
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {
    // yok sayılır
  }
}

export function createId(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}
