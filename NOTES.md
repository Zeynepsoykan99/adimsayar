# Geliştirme Notları

Bu dosya, projede bilinçli olarak verilmiş teknik kararları ve kurulumla ilgili
tuzakları toplar. Kurulum ve çalıştırma adımları için [README.md](./README.md).

---

## 1. `npm install` neden `--legacy-peer-deps` ister

`expo-router@57` bağımlılık olarak `react-dom@19.3.0` çeker; Expo SDK 57 ise `react`
sürümünü `19.2.3`'e sabitler. `react-dom@19.3.0` peer olarak `react@19.3.0` istediği için
npm bunu çözülemez bir çakışma sayar ve kurulumu durdurur:

```
npm error ERESOLVE could not resolve
npm error While resolving: react-dom@19.3.0
npm error Found: react@19.2.3
```

Upstream bir sürüm uyumsuzluğudur, projedeki bir hatadan kaynaklanmaz.

**Kural:** bu depoda `npm install` ve yeni paket eklemeleri **her zaman**
`--legacy-peer-deps` ile yapılır. `npx expo install` bu bayrağı kendiliğinden
kullanmadığı için bazı paketlerde başarısız olur; o durumda paketi doğrudan
`npm install --legacy-peer-deps <paket>` ile kurun.

## 2. ESLint neden 9'a sabitlendi

`eslint` bilerek `^9` sürümündedir. ESLint 10 ile `eslint-config-expo` içindeki
`eslint-plugin-react` çalışmıyor ve lint tamamen çöküyor:

```
TypeError: Error while loading rule 'react/display-name':
contextOrFilename.getFilename is not a function
```

Bu paketlerin ESLint 10 uyumlu sürümleri çıkana kadar `eslint` yükseltilmemelidir.

## 3. Expo Go'dan development build'e geçiş

Faz 2 ile projeye native modüller girdi (`react-native-health-connect`, `expo-sensors`).
Bu modüller Expo Go içinde bulunmaz.

- **Expo Go'da uygulama açılır, ama adım verisi mock'tur.** `services/index.ts`
  Expo Go'yu (`ExecutionEnvironment.StoreClient`) tanır ve platformdan bağımsız olarak
  `MockStepRepository` + `MockStepPermissionController` kullanır. Health Connect modülü
  de statik değil tembel import edilir, böylece native modülün bulunmadığı Expo Go'da
  import anında çökmez. Arayüzü denemek için Expo Go yeterlidir.
- **Gerçek adım verisi için development build şarttır** — Android'de Health Connect,
  iOS'ta Core Motion yalnızca kendi *development build*'inizi bir kez derleyip cihaza
  kurduktan sonra okunabilir.
- Derlemeden sonra günlük akış `npx expo start --dev-client` olur; JavaScript
  değişiklikleri yine anında yenilenir, yalnızca kabuk uygulama değişmiştir.
- `android/` ve `ios/` klasörleri `npx expo prebuild` ile **üretilir** ve `.gitignore`
  tarafından dışlanır. Kaynak gerçeği `app.json` + config plugin'lerdir; bu klasörler
  her zaman `npx expo prebuild --clean` ile baştan üretilebilir.
- Native modüller kaldırılıp plugin'ler `app.json`'dan çıkarılırsa proje yeniden
  saf Expo Go projesine döner. Geri dönülemez tek şey **bundle identifier**'dır.

### Geliştirme sırasında gerçek adım verisini atlamak

Sağlık izinleriyle uğraşmadan arayüzü denemek için mock adım kaynağı zorlanabilir:

```
EXPO_PUBLIC_STEP_SOURCE=mock
```

Bu değişken tanımlıyken `services/index.ts` platformdan bağımsız olarak
`MockStepRepository` + `MockStepPermissionController` kullanır.

## 4. Android sürüm eşiği: neden 28

`app.json` içinde `expo-build-properties` ile `minSdkVersion: 28` (Android 9) ayarlıdır.
Gerekçesi:

