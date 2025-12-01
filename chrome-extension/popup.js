// Storage keys
const STORAGE_KEY = 'follower_snapshots';
const UI_STATE_KEY = 'ui_state';

// DOM Elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const extractBtn = document.getElementById('extract-btn');
const extractStatus = document.getElementById('extract-status');
const extractProgress = document.getElementById('extract-progress');
const snapshotList = document.getElementById('snapshot-list');
const emptyHistory = document.getElementById('empty-history');
const oldSnapshotSelect = document.getElementById('old-snapshot');
const newSnapshotSelect = document.getElementById('new-snapshot');
const compareBtn = document.getElementById('compare-btn');
const compareResults = document.getElementById('compare-results');
const followersSnapshotSelect = document.getElementById('followers-snapshot');
const followingSnapshotSelect = document.getElementById('following-snapshot');
const mutualBtn = document.getElementById('mutual-btn');
const mutualResults = document.getElementById('mutual-results');
const editModal = document.getElementById('edit-modal');
const editNameInput = document.getElementById('edit-name-input');
const editSaveBtn = document.getElementById('edit-save');
const editCancelBtn = document.getElementById('edit-cancel');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';
let editingSnapshotId = null;
let currentProfile = null;
let extractionSpeed = 1.5; // Default speed in seconds
let extractionState = 'idle'; // idle, running, paused
let currentTabId = null;

// Speed slider elements
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');

// Speed slider handler
speedSlider.addEventListener('input', async (e) => {
  extractionSpeed = parseFloat(e.target.value);
  speedValue.textContent = `${extractionSpeed}s`;
  
  // Update slider thumb color based on speed
  const percent = (extractionSpeed - 1) / 14; // 0 to 1
  if (percent < 0.3) {
    speedValue.style.color = '#e1306c'; // Fast - red/pink
  } else if (percent < 0.6) {
    speedValue.style.color = '#ffc107'; // Medium - yellow
  } else {
    speedValue.style.color = '#28a745'; // Slow - green
  }
  
  // Save preference and UI state
  chrome.storage.local.set({ extractionSpeed });
  saveUIState();
  
  // Update speed in real-time if extraction is running
  if (currentTabId && extractionState !== 'idle') {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        func: (speed) => { window.__extractionSpeed = speed; },
        args: [extractionSpeed * 1000]
      });
    } catch (e) {
      // Tab might be closed
    }
  }
});

// Load saved speed preference
chrome.storage.local.get('extractionSpeed', (result) => {
  if (result.extractionSpeed) {
    extractionSpeed = result.extractionSpeed;
    speedSlider.value = extractionSpeed;
    speedValue.textContent = `${extractionSpeed}s`;
  }
});

// Profile card elements
const profileCard = document.getElementById('profile-card');
const profileAvatar = document.getElementById('profile-avatar');
const profileUsername = document.getElementById('profile-username');
const profileFullname = document.getElementById('profile-fullname');
const statFollowers = document.getElementById('stat-followers');
const statFollowing = document.getElementById('stat-following');
const notInstagram = document.getElementById('not-instagram');

// Format number with K/M suffix (only for 20K+)
function formatNumber(num) {
  if (!num && num !== 0) return '-';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 20000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

// Load profile info on popup open
async function loadProfileInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url || !tab.url.includes('instagram.com')) {
      notInstagram.style.display = 'block';
      profileCard.style.display = 'none';
      return;
    }
    
    notInstagram.style.display = 'none';
    
    // Extract profile info from page
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getProfileInfo
    });
    
    const profile = results[0]?.result;
    
    if (profile && profile.username) {
      currentProfile = profile;
      profileCard.style.display = 'flex';
      profileAvatar.src = profile.avatar || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ccc"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6 0-8 3-8 6v2h16v-2c0-3-2-6-8-6z"/></svg>';
      profileUsername.textContent = `@${profile.username}`;
      profileFullname.textContent = profile.fullName || '';
      
      // Update stats
      statFollowers.textContent = formatNumber(profile.followersCount);
      statFollowing.textContent = formatNumber(profile.followingCount);
    } else {
      profileCard.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    profileCard.style.display = 'none';
  }
}

