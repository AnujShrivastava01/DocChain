// ===== PWA INSTALLATION MANAGER =====

let deferredPrompt = null;
const DEFER_TOAST_KEY = 'docchain-pwa-dismissed';

document.addEventListener('DOMContentLoaded', () => {
  // Register Service Worker
  registerServiceWorker();

  // Initialize UI Event Listeners
  initPwaUI();
});

// Register the Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    });
  }
}

// Watch for the PWA install eligibility event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  console.log('[PWA] Eligible for installation. Stashed prompt.');

  // Check if already in standalone display mode
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    console.log('[PWA] Already running in standalone mode.');
    return;
  }

  // Show header install action
  const headerBtn = document.getElementById('pwaHeaderBtn');
  if (headerBtn) {
    headerBtn.style.display = 'flex';
    headerBtn.classList.add('fadeIn');
  }

  // Trigger floating toast notification if not dismissed recently
  const isDismissed = localStorage.getItem(DEFER_TOAST_KEY);
  if (!isDismissed) {
    setTimeout(() => {
      const toast = document.getElementById('pwaInstallToast');
      if (toast) {
        toast.classList.add('active');
      }
    }, 4000); // 4 second premium delay to let user absorb hero first
  }
});

// Watch for successful installation
window.addEventListener('appinstalled', (evt) => {
  console.log('[PWA] DocChain successfully installed!');
  
  // Hide UI buttons/modals
  hideInstallUI();
  
  // Clear the deferred prompt
  deferredPrompt = null;
  
  // Show premium success toast
  if (typeof showToast === 'function') {
    showToast('DocChain is now installed as a desktop application!', 'success');
  }
});

function initPwaUI() {
  // Setup overlay click dismiss behavior
  const modalOverlay = document.getElementById('pwaModalOverlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closePwaModal();
      }
    });
  }
}

// Close/Hide installation interface elements
function hideInstallUI() {
  const headerBtn = document.getElementById('pwaHeaderBtn');
  if (headerBtn) headerBtn.style.display = 'none';

  const toast = document.getElementById('pwaInstallToast');
  if (toast) toast.classList.remove('active');

  const modal = document.getElementById('pwaModalOverlay');
  if (modal) modal.classList.remove('active');
  
  document.body.style.overflow = ''; // Restore background scrolling
  if (window.lenis) window.lenis.start(); // Restore scrolling
}

// Open installation details modal (Premium Holographic Preview)
function openPwaModal() {
  // Hide toast if it was open
  const toast = document.getElementById('pwaInstallToast');
  if (toast) toast.classList.remove('active');

  const modal = document.getElementById('pwaModalOverlay');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
    if (window.lenis) window.lenis.stop(); // Prevent background scroll
  }
}

// Close PWA Modal
function closePwaModal(e) {
  if (e && e.target.closest('.btn-pwa-install')) return; // ignore close if clicked install
  const modal = document.getElementById('pwaModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore background scrolling
    if (window.lenis) window.lenis.start(); // Restore background scroll
  }
}

// Dismiss PWA floating toast banner
function dismissPwaToast() {
  const toast = document.getElementById('pwaInstallToast');
  if (toast) {
    toast.classList.remove('active');
  }
  // Store user preference to not prompt automatically for 7 days
  localStorage.setItem(DEFER_TOAST_KEY, 'true');
  console.log('[PWA] User dismissed install toast. Storing preference.');
}

// Execute installation sequence
async function triggerPwaInstall() {
  if (!deferredPrompt) {
    console.log('[PWA] Install prompt was not deferred or already installed.');
    if (typeof showToast === 'function') {
      showToast('App is already installed or your browser does not support local installation.', 'info');
    }
    closePwaModal();
    return;
  }

  // Show the native browser installation prompt
  deferredPrompt.prompt();

  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`[PWA] User response to the install prompt: ${outcome}`);

  if (outcome === 'accepted') {
    console.log('[PWA] User accepted the install prompt.');
    hideInstallUI();
  } else {
    console.log('[PWA] User dismissed the install prompt.');
    // Keep header button visible, close the modal, allow manual retry
    closePwaModal();
  }

  // Clear prompt since it can only be used once
  deferredPrompt = null;
}
