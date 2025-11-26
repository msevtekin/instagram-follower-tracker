/**
 * InstagramScript Component
 * 
 * Shows instructions and script for extracting followers from Instagram.
 */

import { useState } from 'react';

const INSTAGRAM_SCRIPT = `// Instagram Follower Extractor Script v3 (Human-like)
// 1. Instagram'da profiline git
// 2. "Takipçiler" butonuna tıkla (modal açılsın)
// 3. Bu scripti tarayıcı konsoluna yapıştır (F12 -> Console)
// 4. Enter'a bas ve bekle (insan gibi scroll yapar, biraz zaman alır)

(async function extractFollowers() {
  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  
  // Random delay between min and max (ms)
  const randomDelay = (min, max) => delay(Math.floor(Math.random() * (max - min + 1)) + min);
  
  // Modal'ı bul
  const modal = document.querySelector('div[role="dialog"]');
  if (!modal) {
    console.error('❌ Takipçi listesi açık değil! Önce "Takipçiler" butonuna tıkla.');
    return;
  }
  
  // Scroll container'ı bul - birden fazla yöntem dene
  let scrollBox = null;
  
  // Yöntem 1: _aano class'ı (Instagram'ın kullandığı)
  scrollBox = modal.querySelector('._aano');
  
  // Yöntem 2: overflow-y: scroll olan div
  if (!scrollBox) {
    const divs = modal.querySelectorAll('div');
    for (const div of divs) {
      const style = window.getComputedStyle(div);
      if (style.overflowY === 'scroll' || style.overflow === 'scroll' || 
          style.overflowY === 'auto' && div.scrollHeight > div.clientHeight) {
        scrollBox = div;
        break;
      }
    }
  }
  
  // Yöntem 3: En büyük scrollable div
  if (!scrollBox) {
    let maxHeight = 0;
    modal.querySelectorAll('div').forEach(div => {
      if (div.scrollHeight > div.clientHeight && div.scrollHeight > maxHeight) {
        maxHeight = div.scrollHeight;
        scrollBox = div;
      }
    });
  }
  
  if (!scrollBox) {
    console.error('❌ Scroll alanı bulunamadı! Modal içinde scroll yapılabilir alan yok.');
    return;
  }
  
  console.log('🔄 Takipçiler yükleniyor... Lütfen bekleyin.');
  console.log('📍 Scroll container bulundu:', scrollBox.className);
  
  const followers = new Set();
  let lastCount = 0;
  let noChangeCount = 0;
  let scrollAttempts = 0;
  const maxScrollAttempts = 200; // 900 takipçi için yeterli
  
  while (noChangeCount < 8 && scrollAttempts < maxScrollAttempts) {
    scrollAttempts++;
    
    // Kullanıcı adlarını topla - tüm linklerden
    modal.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('/p/') && 
          !href.startsWith('/explore') && !href.startsWith('/reel')) {
        const username = href.split('/')[1];
        if (username && /^[a-zA-Z0-9_.]{1,30}$/.test(username)) {
          followers.add(username);
        }
      }
    });
    
    // Scroll yap - insan gibi rastgele miktarda
    const prevScrollTop = scrollBox.scrollTop;
    const scrollAmount = Math.floor(Math.random() * 300) + 200; // 200-500 arası random scroll
    
    // Rastgele scroll yöntemi seç
    const method = Math.floor(Math.random() * 3);
    if (method === 0) {
      scrollBox.scrollTop += scrollAmount;
    } else if (method === 1) {
      scrollBox.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    } else {
      const lastItem = scrollBox.lastElementChild;
      if (lastItem) {
        lastItem.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
    
    // 1-4 saniye arası rastgele bekleme (insan gibi)
    const waitTime = Math.floor(Math.random() * 3000) + 1000; // 1000-4000ms
    console.log(\`⏳ \${(waitTime/1000).toFixed(1)}s bekleniyor...\`);
    await delay(waitTime);
    
    // Scroll değişti mi kontrol et
    const scrollChanged = scrollBox.scrollTop !== prevScrollTop;
    
    if (followers.size === lastCount) {
      noChangeCount++;
      if (!scrollChanged) {
        // Scroll hareket etmiyorsa daha agresif dene
        scrollBox.scrollTop = scrollBox.scrollHeight;
        await randomDelay(2000, 4000);
      }
    } else {
      noChangeCount = 0;
      lastCount = followers.size;
      console.log(\`📊 \${followers.size} takipçi bulundu...\`);
    }
  }
  
  // Sonuç
  const result = Array.from(followers).join('\\n');
  console.log('\\n' + '='.repeat(50));
  console.log('✅ TAMAMLANDI!');
  console.log(\`📊 Toplam: \${followers.size} takipçi\`);
  console.log(\`🔄 Scroll denemesi: \${scrollAttempts}\`);
  console.log('='.repeat(50));
  
  // Clipboard'a kopyala
  try {
    await navigator.clipboard.writeText(result);
    console.log('\\n✅ Liste panoya kopyalandı! Şimdi uygulamaya yapıştırabilirsin.');
  } catch (e) {
    console.log('\\n📋 Listeyi manuel kopyala:');
    console.log(result);
  }
  
  return followers.size;
})();`;

export function InstagramScript() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTAGRAM_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = INSTAGRAM_SCRIPT;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) {
    return (
      <button className="instagram-script-btn" onClick={() => setIsOpen(true)}>
        📥 Instagram'dan Takipçi Listesi Al
      </button>
    );
  }

  return (
    <div className="instagram-script-modal">
      <div className="instagram-script-content">
        <div className="script-header">
          <h3>Instagram'dan Takipçi Listesi Alma</h3>
          <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>
        
        <div className="script-instructions">
          <h4>Adımlar:</h4>
          <ol>
            <li>Instagram.com'a git ve giriş yap</li>
            <li>Profiline git</li>
            <li><strong>"Takipçiler"</strong> butonuna tıkla (liste açılsın)</li>
            <li>Tarayıcıda <strong>F12</strong> tuşuna bas (Developer Tools)</li>
            <li><strong>Console</strong> sekmesine geç</li>
            <li>Aşağıdaki scripti kopyala ve Console'a yapıştır</li>
            <li><strong>Enter</strong> tuşuna bas</li>
            <li>Script tamamlanınca liste otomatik kopyalanacak</li>
            <li>Bu uygulamaya gelip yapıştır</li>
          </ol>
        </div>

        <div className="script-code">
          <div className="code-header">
            <span>JavaScript</span>
            <button onClick={handleCopy}>
              {copied ? '✅ Kopyalandı!' : '📋 Scripti Kopyala'}
            </button>
          </div>
          <pre>{INSTAGRAM_SCRIPT}</pre>
        </div>

        <p className="script-note">
          ⚠️ Bu script sadece kendi tarayıcında, kendi oturumunla çalışır. 
          Hiçbir veri dışarı gönderilmez.
        </p>
      </div>
    </div>
  );
}

export default InstagramScript;
