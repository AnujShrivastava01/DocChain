# Security & Privacy Protocol

DocChain is engineered with a **Zero-Knowledge Architecture**. This means that your sensitive documents never leave your local environment, and no trace of your data is persisted on any external server or local disk during the cryptographic process.

## 🛡️ The "Local-Only" Mechanism

### 1. In-Memory Processing (RAM)
When a document is uploaded for sealing or verification, DocChain utilizes the **FileReader API**. 
- The file is read as an `ArrayBuffer` directly into your computer's **RAM**.
- Data exists only in volatile memory.
- It is never written to a temporary directory or cache on your hard drive.

### 2. Native Web Crypto Hashing
Hashing is performed using the browser's native **SubtleCrypto** interface (Web Crypto API).
- **Algorithm**: SHA-256 (Industrial Standard).
- **Process**: The binary stream in RAM is fed through the hashing engine to generate a 64-character hexadecimal fingerprint.
- This ensures that the computational work is done entirely within your browser's sandboxed environment.

### 3. Real-Time Bit-Level Validation
Verification does not involve comparing files directly. Instead, it compares fingerprints:
- Both the "Original" and "Candidate" files are hashed in memory.
- The resulting SHA-256 strings are compared.
- Even a single bit of difference in a 50MB file results in a completely different hash (the "Avalanche Effect"), allowing for 100% accurate tamper detection without storing the file contents.

### 4. Canvas-Based Visual Seals
QR Codes are generated using **HTML5 Canvas** rendering:
- The metadata (Hash, Timestamp, Block ID) is serialized into a JSON string.
- The `qrcode.js` library draws the matrix pixels directly onto a graphic canvas.
- No image files are generated or stored on the server side.

### 5. Volatile Ledger State
The blockchain ledger (`DocChainBlockchain`) is maintained as an in-memory object:
- All transaction blocks exist only for the duration of your browser session.
- Once the tab is closed or the page is refreshed, all memory buffers and the ledger state are permanently wiped.

---

## 🔒 Summary of Privacy Guarantees

| Action | Data Location | Persistence |
| :--- | :--- | :--- |
| **Document Upload** | Browser RAM | None |
| **SHA-256 Hashing** | Browser CPU/Sandbox | None |
| **QR Generation** | HTML5 Canvas | None |
| **Verification** | In-Memory Comparison | None |
| **Cloud/Server Sync** | **Never Occurs** | **N/A** |

> [!IMPORTANT]
> Because DocChain is a client-side application, you can even use it **offline** once the page is loaded. This provides absolute assurance that your data is never transmitted over the network.