// Function to extract profile info (runs in page context)
function getProfileInfo() {
  try {
    // Get username from URL
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    let username = null;
    
    // Check if we're on a profile page (not /p/, /reel/, /explore/, etc.)
    if (pathParts.length >= 1 && 
        !['p', 'reel', 'reels', 'explore', 'direct', 'stories', 'accounts'].includes(pathParts[0])) {
      username = pathParts[0];
    }
    
    if (!username) return null;
    
    // Try to get profile picture - multiple methods
    let avatar = null;
    
    // Method 1: og:image meta tag (most reliable)
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      const content = ogImage.getAttribute('content');
      if (content && content.includes('instagram') || content.includes('cdninstagram') || content.includes('fbcdn')) {
        avatar = content;
      }
    }
    
    // Method 2: Look for profile picture button/img in header
    if (!avatar) {
      const header = document.querySelector('header');
      if (header) {
        // Look for img inside button with profile-related title/alt
        const profileBtn = header.querySelector('button[title*="Profil"], button[title*="profile"], button[title*="Profile"]');
        if (profileBtn) {
          const img = profileBtn.querySelector('img');
          if (img && img.src) {
            avatar = img.src;
          }
        }
        
        // Fallback: look for any img from Instagram CDN in header
        if (!avatar) {
          const imgs = header.querySelectorAll('img');
          for (const img of imgs) {
            if (img.src && 
                (img.src.includes('cdninstagram') || img.src.includes('fbcdn')) &&
                !img.src.includes('emoji') &&
                !img.src.includes('static')) {
              avatar = img.src;
              break;
            }
          }
        }
      }
    }
    
    // Method 3: Look for img with username in alt text
    if (!avatar) {
      const imgWithAlt = document.querySelector(`img[alt*="${username}" i]`);
      if (imgWithAlt && imgWithAlt.src && imgWithAlt.src.startsWith('http')) {
        avatar = imgWithAlt.src;
      }
    }
    
    // Method 4: Look for profile picture by common patterns
    if (!avatar) {
      const allImgs = document.querySelectorAll('img');
      for (const img of allImgs) {
        if (img.src && 
            (img.src.includes('cdninstagram.com') || img.src.includes('fbcdn.net')) &&
            (img.src.includes('dst-jpg') || img.src.includes('t51.2885-19')) &&
            !img.src.includes('emoji')) {
          avatar = img.src;
          break;
        }
      }
    }
    
    // Get full name
    let fullName = null;
    
    // Method 1: Look in header section for the name
    const header = document.querySelector('header');
    if (header) {
      // Instagram usually has the name in a span inside header section
      const spans = header.querySelectorAll('span');
      for (const span of spans) {
        const text = span.textContent?.trim();
        // Name is usually not the username and has reasonable length
        if (text && 
            text !== username && 
            text.length > 1 && 
            text.length < 50 &&
            !text.includes('takip') && // Turkish
            !text.includes('follow') && // English
            !text.includes('gönderi') && // Turkish
            !text.includes('post')) { // English
          fullName = text;
          break;
        }
      }
    }
    
    // Method 2: Meta tag fallback
    if (!fullName) {
      const metaTitle = document.querySelector('meta[property="og:title"]');
      if (metaTitle) {
        const content = metaTitle.getAttribute('content');
        if (content) {
          // Format: "Name (@username) • Instagram"
          const match = content.match(/^([^(@•]+)/);
          if (match) {
            fullName = match[1].trim();
          }
        }
      }
    }
    
    // Get follower and following counts from page
    let followersCount = null;
    let followingCount = null;
    
    // Method 1: Look for links/buttons with followers/following text in header
    const headerForStats = document.querySelector('header');
    if (headerForStats) {
      // Find all elements that might contain stats
      const allElements = headerForStats.querySelectorAll('a, span, div');
      
      for (const el of allElements) {
        const text = el.textContent?.trim() || '';
        
        // Turkish: "788 takipçi" or "960 takip"
        // English: "788 followers" or "960 following"
        
        // Match followers
        if (!followersCount) {
          const followersMatch = text.match(/^([\d,\.]+)\s*(takipçi|followers?)$/i);
          if (followersMatch) {
            followersCount = parseInt(followersMatch[1].replace(/[,\.]/g, ''));
          }
        }
        
        // Match following (but not "takipçi")
        if (!followingCount) {
          const followingMatch = text.match(/^([\d,\.]+)\s*(takip|following)$/i);
          if (followingMatch && !text.toLowerCase().includes('takipçi')) {
            followingCount = parseInt(followingMatch[1].replace(/[,\.]/g, ''));
          }
        }
      }
    }
    
    // Method 2: Fallback to og:description meta tag
    if (!followersCount || !followingCount) {
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        const content = ogDesc.getAttribute('content');
        if (content) {
          if (!followersCount) {
            const followersMatch = content.match(/([\d,\.]+)\s*(Takipçi|Followers?)/i);
            if (followersMatch) {
              followersCount = parseInt(followersMatch[1].replace(/[,\.]/g, ''));
            }
          }
          if (!followingCount) {
            const followingMatch = content.match(/([\d,\.]+)\s*(Takip(?!çi)|Following)/i);
            if (followingMatch) {
              followingCount = parseInt(followingMatch[1].replace(/[,\.]/g, ''));
            }
          }
        }
      }
    }
    
    return { username, avatar, fullName, followersCount, followingCount };
  } catch (e) {
    return null;
  }
}

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    
    if (tab.dataset.tab === 'history') loadHistory();
    if (tab.dataset.tab === 'compare') loadCompareOptions();
    if (tab.dataset.tab === 'mutual') loadMutualOptions();
  });
});

