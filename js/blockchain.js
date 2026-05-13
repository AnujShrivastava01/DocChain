// ===== DOCCHAIN BLOCKCHAIN ENGINE =====
// Implements a lightweight in-browser blockchain for document integrity

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = '';
    this.nonce = 0;
  }

  async calculateHash() {
    const blockString = JSON.stringify({
      index: this.index,
      timestamp: this.timestamp,
      data: this.data,
      previousHash: this.previousHash,
      nonce: this.nonce
    });
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(blockString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async mineBlock(difficulty = 2) {
    const prefix = '0'.repeat(difficulty);
    this.hash = await this.calculateHash();
    while (!this.hash.startsWith(prefix)) {
      this.nonce++;
      this.hash = await this.calculateHash();
      if (this.nonce > 10000) break; // safety cap for browser
    }
    return this.hash;
  }
}

class DocChainBlockchain {
  constructor() {
    this.chain = [];
    this.difficulty = 2;
    this._init();
  }

  async _init() {
    const genesis = await this._createGenesisBlock();
    this.chain.push(genesis);
  }

  async _createGenesisBlock() {
    const block = new Block(
      0,
      new Date().toISOString(),
      { type: 'GENESIS', message: 'DocChain Genesis Block' },
      '0000000000000000000000000000000000000000000000000000000000000000'
    );
    block.hash = await block.calculateHash();
    return block;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async addDocumentBlock(documentHash, metadata) {
    // Wait for chain to be initialised
    while (this.chain.length === 0) {
      await new Promise(r => setTimeout(r, 50));
    }
    const latest = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      {
        type: 'DOCUMENT',
        documentHash,
        fileName: metadata.fileName,
        fileSize: metadata.fileSize,
        mimeType: metadata.mimeType || 'application/pdf'
      },
      latest.hash
    );
    await newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  async isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      const recalculated = await current.calculateHash();
      if (current.hash !== recalculated) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }

  exportChain() {
    return JSON.parse(JSON.stringify(this.chain));
  }
}

// ===== SHA-256 for raw ArrayBuffer (document hashing) =====
async function sha256FromBuffer(buffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== QR payload builder =====
function buildQRPayload(hash, metadata, blockHash, timestamp) {
  return JSON.stringify({
    app: 'DocChain',
    version: '1.0',
    algorithm: 'SHA-256',
    documentHash: hash,
    fileName: metadata.fileName,
    fileSize: metadata.fileSize,
    blockHash: blockHash,
    timestamp: timestamp,
    integrity: 'SEALED'
  });
}

// Expose to global
window.DocChainBlockchain = DocChainBlockchain;
window.sha256FromBuffer = sha256FromBuffer;
window.buildQRPayload = buildQRPayload;

// Global chain instance
window.docChain = new DocChainBlockchain();