- `androidx.health.connect` SDK'sı teknik olarak **API 26**'dan itibaren derlenebilir.
- Ancak Health Connect **uygulaması** yalnızca **API 28 (Android 9)** ve üstünde çalışır.
- **API 34 (Android 14)** ve üstünde Health Connect işletim sisteminin parçasıdır,
  ayrıca kurulum gerekmez.

Kaynak: Android geliştirici dokümanı — *"The Health Connect SDK supports Android 8
(API level 26) or higher, while the Health Connect app is only compatible with Android 9
(API level 28) or higher."*

API 26–27 cihazlarda Health Connect hiçbir şekilde kullanılamayacağı için uygulamanın
o cihazlara kurulmasına izin vermek anlamsızdı; eşik 28'e çekildi. Böylece
`minSdkVersion`, arayüzdeki "desteklenmiyor" durumu ve gerçek Health Connect cihaz
desteği aynı sınırı gösterir.

## 5. Google Play — Health Connect yükümlülükleri

Bunlar **yayın aşamasının** işidir; geliştirme ve kendi cihazında test için gerekmez.
Play Store'a çıkmadan önce tamamlanmalıdır:

1. **Health Apps Declaration Form** — Play Console → App content sayfasında doldurulması
   zorunludur. Her yeni sürüm gönderiminde inceleme tetiklenir; okunan veri tipleri
   değişirse yeniden beyan gerekir.
2. **Her veri tipi için gerekçe** — bu uygulama yalnızca "Activity and fitness"
   kategorisinde adım verisi okur.