// Control buttons
const extractButtons = document.getElementById('extract-buttons');
const controlButtons = document.getElementById('control-buttons');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    loadHistory();
  });
});

// Show/hide control buttons
function showControlButtons() {
  extractButtons.style.display = 'none';
  controlButtons.style.display = 'flex';
}

function hideControlButtons() {
  extractButtons.style.display = 'block';
  controlButtons.style.display = 'none';
  pauseBtn.classList.remove('paused');
  pauseBtn.querySelector('.btn-icon').textContent = '⏸️';
  pauseBtn.querySelector('.btn-text').textContent = 'Pause';
}

// Pause button handler
pauseBtn.addEventListener('click', async () => {
  if (!currentTabId) return;
  
  if (extractionState === 'running') {
    extractionState = 'paused';
    pauseBtn.classList.add('paused');
    pauseBtn.querySelector('.btn-icon').textContent = '▶️';
    pauseBtn.querySelector('.btn-text').textContent = 'Resume';
    
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: () => { window.__extractionPaused = true; }
    });
    
    // Update counter display immediately
    updateLiveCounter();
  } else if (extractionState === 'paused') {
    extractionState = 'running';
    pauseBtn.classList.remove('paused');
    pauseBtn.querySelector('.btn-icon').textContent = '⏸️';
    pauseBtn.querySelector('.btn-text').textContent = 'Pause';
    
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: () => { window.__extractionPaused = false; }
    });
  }
});

// Stop button handler
stopBtn.addEventListener('click', async () => {
  if (!currentTabId) return;
  
  extractionState = 'idle';
  await chrome.scripting.executeScript({
    target: { tabId: currentTabId },
    func: () => { window.__extractionStopped = true; }
  });
});

// Live counter update interval
let counterInterval = null;
let expectedTotal = null;
let currentExtractType = null;

async function updateLiveCounter() {
  if (!currentTabId || extractionState === 'idle') return;
  
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: () => window.__extractionCount || 0
    });
    
    const count = results[0]?.result || 0;
    const progressText = document.querySelector('.progress-text');
    const progressFill = document.querySelector('.progress-fill');
    const statusText = extractionState === 'paused' ? '⏸️ Paused' : '🔄 Extracting';
    
    // Show progress with total if available
    if (expectedTotal && expectedTotal > 0) {
      const percent = Math.min(100, Math.round((count / expectedTotal) * 100));
      progressText.textContent = `${statusText}... ${count}/${expectedTotal} (${percent}%)`;
      progressFill.style.width = `${percent}%`;
    } else {
      progressText.textContent = `${statusText}... ${count} found`;
      progressFill.style.width = `${Math.min(100, (count / 10) % 100)}%`;
    }
  } catch (e) {
    // Tab might be closed
  }
}

function startLiveCounter() {
  stopLiveCounter();
  counterInterval = setInterval(updateLiveCounter, 500);
}

