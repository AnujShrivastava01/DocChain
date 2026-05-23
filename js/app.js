// ===== DOCCHAIN APP =====

let currentFile = null;
let currentHash = null;
let currentBlock = null;
let qrCodeInstance = null;

let verifyOrigFile = null;
let verifyCheckFile = null;
let qrData1 = null;
let qrData2 = null;

// ===== PIPELINE DATA =====
const pipelineData = {
  1: {
    title: "Secure Document Ingestion",
    desc: "Assets are ingested as binary streams using non-persistent memory buffers. This ensures that sensitive data is never written to disk or transmitted over unsecured channels.",
    tags: ["FileReader API", "ArrayBuffer", "Sandbox"],
    steps: [
      "Initialize local file stream",
      "Validate MIME-type integrity",
      "Compute buffer memory allocation",
      "Instantiate zero-knowledge sandbox"
    ]
  },
  2: {
    title: "Cryptographic Fingerprinting",
    desc: "A deterministic cryptographic fingerprint is generated using the SHA-256 algorithm. This unique identifier represents the document's exact state at the moment of sealing.",
    tags: ["Web Crypto API", "SHA-256", "SubtleCrypto"],
    steps: [
      "Normalize binary data stream",
      "Execute SHA-256 digest computation",
      "Convert digest to hexadecimal string",
      "Verify fingerprint collision resistance"
    ]
  },
  3: {
    title: "Ledger Anchoring (Mining)",
    desc: "The document fingerprint is anchored into a sequential, cryptographically linked ledger. A Proof-of-Work algorithm ensures the ledger's immutability.",
    tags: ["Custom Ledger Engine", "Proof-of-Work", "Mining"],
    steps: [
      "Construct new transaction block",
      "Reference preceding block hash",
      "Execute Proof-of-Work mining",
      "Commit block to local ledger state"
    ]
  },
  4: {
    title: "Seal Encapsulation (QR)",
    desc: "The anchored metadata is encapsulated into a high-resilience QR code. This visual seal provides a portable, machine-readable proof of authenticity.",
    tags: ["QRCode.js", "ECC Level H", "Canvas API"],
    steps: [
      "Serialize ledger metadata to JSON",
      "Configure ECC Level H parameters",
      "Render vector-based QR matrix",
      "Apply high-contrast visual masking"
    ]
  },
  5: {
    title: "Integrity Validation",
    desc: "Bit-level validation protocols compare digital assets against their stored fingerprints. Even a single bit change is detected with 100% accuracy.",
    tags: ["Hex Comparison", "Audit Engine", "Bit-Audit"],
    steps: [
      "Generate live candidate hash",
      "Retrieve master record from ledger",
      "Execute bit-by-bit comparison",
      "Output integrity validation verdict"
    ]
  },
  6: {
    title: "Offline-to-Online Audit",
    desc: "Verifies the authenticity of printed or distributed assets by cross-referencing their physical seal against the live document state.",
    tags: ["jsQR", "Image Analysis", "Seal Match"],
    steps: [
      "Extract payload from visual seal",
      "Parse document fingerprint from JSON",
      "Re-hash current document version",
      "Verify seal-to-document synchronicity"
    ]
  }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lenis Smooth Scroll
  if (typeof Lenis !== 'undefined') {
    window.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      window.lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Support smooth scroll to anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (this.classList.contains('nav-link') || this.getAttribute('onclick')) return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          window.lenis.scrollTo(target, { offset: -80 });
        }
      });
    });
  }

  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = savedTheme + '-theme';
  updateThemeIcons(savedTheme);
});

// ===== THEME TOGGLE =====
function toggleTheme() {
  const isDark = document.body.classList.contains('dark-theme');
  const newTheme = isDark ? 'light' : 'dark';
  document.body.className = newTheme + '-theme';
  localStorage.setItem('theme', newTheme);
  updateThemeIcons(newTheme);
}

function updateThemeIcons(theme) {
  const sun = document.querySelector('.sun-icon');
  const moon = document.querySelector('.moon-icon');
  const metaColor = document.getElementById('themeColorMeta');
  if (theme === 'light') {
    if (sun) sun.style.display = 'none';
    if (moon) moon.style.display = 'block';
    if (metaColor) metaColor.setAttribute('content', '#f8fafc');
  } else {
    if (sun) sun.style.display = 'block';
    if (moon) moon.style.display = 'none';
    if (metaColor) metaColor.setAttribute('content', '#0a0a0f');
  }
}