3. **Gizlilik politikası** — Play Store sayfasında yayınlanmalı, uygulama içinden
   erişilebilir olmalı ve Health Connect izin ekranındaki linkin gösterdiği metinle
   aynı olmalıdır. (`react-native-health-connect` config plugin'i bu link için gereken
   `androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE` intent-filter'ını ve Android 14+
   için `ViewPermissionUsageActivity` alias'ını otomatik ekler.)
   **Gizlilik politikası metni henüz yazılmadı.**
4. **Data safety bölümü** — hangi verinin toplandığı/paylaşıldığı beyan edilmelidir.
5. **Veri minimizasyonu** — kullanılmayan veri tipi istenemez. Bu uygulama yalnızca
   `android.permission.health.READ_STEPS` ister; arka plan okuma
   (`READ_HEALTH_DATA_IN_BACKGROUND`) ve başka hiçbir veri tipi istenmez.
6. Beyan yapılmazsa uygulama yayınlansa bile kullanıcı
   *"App can't access Health Connect"* hatası alır.

## 6. Yerel Android derleme ortamı

Bu makinede kurulu olan ve derlemenin beklediği ortam:

| Bileşen | Konum / değer |
|---|---|
| JDK 17 (Temurin) | `%LOCALAPPDATA%\Programs\jdk-17.0.20.1+1` |
| `JAVA_HOME` | yukarıdaki dizin (kullanıcı ortam değişkeni) |
| Android SDK | `%LOCALAPPDATA%\Android\Sdk` |
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | yukarıdaki dizin (kullanıcı ortam değişkeni) |
| `Path` eklentileri | `…\Android\Sdk\platform-tools`, `…\Android\Sdk\cmdline-tools\latest\bin`, `…\Programs\jdk-17.0.20.1+1\bin` |
| Kurulu SDK paketleri | platform-tools 37.0.1, platforms android-35 ve android-36, build-tools 35.0.0 ve 36.0.0 |
| SDK lisansları | kabul edilmiş (`%LOCALAPPDATA%\Android\Sdk\licenses`) |

**JDK sürümü önemlidir.** React Native kendi dokümanında JDK 17 önerir ve daha yüksek
sürümlerde sorun çıkabileceğini belirtir. Sistemde ayrıca JDK 26 kuruludur ve `java`
komutu hâlâ onu gösterir; bu bilinçlidir. Gradle `JAVA_HOME`'a baktığı için derlemeler
JDK 17 ile yapılır. JDK 26'yı kaldırmaya gerek yoktur, ancak `JAVA_HOME`'u değiştirmeyin.

Ortam değişkenleri kullanıcı kapsamında ayarlandığı için **yeni açılan** terminallerde
geçerlidir; hâlihazırda açık olan terminalleri yeniden başlatın.

## 7. Atlanan patch sürüm farkı

`npx expo-doctor` iki paket için patch farkı bildiriyor:

| paket | kurulu | SDK'nın beklediği |
|---|---|---|
| `expo` | 57.0.22 | `~57.0.23` |
| `expo-build-properties` | 57.0.17 | `~57.0.19` |

Bu fark **bilinçli olarak güncellenmedi.** Yalnızca patch seviyesindedir,
`npx expo prebuild` ve development build derlemesini engellemez; prebuild bu farkla
sorunsuz çalıştı.

**İleride prebuild, derleme veya Health Connect tarafında açıklanamayan bir sorun
çıkarsa ilk bakılacak yer burasıdır.** Güncellemek için (depo kuralı gereği
`npx expo install` değil):

```bash
npm install --legacy-peer-deps expo@~57.0.23 expo-build-properties@~57.0.19
```

Ayrıca `expo-font`, `@expo/vector-icons`'ın zorunlu peer bağımlılığı olduğu için
doğrudan kuruldu. Expo Go'da eksikliği fark edilmiyordu ama development build'de
çökmeye yol açabiliyordu (`expo-doctor`: *"Your app may crash outside of Expo Go
without this dependency"*).

## 8. Faz 3 — Mahalle (Firebase)

### Kesinleşen kararlar

| # | Karar |
|---|---|
| 1 | Kullanıcı yalnızca **tek** mahalleye üye olabilir. |
| 2 | Üye sınırı **20**. |
| 3 | Bildirim ayarları **alıcı** tarafı içindir ("bu tür bildirimi almak istemiyorum"). |
| 4 | Görünen ad zorunludur; boşsa mahalle oluşturma/katılma sırasında sorulur. |
| 5 | Adım verisi yalnızca uygulama ön plandayken paylaşılır (arka plan Health Connect izni istenmez). |
| 7 | SMS bölge politikası: yalnızca **Türkiye**. Uygulama da yalnızca +90 5XX numaraları kabul eder (`src/domain/phone.ts`). |
| 8 | Davet linki süresiz ve tekrar kullanılabilir. |
| 10 | `google-services.json` repoya girer; API anahtarı Google Cloud Console'da uygulama + API kısıtlamasıyla sınırlanır. |
| 11 | Firestore konumu **europe-west1** (geri alınamaz). Cloud Functions da aynı bölgede. |

**Birebir kullanılacak metinler** (değiştirilmeden; diğer dillere çevirileri ilgili alt fazda onaya sunulur):

- Paylaşım onay ekranı (3b): *"Katılarak bugünkü adım, kalori ve su durumunu bu
  mahallenin üyeleriyle paylaşmayı kabul ediyorsun. Geçmiş günlerin verisi
  paylaşılmaz, telefon numaran kimseyle paylaşılmaz."* — Buton: *"Kabul et ve katıl"*
- Uygulama kurulu değilken açılan sayfa (3c): *"Bu bir adimsayar mahalle davetidir.
  Katılmak için uygulamayı telefonuna yüklemen gerekiyor. Uygulama şu anda Google
  Play'de değil, yakında eklenecek. Uygulamayı kurduktan sonra bu linke tekrar dokun."*

"adimsayar" geçici uygulama adıdır. Bu adı içeren metinler, adı tek bir sabitten alacak
şekilde yazılacak; ad kesinleşince tek satır değişecek.

**Eski tarihli veri** (3b): Üye listesi her üyenin `today.date` değerini izleyenin
cihazındaki güne (`useStepsStore.date`) göre karşılaştırır; farklıysa değerler yalnızca
"—" gösterilir. Senkron hook'u gün değişince sıfırlanmış kaydı hemen yayımlar. Bildirim
fonksiyonu önceki kayıt başka güne aitse önceki değerleri sıfır kabul eder. Sunucuda
zamanlanmış sıfırlama görevi **yoktur**.

### Kütüphane: React Native Firebase

`@react-native-firebase/{app,auth,app-check}` **26.4.0**, sürümler birbirine bağlı
olduğu için tam sürümle sabitlenmiştir (`^` yok). v26 yeni mimari (TurboModule) ister;
projede `newArchEnabled=true`. Firebase JS SDK kullanılmaz: telefonla giriş, App Check
ve FCM'nin mobil desteği yalnızca native SDK'da var. Sonraki alt fazlarda eklenecek
modüller (`firestore`, `functions`, `messaging`) de aynı sürümle kurulmalıdır.

**Plandan sapma:** Faz 3 planında RNFB sürümü v24.1.x olarak öngörülmüştü. Kurulum
sırasında (Eylül 2026) güncel sürümün **v26.4.0** olduğu görüldü. v26, native köprüsü
olan tüm RNFB paketlerinin yeni mimariyi (New Architecture) kullanmasını şart koşuyor;
projede bu zaten açık olduğu için engel yoktu ve v26.4.0'a sabitlendi. Doğrulama:
`prebuild --clean` + `assembleDebug` başarılı (RNFB kaynaklı derleme uyarısı yok),
Health Connect manifest kontrolleri değişmedi, `type-check`/`lint` temiz, Metro Android
paketi hatasız üretildi, mock ve Auth emülatörü testleri geçti.

### Sosyal veri kaynağı: `EXPO_PUBLIC_SOCIAL_SOURCE`

| değer | davranış |
|---|---|
| `mock` | Firebase'e hiç bağlanılmaz. Doğrulama kodu her zaman **`123456`**. Oturum AsyncStorage'da kalıcıdır. |
| `emulator` | Firebase Local Emulator Suite. Gerçek SMS gitmez; kod emülatör çıktısında ve `http://127.0.0.1:4000/auth` adresinde görünür. |
| `firebase` / tanımsız | Gerçek Firebase projesi. |

Expo Go'da ve web'de değişkenden bağımsız olarak **mock** kullanılır. Firebase modülleri
uygulama açılışında değil, mahalle ekranı ilk açıldığında yüklenir
(`services/index.ts` → `getSocialServices`).

**Emülatör:** `npm run emulators` (yalnızca Auth; Java gerekmez). Fiziksel cihazdan
bağlanmak için cihazda `adb reverse tcp:9099 tcp:9099` yapılır; başka bir makinedeki
emülatör için `EXPO_PUBLIC_FIREBASE_EMULATOR_HOST` verilir. Emülatör `demo-adimsayar`
demo projesiyle çalışır ve gerçek projeye dokunmaz.

### `google-services.json` ve imza parmak izleri

Gerçek Firebase projesi oluşturulana kadar kökte **yer tutucu** bir
`google-services.json` durur (`project_id: demo-adimsayar`, sahte API anahtarı). Yalnızca
prebuild ve derlemenin çalışması içindir, **commit'lenmez**; gerçek dosya geldiğinde
onun yerini alır.

Debug derlemeleri React Native şablonunun `android/app/debug.keystore` anahtarıyla
imzalanır. Firebase'e girilecek değerler:

| | parmak izi |
|---|---|
| SHA-1 | `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` |
| SHA-256 | `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C` |

Bu anahtar herkese açık şablon anahtarıdır; yalnızca geliştirme içindir. Yayın için
Play App Signing anahtarının parmak izleri ayrıca eklenecek.

### App Check debug token

Geliştirme derlemeleri App Check'te **debug** sağlayıcısını kullanır. Token
`.env.local` içindeki `EXPO_PUBLIC_APPCHECK_DEBUG_TOKEN` değişkenindedir; bu dosya git'e
girmez. Token Firebase konsoluna kaydedilmeden `firebase` modunda istekler App Check
tarafından reddedilir. Yayın derlemelerinde token kullanılmaz (`__DEV__` kontrolü),
Play Integrity devreye girer.