function stopLiveCounter() {
  if (counterInterval) {
    clearInterval(counterInterval);
    counterInterval = null;
  }
}

// Extract followers/following
extractBtn.addEventListener('click', async () => {
  const extractType = document.querySelector('input[name="extractType"]:checked').value;
  currentExtractType = extractType;
  
  // Set expected total based on profile info
  if (currentProfile) {
    expectedTotal = extractType === 'followers' 
      ? currentProfile.followersCount 
      : currentProfile.followingCount;
  } else {
    expectedTotal = null;
  }
  
  extractStatus.className = 'status';
  extractStatus.textContent = '';
  extractProgress.style.display = 'block';
  
  // Initial progress text
  const initialText = expectedTotal 
    ? `🔄 Extracting ${extractType}... 0/${expectedTotal} (0%)`
    : `🔄 Extracting ${extractType}... 0 found`;
  document.querySelector('.progress-text').textContent = initialText;
  document.querySelector('.progress-fill').style.width = '0%';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('instagram.com')) {
      throw new Error('Please open Instagram first!');
    }
    
    currentTabId = tab.id;
    extractionState = 'running';
    showControlButtons();
    
    // Reset extraction flags and counter
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        window.__extractionPaused = false;
        window.__extractionStopped = false;
        window.__extractionCount = 0;
      }
    });
    
    // Start live counter updates
    startLiveCounter();
    
    // Inject and run extraction script with speed parameter
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractFromPage,
      args: [extractionSpeed * 1000] // Convert to milliseconds
    });
    
    const data = results[0].result;
    
    if (!data || data.length === 0) {
      throw new Error(`No ${extractType} found. Make sure the modal is open!`);
    }
    
    // Save snapshot with profile info
    const profileName = currentProfile?.username || 'Unknown';
    const snapshot = {
      id: Date.now().toString(),
      name: `@${profileName} - ${extractType === 'followers' ? 'Followers' : 'Following'}`,
      type: extractType,
      data: data,
      count: data.length,
      createdAt: new Date().toISOString(),
      profile: currentProfile ? {
        username: currentProfile.username,
        fullName: currentProfile.fullName,
        avatar: currentProfile.avatar
      } : null
    };
    
    await saveSnapshot(snapshot);
    
    extractStatus.className = 'status success';
    extractStatus.textContent = `✅ Found ${data.length} ${extractType}! Saved.`;
    
  } catch (error) {
    extractStatus.className = 'status error';
    extractStatus.textContent = `❌ ${error.message}`;
  } finally {
    stopLiveCounter();
    extractionState = 'idle';
    currentTabId = null;
    expectedTotal = null;
    currentExtractType = null;
    hideControlButtons();
    extractProgress.style.display = 'none';
  }
});