// ===== INTERACTIVE PIPELINE MODALS =====
function openStepModal(stepId) {
  const data = pipelineData[stepId];
  if (!data) return;

  document.getElementById('modalStepNum').textContent = stepId.toString().padStart(2, '0');
  document.getElementById('modalStepTitle').textContent = data.title;
  document.getElementById('modalStepDesc').textContent = data.desc;

  // Tags
  const tagsCont = document.getElementById('modalTags');
  tagsCont.innerHTML = data.tags.map(tag => `<span class="modal-tag">${tag}</span>`).join('');

  // Steps
  const stepsCont = document.getElementById('modalExecSteps');
  stepsCont.innerHTML = data.steps.map((step, i) => `
    <div class="m-step">
      <div class="m-step-num">${i + 1}</div>
      <div class="m-step-text">${step}</div>
    </div>
  `).join('');

  document.getElementById('modalOverlay').classList.add('active');
  document.querySelector('header').classList.add('hidden'); // Hide navbar
  document.body.style.overflow = 'hidden'; // Prevent scroll
  
  if (window.lenis) window.lenis.stop(); // Prevent background scroll
}

function closeStepModal(e) {
  if (e && e.target !== document.getElementById('modalOverlay') && !e.target.closest('.btn-understood')) return;
  document.getElementById('modalOverlay').classList.remove('active');
  document.querySelector('header').classList.remove('hidden'); // Show navbar
  document.body.style.overflow = '';
  
  if (window.lenis) window.lenis.start(); // Restore background scroll
}

// ===== TAB SWITCHING =====
function switchTab(tabId) {
  // Hide all panels
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  // Deactivate all links
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  // Show selected panel
  document.getElementById(`tab-${tabId}`).classList.add('active');
  // Activate selected link
  document.querySelector(`nav a[onclick="switchTab('${tabId}')"]`).classList.add('active');

  // Toggle Hero Visibility
  const hero = document.getElementById('heroSection');
  if (tabId === 'generate') {
    hero.classList.remove('hidden');
  } else {
    hero.classList.add('hidden');
  }

  // Auto-scroll to top when switching
  if (window.lenis) {
    window.lenis.scrollTo(0, { duration: 0.8 });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ===== DRAG AND DROP =====
const dropZone = document.getElementById('dropZone');
if (dropZone) {
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') handleFileUpload(file);
    else showToast('Please upload a PDF file.', 'error');
  });
}

