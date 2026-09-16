# adimsayar

Teknik kararlar, kurulum tuzakları ve yayın yükümlülükleri için: [NOTES.md](./NOTES.md)

## Kurulum

```bash
git clone https://github.com/Zeynepsoykan99/adimsayar.git
cd adimsayar
npm install --legacy-peer-deps
```

`--legacy-peer-deps` **zorunludur**, gerekçesi
[NOTES.md § 1](./NOTES.md#1-npm-install-neden---legacy-peer-deps-ister)'de.

## Çalıştırma

Uygulama **Expo Go'da açılır**, ancak orada adım verisi **mock**'tur; yalnızca arayüzü
denemek için bu yeterlidir:

```bash
npx expo start
```

**Gerçek adım verisi** (Android'de Health Connect, iOS'ta Core Motion) native modül
gerektirir ve Expo Go'da okunamaz. Bunun için bir kez development build derleyip cihaza
kurmak gerekir:

```bash
npx expo prebuild --platform android   # android/ klasörünü üretir
npx expo run:android                   # derler ve bağlı cihaza kurar
```

Sonraki geliştirmelerde yalnızca:

```bash
npx expo start --dev-client
```

Ayrıntılar için [NOTES.md § 3](./NOTES.md#3-expo-godan-development-builde-geçiş).

Diğer komutlar:

```bash
npm run type-check   # tsc --noEmit
npm run lint         # eslint .
```

## Gereksinimler

| Araç | Sürüm | Ne zaman gerekli |
|---|---|---|
| Node.js | `^20.19.4 \|\| ^22.13.0 \|\| ^24.3.0 \|\| >= 25.0.0` (React Native 0.86'nın `engines` alanı) | Her zaman |
| npm | 10+ | Her zaman |
| JDK | **17** (React Native önerisi; daha yüksek sürümlerde sorun çıkabiliyor) | Android derlemesi |
| Android SDK | platform-tools, platforms android-35/36, build-tools 35.0.0/36.0.0 | Android derlemesi |
| `JAVA_HOME` · `ANDROID_HOME` | Ayarlanmış olmalı | Android derlemesi |
| Android 9 (API 28)+ cihaz | Health Connect uygulaması kurulu | Gerçek adım verisi |

Bu makinedeki kurulu yolların tamamı ve neden JDK 17 gerektiği:
[NOTES.md § 6](./NOTES.md#6-yerel-android-derleme-ortamı).

ESLint neden `^9`'a sabitlendi:
[NOTES.md § 2](./NOTES.md#2-eslint-neden-9a-sabitlendi).

## Bundle identifier

`app.json` içinde her iki alan da tanımlıdır:

| Alan | Değer |
|---|---|
| `expo.android.package` | `com.zeynep.adimsayar` |
| `expo.ios.bundleIdentifier` | `com.zeynep.adimsayar` |

Bundle identifier uygulama mağazaya çıktıktan sonra **değiştirilemez**.

Uygulamanın görünen adı henüz kesinleşmediği için `name` ve `slug` hâlâ geçici olarak
`adimsayar` değerindedir; bunlar mağazaya çıkmadan önce güncellenebilir.

---

© Tüm hakları saklıdır. Bu kod açık kaynak lisansı altında yayınlanmamıştır.