// Extraction function (runs in page context)
function extractFromPage(scrollDelayMs) {
  return new Promise((resolve) => {
    const modal = document.querySelector('div[role="dialog"]');
    if (!modal) {
      resolve([]);
      return;
    }
    
    let scrollBox = modal.querySelector('._aano');
    if (!scrollBox) {
      const divs = modal.querySelectorAll('div');
      for (const div of divs) {
        const style = window.getComputedStyle(div);
        if (style.overflowY === 'scroll' || 
            (style.overflowY === 'auto' && div.scrollHeight > div.clientHeight)) {
          scrollBox = div;
          break;
        }
      }
    }
    
    if (!scrollBox) {
      resolve([]);
      return;
    }
    
    const users = new Set();
    let noChangeCount = 0;
    let lastCount = 0;
    let attempts = 0;
    const maxAttempts = 500; // Increased from 150
    const maxNoChange = 10; // Increased from 5 - wait longer for lazy loading
    
    // Initialize counter and speed
    window.__extractionCount = 0;
    window.__extractionSpeed = scrollDelayMs;
    
    // Add randomness to delay (±20%) - uses live speed from window
    const getDelay = () => {
      const currentSpeed = window.__extractionSpeed || scrollDelayMs;
      const variance = currentSpeed * 0.2;
      return currentSpeed + (Math.random() * variance * 2 - variance);
    };
    
    const scrollAndCollect = () => {
      // Check if stopped
      if (window.__extractionStopped) {
        resolve(Array.from(users));
        return;
      }
      
      // Check if paused
      if (window.__extractionPaused) {
        setTimeout(scrollAndCollect, 200);
        return;
      }
      
      modal.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('/p/') && 
            !href.startsWith('/explore') && !href.startsWith('/reel')) {
          const username = href.split('/')[1];
          if (username && /^[a-zA-Z0-9_.]{1,30}$/.test(username)) {
            users.add(username);
          }
        }
      });
      
      // Update live counter
      window.__extractionCount = users.size;
      
      // Check if we can still scroll
      const canScroll = scrollBox.scrollTop + scrollBox.clientHeight < scrollBox.scrollHeight - 10;
      
      if (users.size === lastCount) {
        noChangeCount++;
        // Only stop if we can't scroll anymore AND no new users for a while
        if (noChangeCount >= maxNoChange && !canScroll) {
          resolve(Array.from(users));
          return;
        }
        // If we can still scroll, keep trying even with no new users
        if (noChangeCount >= maxNoChange * 2) {
          resolve(Array.from(users));
          return;
        }
      } else {
        noChangeCount = 0;
        lastCount = users.size;
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        resolve(Array.from(users));
        return;
      }
      
      // Scroll more aggressively
      const scrollAmount = Math.random() * 400 + 300; // Increased scroll amount
      scrollBox.scrollTop += scrollAmount;
      
      // If near bottom, try scrolling to absolute bottom
      if (!canScroll) {
        scrollBox.scrollTop = scrollBox.scrollHeight;
      }
      
      setTimeout(scrollAndCollect, getDelay());
    };
    
    scrollAndCollect();
  });
}

// Storage functions
async function getSnapshots() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const snapshots = result[STORAGE_KEY];
    // Ensure we always return an array
    if (!snapshots || !Array.isArray(snapshots)) {
      return [];
    }
    // Filter out any invalid entries
    return snapshots.filter(s => s && typeof s === 'object' && s.id);
  } catch (error) {
    console.error('Error getting snapshots:', error);
    return [];
  }
}

async function saveSnapshot(snapshot) {
  const snapshots = await getSnapshots();
  snapshots.unshift(snapshot);
  await chrome.storage.local.set({ [STORAGE_KEY]: snapshots });
}

async function updateSnapshot(id, updates) {
  const snapshots = await getSnapshots();
  const index = snapshots.findIndex(s => s.id === id);
  if (index !== -1) {
    snapshots[index] = { ...snapshots[index], ...updates };
    await chrome.storage.local.set({ [STORAGE_KEY]: snapshots });
  }
}

async function deleteSnapshot(id) {
  const snapshots = await getSnapshots();
  const filtered = snapshots.filter(s => s.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
  loadHistory();
  loadCompareOptions();
  loadMutualOptions();
}

// Load history
async function loadHistory() {
  try {
    let snapshots = await getSnapshots() || [];
    
    // Filter out any null/undefined entries
    snapshots = snapshots.filter(s => s && s.id);
    
    // Apply filter
    if (currentFilter !== 'all') {
      snapshots = snapshots.filter(s => s.type === currentFilter);
    }
  
  if (snapshots.length === 0) {
    snapshotList.innerHTML = '';
    emptyHistory.style.display = 'block';
    return;
  }
  
  emptyHistory.style.display = 'none';
  snapshotList.innerHTML = snapshots.map(s => `
    <div class="snapshot-item" data-id="${s.id}">
      <div class="snapshot-info">
        <div class="snapshot-name">${s.name}</div>
        <div class="snapshot-meta">
          <span class="snapshot-type ${s.type}">${s.type === 'followers' ? '👥' : '➡️'} ${s.type}</span>
          <span>${s.count}</span>
          <span>${new Date(s.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="snapshot-actions">
        <button class="icon-btn edit" title="Edit name" data-id="${s.id}">✏️</button>
        <button class="icon-btn export" title="Export CSV" data-id="${s.id}">📥</button>
        <button class="icon-btn delete" title="Delete" data-id="${s.id}">🗑️</button>
      </div>
    </div>
  `).join('');
  
  // Add event listeners
  snapshotList.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', () => deleteSnapshot(btn.dataset.id));
  });
  
  snapshotList.querySelectorAll('.export').forEach(btn => {
    btn.addEventListener('click', () => exportSnapshot(btn.dataset.id));
  });
  
  snapshotList.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });
  } catch (error) {
    console.error('Error loading history:', error);
    snapshotList.innerHTML = '';
    emptyHistory.style.display = 'block';
  }
}

