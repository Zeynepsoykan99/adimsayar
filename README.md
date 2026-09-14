# adimsayar

## Kurulum

```bash
git clone https://github.com/Zeynepsoykan99/adimsayar.git
cd adimsayar
npm install --legacy-peer-deps
```

## Çalıştırma

```bash
npm start
```

Ardından telefonda **Expo Go** uygulamasıyla terminalde çıkan QR kodu okutun.
Proje şu anda yalnızca JavaScript tarafından oluşuyor, native derleme gerektirmez.

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
| Expo Go | Güncel sürüm | Cihazda çalıştırmak için |
| JDK | **17** | Yalnızca native derleme yapılırsa |
| Android Studio + Android SDK | SDK Platform 35, Build-Tools 36.0.0 | Yalnızca native derleme yapılırsa |

JDK ve Android SDK **şu an gerekli değil** — proje Expo Go üzerinden çalışıyor ve native
modül kullanmıyor. Bunlar yalnızca ileride `npx expo prebuild` ile native projeye
geçilirse gerekir.

JDK notu: React Native kendi dokümanında JDK 17 öneriyor ve daha yüksek sürümlerde sorun
çıkabileceğini belirtiyor. Sistemde daha yeni bir JDK kuruluysa native derleme öncesinde
JDK 17'ye geçmek gerekebilir.

## `--legacy-peer-deps` neden gerekli

`expo-router@57` bağımlılık olarak `react-dom@19.3.0` çekiyor; Expo SDK 57 ise `react`
sürümünü `19.2.3`'e sabitliyor. `react-dom@19.3.0`, peer olarak `react@19.3.0` istediği
için npm bunu çözülemez bir çakışma sayıp kurulumu durduruyor:

```
npm error ERESOLVE could not resolve
npm error While resolving: react-dom@19.3.0
npm error Found: react@19.2.3
```

Bu upstream bir sürüm uyumsuzluğu, projedeki bir hatadan kaynaklanmıyor. `--legacy-peer-deps`
npm'in bu peer kontrolünü atlamasını sağlar; kurulan paket ağacı doğru çalışır.

**Bu yüzden `npm install` ve yeni paket eklerken hep `--legacy-peer-deps` kullanın.**

## ESLint 9 sabitlemesi

`eslint` bilerek `^9` sürümüne sabitlenmiştir. ESLint 10 ile `eslint-config-expo` içindeki
`eslint-plugin-react` çalışmıyor ve lint şu hatayla çöküyor:

```
TypeError: Error while loading rule 'react/display-name':
contextOrFilename.getFilename is not a function
```

Bu paketlerin ESLint 10 uyumlu sürümleri çıkana kadar `eslint` yükseltilmemelidir.

## ⚠️ Bundle identifier henüz tanımlı değil

`app.json` içinde `expo.android.package` ve `expo.ios.bundleIdentifier` alanları **bilerek
boş bırakılmıştır** (aynı uyarı `app.json`'un en üstündeki yorumda da var). Uygulama adı
da henüz kesinleşmediği için `name` ve `slug` geçici olarak `adimsayar` değerindedir.

Expo Go ile geliştirme bu alanlar olmadan çalışır. Ancak:

**İlk `npx expo prebuild` veya EAS build ÖNCESİNDE** gerçek uygulama adı ve ters alan adı
(ör. `com.sirket.uygulama`) girilmelidir. Bundle identifier uygulama mağazaya çıktıktan
sonra **değiştirilemez.**

---

© Tüm hakları saklıdır. Bu kod açık kaynak lisansı altında yayınlanmamıştır.
