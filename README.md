# DocChain — Blockchain Document Integrity

A fully client-side web application that uses **SHA-256 cryptographic hashing** and a **lightweight blockchain** to seal, protect, and verify official PDF documents.

---

## Features

- **SHA-256 Hashing** — Every PDF is hashed using the Web Crypto API (SHA-256). Even a 1-character change produces a completely different hash.
- **Blockchain Sealing** — Each document hash is added to an in-browser blockchain with proof-of-work mining.
- **QR Code Generation** — A tamper-evident QR code is generated encoding the full hash + blockchain payload.
- **Document Verification** — Upload two PDFs and compare their hashes instantly. If they match, the document is authentic.
- **Full Report Download** — Download a complete integrity report with hash, block data, and verification instructions.
- **100% Local** — No files leave your browser. No server. No uploads. Pure client-side.

---

## How to Use

### 1. Open the App
Simply open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
No installation required. No internet needed after first load (fonts load from Google).

### 2. Generate a Hash & Seal (Generate Tab)
1. Drop or browse for your PDF file
2. Click **"Generate Hash & Seal"**
3. The app computes SHA-256 of the entire document
4. A blockchain block is mined and recorded
5. A QR code is generated containing the hash payload
6. Download the QR image and/or the full integrity report

**Attach the QR code to your official document.** Anyone can then scan it or use the Verify tab to check authenticity.

### 3. Verify a Document (Verify Tab)
1. Upload the **Original** sealed PDF
2. Upload the **Document to Check** (the copy/suspect version)
3. Click **"Compare & Verify"**
4. ✅ **Green = Authentic** — Hashes match, document is untampered
5. ⚠️ **Red = Tampered** — Hashes differ, document has been modified

---

## Technical Details

| Property       | Value                        |
|----------------|------------------------------|
| Hash Algorithm | SHA-256 (Web Crypto API)     |
| QR Library     | qrcodejs 1.0.0               |
| Blockchain     | Custom in-browser PoW chain  |
| Mining Diff.   | 2 leading zeros              |
| File Support   | PDF (up to 50 MB)            |
| Processing     | 100% client-side             |

---

## Security Notes

- SHA-256 is a one-way cryptographic function — it is computationally infeasible to reverse or forge.
- Any modification to a PDF (metadata, text, images, whitespace) will change the hash completely.
- The QR payload includes the document hash, block hash, timestamp, and file metadata.
- For highest security, store the original hash separately from the document.

---

## File Structure

```
docchain/
├── index.html          — Main application
├── css/
│   └── style.css       — All styles
├── js/
│   ├── blockchain.js   — Blockchain + SHA-256 engine
│   └── app.js          — UI logic
└── README.md
```

---

*DocChain — Built for tamper-proof official document verification.*