// Edit modal
async function openEditModal(id) {
  const snapshots = await getSnapshots();
  const snapshot = snapshots.find(s => s.id === id);
  if (!snapshot) return;
  
  editingSnapshotId = id;
  editNameInput.value = snapshot.name;
  editModal.style.display = 'flex';
  editNameInput.focus();
}

editCancelBtn.addEventListener('click', () => {
  editModal.style.display = 'none';
  editingSnapshotId = null;
});

editSaveBtn.addEventListener('click', async () => {
  if (editingSnapshotId && editNameInput.value.trim()) {
    await updateSnapshot(editingSnapshotId, { name: editNameInput.value.trim() });
    editModal.style.display = 'none';
    editingSnapshotId = null;
    loadHistory();
    loadCompareOptions();
    loadMutualOptions();
  }
});

editNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') editSaveBtn.click();
  if (e.key === 'Escape') editCancelBtn.click();
});

// Export snapshot
async function exportSnapshot(id) {
  const snapshots = await getSnapshots();
  const snapshot = snapshots.find(s => s.id === id);
  if (!snapshot) return;
  
  const csv = 'Username\n' + snapshot.data.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${snapshot.type}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  
  URL.revokeObjectURL(url);
}

// Load compare options
async function loadCompareOptions() {
  try {
    if (!oldSnapshotSelect || !newSnapshotSelect) return;
    
    const snapshots = await getSnapshots() || [];
    
    const options = snapshots.map(s => 
      `<option value="${s.id}">${s.name} (${s.count || 0})</option>`
    ).join('');
    
    oldSnapshotSelect.innerHTML = options || '<option>No snapshots</option>';
    newSnapshotSelect.innerHTML = options || '<option>No snapshots</option>';
    
    if (snapshots.length >= 2) {
      newSnapshotSelect.selectedIndex = 0;
      oldSnapshotSelect.selectedIndex = 1;
    }
  } catch (error) {
    console.error('Error loading compare options:', error);
  }
}

// Load mutual options
async function loadMutualOptions() {
  try {
    if (!followersSnapshotSelect || !followingSnapshotSelect) return;
    
    const snapshots = await getSnapshots() || [];
    
    const followersOptions = snapshots
      .filter(s => s && s.type === 'followers')
      .map(s => `<option value="${s.id}">${s.name} (${s.count || 0})</option>`)
      .join('');
    
    const followingOptions = snapshots
      .filter(s => s && s.type === 'following')
      .map(s => `<option value="${s.id}">${s.name} (${s.count || 0})</option>`)
      .join('');
    
    followersSnapshotSelect.innerHTML = followersOptions || '<option>No followers snapshots</option>';
    followingSnapshotSelect.innerHTML = followingOptions || '<option>No following snapshots</option>';
  } catch (error) {
    console.error('Error loading mutual options:', error);
  }
}

