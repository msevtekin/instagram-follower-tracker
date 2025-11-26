# 📊 Instagram Follower Tracker

Instagram takipçi listelerinizi karşılaştırarak kimin sizi takipten çıktığını ve yeni takipçilerinizi kolayca görün.

## ✨ Özellikler

- 📤 **CSV Yükleme** - Instagram'dan dışa aktarılan CSV dosyalarını yükleyin
- 📝 **Manuel Giriş** - Takipçi listesini manuel olarak yapıştırın
- 📸 **Snapshot Kaydetme** - Takipçi listelerinizi anlık görüntü olarak saklayın
- 🔄 **Karşılaştırma** - İki snapshot'ı karşılaştırarak değişiklikleri görün
- 📥 **CSV Export** - Snapshot'ları CSV olarak indirin
- ✏️ **İsim Düzenleme** - Snapshot isimlerini düzenleyin
- 💾 **Yerel Depolama** - Tüm veriler tarayıcınızda güvenle saklanır

## 🚀 Nasıl Kullanılır

### 1. Instagram'dan Takipçi Listesi Alma

Instagram takipçi listenizi almak için tarayıcı konsolunda şu scripti çalıştırın:

1. Instagram'da profil sayfanıza gidin
2. Takipçiler listesini açın
3. Tarayıcı konsolunu açın (F12 → Console)
4. Uygulamadaki scripti kopyalayıp yapıştırın
5. İndirilen CSV dosyasını uygulamaya yükleyin

### 2. Snapshot Oluşturma

- **CSV Yükleme:** "Choose File" ile CSV dosyanızı seçin
- **Manuel Giriş:** Kullanıcı adlarını satır satır veya virgülle ayırarak yapıştırın

### 3. Karşılaştırma

1. History sekmesine gidin
2. Karşılaştırmak istediğiniz iki snapshot'ı seçin
3. "Compare Selected" butonuna tıklayın
4. Yeni takipçiler ve takipten çıkanları görün

## 🛠️ Teknolojiler

- **Frontend:** React, TypeScript, Vite
- **Styling:** CSS
- **Storage:** localStorage (tarayıcı)

## 💻 Yerel Geliştirme

```bash
# Repo'yu klonla
git clone https://github.com/msevtekin/instagram-follower-tracker.git
cd instagram-follower-tracker

# Frontend bağımlılıklarını yükle
cd frontend
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## 📁 Proje Yapısı

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload/        # Yükleme bileşenleri
│   │   │   ├── History/       # Geçmiş listesi
│   │   │   └── Comparison/    # Karşılaştırma sonuçları
│   │   ├── App.tsx            # Ana uygulama
│   │   └── index.css          # Stiller
│   └── package.json
└── README.md
```

## 🔒 Gizlilik

- Tüm veriler **sadece tarayıcınızda** saklanır
- Hiçbir veri sunucuya gönderilmez
- Tarayıcı verilerini temizlerseniz snapshot'lar silinir

## 📝 Lisans

MIT License

---

Made with ❤️ by [@msevtekin](https://github.com/msevtekin)
