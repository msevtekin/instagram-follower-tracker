# Instagram Follower Tracker - Chrome Extension

Chrome eklentisi olarak Instagram takipçi takibi.

## 🚀 Kurulum

### Geliştirici Modunda Yükleme

1. Chrome'da `chrome://extensions/` adresine git
2. Sağ üstten **"Developer mode"** (Geliştirici modu) aç
3. **"Load unpacked"** (Paketlenmemiş öğe yükle) tıkla
4. Bu `chrome-extension` klasörünü seç
5. Eklenti yüklendi! 🎉

### İkon Oluşturma (Opsiyonel)

`icons` klasörüne şu boyutlarda PNG ikonlar ekle:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

## 📖 Kullanım

### Takipçi Çekme

1. Instagram.com'a git ve giriş yap
2. Profiline git
3. **"Takipçiler"** butonuna tıkla (modal açılsın)
4. Eklenti ikonuna tıkla
5. **"🚀 Extract Followers"** butonuna tıkla
6. Bekle... Otomatik scroll yaparak tüm takipçileri çeker

### Karşılaştırma

1. **"Compare"** sekmesine git
2. Eski ve yeni snapshot'ı seç
3. **"🔍 Compare"** tıkla
4. Yeni takipçiler ve unfollower'ları gör

### Export

1. **"History"** sekmesine git
2. İstediğin snapshot'ın yanındaki 📥 ikonuna tıkla
3. CSV dosyası indirilir

## ⚠️ Notlar

- Instagram'ın rate limit'lerine dikkat et
- Çok sık kullanma, hesabın geçici olarak kısıtlanabilir
- Tüm veriler tarayıcında yerel olarak saklanır
- Hiçbir veri dışarı gönderilmez

## 🔧 Geliştirme

```
chrome-extension/
├── manifest.json      # Eklenti yapılandırması
├── popup.html         # Popup arayüzü
├── popup.css          # Popup stilleri
├── popup.js           # Popup mantığı
├── content.js         # Instagram sayfasında çalışan script
├── content.css        # Sayfa içi stiller
└── icons/             # Eklenti ikonları
```

## 📄 Lisans

MIT License
