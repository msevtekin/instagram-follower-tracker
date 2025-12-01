// Content script for Instagram Follower Tracker
// This runs on Instagram pages

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractFollowers') {
    extractFollowers().then(sendResponse);
    return true; // Keep channel open for async response
  }
});

async function extractFollowers() {
  const modal = document.querySelector('div[role="dialog"]');
  if (!modal) {
    return { error: 'Followers modal not found. Please open it first.' };
  }

  // Find scroll container
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
    return { error: 'Could not find scrollable area in modal.' };
  }

  const followers = new Set();
  let noChangeCount = 0;
  let lastCount = 0;
  const maxAttempts = 100;
  let attempts = 0;

  while (noChangeCount < 5 && attempts < maxAttempts) {
    attempts++;

    // Collect usernames
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

    if (followers.size === lastCount) {
      noChangeCount++;
    } else {
      noChangeCount = 0;
      lastCount = followers.size;
    }

    // Scroll
    scrollBox.scrollTop += Math.random() * 300 + 200;
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
  }

  return { followers: Array.from(followers) };
}