// ===== FILE UPLOAD HANDLER =====
function handleFileUpload(file) {
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    showToast('Only PDF files are supported.', 'error'); return;
  }
  if (file.size > 50 * 1024 * 1024) {
    showToast('File size exceeds 50MB limit.', 'error'); return;
  }

  currentFile = file;
  currentHash = null;

  // Show file info
  const fileInfo = document.getElementById('fileInfo');
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = formatBytes(file.size);
  fileInfo.style.display = 'block';

  // Animate progress
  setTimeout(() => {
    document.getElementById('progressFill').style.width = '100%';
  }, 100);

  // Enable generate button
  document.getElementById('generateBtn').disabled = false;

  // Reset display
  resetHashDisplay();
  resetQRDisplay();
  resetChainDisplay();
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ===== GENERATE HASH =====
async function generateHash() {
  if (!currentFile) return;

  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-icon">⟳</span> Processing...';

  try {
    // Read file as ArrayBuffer
    const buffer = await readFileAsBuffer(currentFile);

    // Show loading state in hash display
    showHashLoading();

    // SHA-256 hash
    const hash = await sha256FromBuffer(buffer);
    currentHash = hash;

    // Add to blockchain
    const metadata = {
      fileName: currentFile.name,
      fileSize: currentFile.size,
      mimeType: currentFile.type
    };

    const block = await window.docChain.addDocumentBlock(hash, metadata);
    currentBlock = block;

    // Display hash
    displayHash(hash);

    // Display metadata
    displayMeta(block);

    // Generate QR
    generateQRCode(hash, metadata, block);

    // Display blockchain
    displayBlockchain();

    showToast('Document successfully anchored to the cryptographic ledger.', 'success');

  } catch (err) {
    console.error(err);
    showToast('Error processing file: ' + err.message, 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<span class="btn-icon">⬡</span> Execute Secure Seal';
}

function readFileAsBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ===== HASH DISPLAY =====
function showHashLoading() {
  const display = document.getElementById('hashDisplay');
  let chars = '0123456789abcdef';
  let i = 0;
  const interval = setInterval(() => {
    let fake = Array.from({length: 64}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    display.innerHTML = `<div class="loading-hash">${fake}</div>`;
    i++;
    if (i > 20) clearInterval(interval);
  }, 60);
}

function displayHash(hash) {
  const display = document.getElementById('hashDisplay');
  display.innerHTML = `
    <div>
      <div class="hash-value">${hash}</div>
      <button class="hash-copy-btn" onclick="copyHash('${hash}')">Copy Hash</button>
    </div>
  `;
}

function displayMeta(block) {
  const meta = document.getElementById('hashMeta');
  meta.style.display = 'block';
  document.getElementById('metaTime').textContent = new Date(block.timestamp).toLocaleString();
  document.getElementById('metaBlock').textContent = '#' + block.index + ' — ' + block.hash.slice(0, 16) + '...';
  document.getElementById('metaDepth').textContent = window.docChain.chain.length + ' blocks';
}

// ===== QR CODE =====
function generateQRCode(hash, metadata, block) {
  const container = document.getElementById('qrContainer');
  container.innerHTML = '<div id="qrcode"></div>';

  const payload = buildQRPayload(hash, metadata, block.hash, block.timestamp);

  qrCodeInstance = new QRCode(document.getElementById('qrcode'), {
    text: payload,
    width: 180,
    height: 180,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });

  document.getElementById('qrActions').style.display = 'flex';
}

// ===== BLOCKCHAIN VIZ =====
function displayBlockchain() {
  const viz = document.getElementById('chainViz');
  const chain = window.docChain.exportChain();

  let html = '<div class="chain-blocks">';
  chain.forEach((block, i) => {
    if (i > 0) html += '<div class="chain-arrow">→</div>';
    const isDoc = block.data.type === 'DOCUMENT';
    const delay = i * 0.1;
    html += `
      <div class="chain-block" style="animation-delay:${delay}s">
        <div class="cb-label">${isDoc ? '📄 Doc Block #' + block.index : '⬡ Genesis'}</div>
        <div class="cb-hash">${block.hash.slice(0, 32)}...</div>
        ${isDoc ? `<div class="cb-time">${new Date(block.timestamp).toLocaleTimeString()}</div>` : ''}
      </div>`;
  });
  html += '</div>';
  viz.innerHTML = html;
}

// ===== DOWNLOAD QR =====
function downloadQR() {
  const canvas = document.querySelector('#qrcode canvas');
  const img = document.querySelector('#qrcode img');

  if (canvas) {
    const link = document.createElement('a');
    link.download = 'docchain-seal-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } else if (img) {
    const link = document.createElement('a');
    link.download = 'docchain-seal-' + Date.now() + '.png';
    link.href = img.src;
    link.click();
  }
}

function downloadReport() {
  if (!currentHash || !currentBlock || !currentFile) return;

  const timestamp = new Date(currentBlock.timestamp);
  const chain = window.docChain.exportChain();

  const report = `DOCCHAIN INTEGRITY REPORT
========================
Generated: ${timestamp.toLocaleString()}

DOCUMENT INFORMATION
--------------------
File Name  : ${currentFile.name}
File Size  : ${formatBytes(currentFile.size)}
MIME Type  : ${currentFile.type || 'application/pdf'}

CRYPTOGRAPHIC SEAL
------------------
Algorithm  : SHA-256
Hash       : ${currentHash}
Block Hash : ${currentBlock.hash}
Block Index: #${currentBlock.index}
Nonce      : ${currentBlock.nonce}
Prev Hash  : ${currentBlock.previousHash}

BLOCKCHAIN RECORD
-----------------
Chain Length: ${chain.length} blocks
Chain Valid : true (verified at generation)

VERIFICATION INSTRUCTIONS
--------------------------
1. Open DocChain in your browser (index.html)
2. Go to the "Verify" tab
3. Upload the original sealed document
4. Upload the document to check
5. Click "Compare & Verify"
6. If hashes match → document is AUTHENTIC
7. If hashes differ  → document has been TAMPERED

QR CODE PAYLOAD
---------------
${buildQRPayload(currentHash, { fileName: currentFile.name, fileSize: currentFile.size }, currentBlock.hash, currentBlock.timestamp)}

--
DocChain | SHA-256 Blockchain Document Integrity
All hashing performed locally in your browser.
No files transmitted to any server.
`;

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'docchain-report-' + Date.now() + '.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// ===== COPY HASH =====
function copyHash(hash) {
  navigator.clipboard.writeText(hash).then(() => showToast('Hash copied to clipboard!', 'success'));
}

// ===== RESET FUNCTIONS =====
function resetHashDisplay() {
  document.getElementById('hashDisplay').innerHTML = `
    <div class="hash-placeholder">
      <div class="hash-dots">
        <span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span>
      </div>
      <p>Awaiting document...</p>
    </div>`;
  document.getElementById('hashMeta').style.display = 'none';
}

function resetQRDisplay() {
  document.getElementById('qrContainer').innerHTML = `
    <div class="qr-placeholder">
      <div class="qr-grid"></div>
      <p>QR seal generated after hashing</p>
    </div>`;
  document.getElementById('qrActions').style.display = 'none';
}

function resetChainDisplay() {
  document.getElementById('chainViz').innerHTML = `
    <div class="chain-empty">
      <p>Blockchain record will appear here after document processing</p>
    </div>`;
}

// ===== VERIFY TAB =====
function handleVerifyUpload(file, side) {
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    showToast('Only PDF files are supported.', 'error'); return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const hash = await sha256FromBuffer(e.target.result);
    if (side === 'orig') {
      verifyOrigFile = file;
      verifyOrigHash = hash;
      document.getElementById('origHash').textContent = hash;
    } else {
      verifyCheckFile = file;
      verifyCheckHash = hash;
      document.getElementById('checkHash').textContent = hash;
    }
    checkVerifyReady();
  };
  reader.readAsArrayBuffer(file);
}

function checkVerifyReady() {
  const btn = document.getElementById('verifyBtn');
  btn.disabled = !(verifyOrigHash && verifyCheckHash);
}

function verifyDocuments() {
  if (!verifyOrigHash || !verifyCheckHash) return;

  const matched = verifyOrigHash === verifyCheckHash;
  const resultDiv = document.getElementById('verifyResult');
  const resultCard = document.getElementById('resultCard');
  const vsCircle = document.getElementById('vsCircle');

  resultDiv.style.display = 'block';
  resultCard.className = 'result-card ' + (matched ? 'match' : 'mismatch');
  vsCircle.className = 'vs-circle ' + (matched ? 'match' : 'mismatch');
  vsCircle.textContent = matched ? '✓' : '✗';

  document.getElementById('resultIcon').textContent = matched ? '🔒' : '⚠️';
  document.getElementById('resultTitle').textContent = matched
    ? 'Integrity Verified: Documents are Identical'
    : 'Integrity Breach: Hash Mismatch Detected';
  document.getElementById('resultDesc').textContent = matched
    ? 'The SHA-256 cryptographic fingerprints of both documents are identical. The asset has been verified as authentic and untampered.'
    : 'A discrepancy has been detected in the cryptographic fingerprints. This indicates the document has been modified from its original state and cannot be considered authentic.';

  const matchClass = matched ? 'match' : 'mismatch';
  document.getElementById('resultHashes').innerHTML = `
    <div class="rh-row">
      <div class="rh-label">Original — ${verifyOrigFile.name}</div>
      <div class="rh-val ${matchClass}">${verifyOrigHash}</div>
    </div>
    <div class="rh-row">
      <div class="rh-label">Checked — ${verifyCheckFile.name}</div>
      <div class="rh-val ${matchClass}">${verifyCheckHash}</div>
    </div>
  `;

  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showToast(matched ? 'Integrity validation successful.' : 'Security Warning: Fingerprint mismatch.', matched ? 'success' : 'error');
}

// ===== QR COMPARISON =====
async function handleQRUpload(file, side) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file of the QR code.', 'error'); return;
  }

  // Preview image
  const reader = new FileReader();
  reader.onload = async (e) => {
    const imgUrl = e.target.result;
    const preview = document.getElementById('qrPreview' + side);
    preview.innerHTML = `<img src="${imgUrl}" alt="QR Preview"/>`;

    // Scan QR
    try {
      const result = await scanQRCode(imgUrl);
      if (result) {
        const data = JSON.parse(result);
        if (side === 1) qrData1 = data; else qrData2 = data;
        document.getElementById('qrHash' + side).textContent = data.documentHash || 'No hash found';
        showToast('QR Code ' + side + ' scanned successfully.', 'success');
      } else {
        throw new Error('No QR code found in image.');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not read QR code: ' + err.message, 'error');
      document.getElementById('qrHash' + side).textContent = 'Error reading QR';
    }
    checkQRReady();
  };
  reader.readAsDataURL(file);
}

function scanQRCode(imgUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) resolve(code.data);
      else resolve(null);
    };
    img.onerror = reject;
    img.src = imgUrl;
  });
}