// Compare snapshots
compareBtn.addEventListener('click', async () => {
  try {
    const snapshots = await getSnapshots() || [];
    const oldSnapshot = snapshots.find(s => s && s.id === oldSnapshotSelect.value);
    const newSnapshot = snapshots.find(s => s && s.id === newSnapshotSelect.value);
    
    if (!oldSnapshot || !newSnapshot) {
      compareResults.style.display = 'block';
      compareResults.innerHTML = '<div class="status error">⚠️ Please select two snapshots to compare</div>';
      return;
    }
    
    // Ensure data arrays exist
    const oldData = Array.isArray(oldSnapshot.data) ? oldSnapshot.data : [];
    const newData = Array.isArray(newSnapshot.data) ? newSnapshot.data : [];
    
    // Check if old snapshot has no data (legacy format)
    if (oldData.length === 0 && oldSnapshot.count > 0) {
      compareResults.style.display = 'block';
      compareResults.innerHTML = `
        <div class="status error">
          ⚠️ "${oldSnapshot.name}" is an old format snapshot without user data.<br>
          Only snapshots created with this extension can be compared.
        </div>
      `;
      return;
    }
    
    const oldSet = new Set(oldData.map(u => u.toLowerCase()));
    const newSet = new Set(newData.map(u => u.toLowerCase()));
    
    const newUsers = newData.filter(u => !oldSet.has(u.toLowerCase()));
    const removedUsers = oldData.filter(u => !newSet.has(u.toLowerCase()));
    
    const oldCount = oldSnapshot.count || oldData.length;
    const newCount = newSnapshot.count || newData.length;
    const net = newCount - oldCount;
    const netClass = net >= 0 ? 'positive' : 'negative';
    const netSign = net >= 0 ? '+' : '';
    
    compareResults.style.display = 'block';
    compareResults.innerHTML = `
      <div class="summary-box">
        <div class="net ${netClass}">${netSign}${net}</div>
        <div>Net change (${oldCount} → ${newCount})</div>
      </div>
      
      <div class="result-section new">
        <h3>✅ New (${newUsers.length})</h3>
        <div class="user-list">
          ${newUsers.map(u => `<a href="https://instagram.com/${u}" target="_blank">@${u}</a>`).join('')}
          ${newUsers.length === 0 ? '<p>None</p>' : ''}
        </div>
      </div>
      
      <div class="result-section unfollowed">
        <h3>❌ Removed (${removedUsers.length})</h3>
        <div class="user-list">
          ${removedUsers.map(u => `<a href="https://instagram.com/${u}" target="_blank">@${u}</a>`).join('')}
          ${removedUsers.length === 0 ? '<p>None</p>' : ''}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Compare error:', error);
    compareResults.style.display = 'block';
    compareResults.innerHTML = `<div class="status error">❌ Error: ${error.message}</div>`;
  }
});

// Mutual analysis
mutualBtn.addEventListener('click', async () => {
  const snapshots = await getSnapshots();
  const followersSnapshot = snapshots.find(s => s.id === followersSnapshotSelect.value);
  const followingSnapshot = snapshots.find(s => s.id === followingSnapshotSelect.value);
  
  if (!followersSnapshot || !followingSnapshot) {
    alert('Please select both a Followers and Following snapshot');
    return;
  }
  
  const followersSet = new Set(followersSnapshot.data.map(u => u.toLowerCase()));
  const followingSet = new Set(followingSnapshot.data.map(u => u.toLowerCase()));
  
  // People you follow who don't follow you back
  const notFollowingBack = followingSnapshot.data.filter(u => !followersSet.has(u.toLowerCase()));
  
  // People who follow you but you don't follow back
  const youNotFollowing = followersSnapshot.data.filter(u => !followingSet.has(u.toLowerCase()));
  
  // Mutual followers
  const mutual = followersSnapshot.data.filter(u => followingSet.has(u.toLowerCase()));
  
  mutualResults.style.display = 'block';
  mutualResults.innerHTML = `
    <div class="summary-box">
      <div>🤝 ${mutual.length} mutual</div>
    </div>
    
    <div class="result-section not-following-back">
      <h3>😤 Don't follow you back (${notFollowingBack.length})</h3>
      <div class="user-list">
        ${notFollowingBack.map(u => `<a href="https://instagram.com/${u}" target="_blank">@${u}</a>`).join('')}
        ${notFollowingBack.length === 0 ? '<p>Everyone follows you back! 🎉</p>' : ''}
      </div>
    </div>
    
    <div class="result-section you-not-following">
      <h3>👀 You don't follow back (${youNotFollowing.length})</h3>
      <div class="user-list">
        ${youNotFollowing.map(u => `<a href="https://instagram.com/${u}" target="_blank">@${u}</a>`).join('')}
        ${youNotFollowing.length === 0 ? '<p>You follow everyone back!</p>' : ''}
      </div>
    </div>
    
    <div class="result-section mutual">
      <h3>🤝 Mutual (${mutual.length})</h3>
      <div class="user-list">
        ${mutual.slice(0, 50).map(u => `<a href="https://instagram.com/${u}" target="_blank">@${u}</a>`).join('')}
        ${mutual.length > 50 ? `<p>...and ${mutual.length - 50} more</p>` : ''}
        ${mutual.length === 0 ? '<p>No mutual followers</p>' : ''}
      </div>
    </div>
  `;
});

// CSV Import
const csvImport = document.getElementById('csv-import');

csvImport.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      alert('CSV file is empty or invalid');
      return;
    }
    
    // Parse header to find Username column
    const header = lines[0].split(',');
    const usernameIndex = header.findIndex(h => 
      h.toLowerCase().includes('username') || h.toLowerCase() === 'user'
    );
    
    if (usernameIndex === -1) {
      // Try simple format (just usernames, one per line)
      const usernames = lines.filter(line => /^[a-zA-Z0-9_.]{1,30}$/.test(line.trim()));
      if (usernames.length > 0) {
        await importUsernames(usernames, file.name);
        return;
      }
      alert('Could not find Username column in CSV');
      return;
    }
    
    // Extract usernames from CSV
    const usernames = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols[usernameIndex]) {
        const username = cols[usernameIndex].trim();
        if (username && /^[a-zA-Z0-9_.]{1,30}$/.test(username)) {
          usernames.push(username);
        }
      }
    }
    
    if (usernames.length === 0) {
      alert('No valid usernames found in CSV');
      return;
    }
    
    await importUsernames(usernames, file.name);
    
  } catch (error) {
    console.error('Import error:', error);
    alert('Error importing CSV: ' + error.message);
  }
  
  // Reset file input
  e.target.value = '';
});

// Parse CSV line handling quoted values
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Import usernames as snapshot
async function importUsernames(usernames, filename) {
  // Determine type from filename
  let type = 'followers';
  if (filename.toLowerCase().includes('following')) {
    type = 'following';
  }
  
  // Create snapshot
  const snapshot = {
    id: Date.now().toString(),
    name: `📥 Imported: ${filename.replace('.csv', '')}`,
    type: type,
    data: usernames,
    count: usernames.length,
    createdAt: new Date().toISOString(),
    imported: true
  };
  
  await saveSnapshot(snapshot);
  
  alert(`✅ Imported ${usernames.length} ${type}!`);
  loadHistory();
  loadCompareOptions();
  loadMutualOptions();
}

// Pop-out button - open in new window
const popoutBtn = document.getElementById('popout-btn');
if (popoutBtn) {
  popoutBtn.addEventListener('click', () => {
    // Get current window dimensions
    const width = 400;
    const height = 600;
    
    // Open popup.html in a new window
    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: width,
      height: height,
      top: 100,
      left: screen.width - width - 50
    });
    
    // Close the popup
    window.close();
  });
}

// Save UI state
async function saveUIState() {
  const activeTab = document.querySelector('.tab.active')?.dataset.tab || 'extract';
  await chrome.storage.local.set({
    [UI_STATE_KEY]: {
      activeTab,
      currentFilter,
      extractionSpeed
    }
  });
}

// Load UI state
async function loadUIState() {
  try {
    const result = await chrome.storage.local.get(UI_STATE_KEY);
    const state = result[UI_STATE_KEY];
    
    if (state) {
      // Restore active tab
      if (state.activeTab) {
        const tabBtn = document.querySelector(`.tab[data-tab="${state.activeTab}"]`);
        if (tabBtn) {
          tabs.forEach(t => t.classList.remove('active'));
          tabContents.forEach(c => c.classList.remove('active'));
          tabBtn.classList.add('active');
          const tabContent = document.getElementById(`${state.activeTab}-tab`);
          if (tabContent) tabContent.classList.add('active');
        }
      }
      
      // Restore filter
      if (state.currentFilter) {
        currentFilter = state.currentFilter;
        filterBtns.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.filter === currentFilter);
        });
      }
      
      // Restore extraction speed
      if (state.extractionSpeed) {
        extractionSpeed = state.extractionSpeed;
        speedSlider.value = extractionSpeed;
        speedValue.textContent = `${extractionSpeed}s`;
      }
    }
  } catch (error) {
    console.error('Error loading UI state:', error);
  }
}

// Save state on tab change
tabs.forEach(tab => {
  tab.addEventListener('click', saveUIState);
});

// Save state on filter change
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    setTimeout(saveUIState, 100);
  });
});

// Initialize
async function init() {
  await loadUIState();
  loadProfileInfo();
  loadHistory();
  loadCompareOptions();
  loadMutualOptions();
}

init();