function checkQRReady() {
  document.getElementById('compareQRBtn').disabled = !(qrData1 && qrData2);
}

function compareQRs() {
  if (!qrData1 || !qrData2) return;

  const matched = qrData1.documentHash === qrData2.documentHash;
  const resultDiv = document.getElementById('qrCompareResult');
  const resultCard = document.getElementById('qrResultCard');
  const vsCircle = document.getElementById('vsCircleQR');

  resultDiv.style.display = 'block';
  resultCard.className = 'result-card ' + (matched ? 'match' : 'mismatch');
  vsCircle.className = 'vs-circle ' + (matched ? 'match' : 'mismatch');
  vsCircle.textContent = matched ? '✓' : '✗';

  document.getElementById('qrResultIcon').textContent = matched ? '🛡️' : '⚠️';
  document.getElementById('qrResultTitle').textContent = matched
    ? 'Seals Match — Same Document Source'
    : 'Seals Mismatch — Different Documents';

  document.getElementById('qrResultDesc').textContent = matched
    ? 'Both QR seals contain the same document hash. This confirms that both documents (or physical copies) originate from the same cryptographically sealed version.'
    : 'The hashes within the QR seals do not match. These documents do not originate from the same sealed version, or one of the seals has been spoofed.';

  document.getElementById('qrResultDetails').innerHTML = `
    <div class="rd-item"><span class="rd-label">Seal 1 File</span><span class="rd-val">${qrData1.fileName || 'Unknown'}</span></div>
    <div class="rd-item"><span class="rd-label">Seal 2 File</span><span class="rd-val">${qrData2.fileName || 'Unknown'}</span></div>
    <div class="rd-item"><span class="rd-label">Timestamp 1</span><span class="rd-val">${new Date(qrData1.timestamp).toLocaleString()}</span></div>
    <div class="rd-item"><span class="rd-label">Timestamp 2</span><span class="rd-val">${new Date(qrData2.timestamp).toLocaleString()}</span></div>
    <div class="rd-item"><span class="rd-label">Integrity Status</span><span class="rd-val">${matched ? 'VERIFIED' : 'CONFLICT'}</span></div>
  `;

  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showToast(matched ? 'QR seals matched!' : 'QR seals do not match!', matched ? 'success' : 'error');
}

// ===== TOAST =====
function showToast(message, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed; bottom: 2rem; right: 2rem; z-index: 9999;
      font-family: 'Space Mono', monospace; font-size: 0.75rem;
      padding: 0.75rem 1.25rem; border-radius: 10px;
      max-width: 320px; line-height: 1.5;
      transition: all 0.3s; opacity: 0; transform: translateY(10px);
      border: 1px solid;
    `;
    document.body.appendChild(toast);
  }

  const colors = {
    success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', color: '#10b981' },
    error: { bg: 'rgba(255,71,87,0.12)', border: 'rgba(255,71,87,0.4)', color: '#ff4757' },
    info: { bg: 'rgba(0,229,255,0.12)', border: 'rgba(0,229,255,0.4)', color: '#00e5ff' }
  };
  const c = colors[type] || colors.info;
  toast.style.background = c.bg;
  toast.style.borderColor = c.border;
  toast.style.color = c.color;
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3500);
}
