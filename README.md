# IPFS STORAGE API PROVIDERS

<img alt="IPFS STORAGE API PROVIDERS" src="https://raw.githubusercontent.com/alexbakers/ipfs-storage/main/banner.png" />

This library provides a unified interface for uploading files to and deleting files from various IPFS storage providers.

**Supported Providers:**

- [x] Filebase [<a href="https://filebase.com">filebase.com</a>]
- [x] Storacha [<a href="https://storacha.network">storacha.network</a>] (formerly web3.storage)
- [x] Pinata [<a href="https://pinata.cloud">pinata.cloud</a>]
- [x] Lighthouse [<a href="https://lighthouse.storage">lighthouse.storage</a>]
- [ ] **Fleek [<a href="https://fleek.xyz">fleek.xyz</a>] (Temporarily Disabled)**

## Prerequisites

- **Node.js:** Version 18 or higher.
- **Credentials:** You will need API credentials for each service you intend to use. Store these securely, for example, using environment variables (see examples).
- **Storacha Setup:** Storacha requires a one-time setup using their CLI (`w3`) to log in your agent (`w3 login <email>`) and create/select a space (`w3 space create`, `w3 space use`). This library assumes the agent is already configured in the environment where the code runs.

## Installation

```bash
npm install ipfs-storage
# or
yarn add ipfs-storage
```

## Breaking Changes (v1.x -> v2.x)

- **Pinata:** `uploadFile.pinata` now returns an object `{ url: string, providerId: string }`. The `providerId` is required for `deleteFile.pinata`.
- **Fleek:** Authentication changed (requires PAT/ProjectID), but the provider is **temporarily disabled** due to module resolution issues with `@fleek-platform/sdk` in ESM projects.
- **Storacha (web3.storage):** Authentication requires a pre-configured agent (via `w3 login`) instead of an API token.
- **Dependencies:** Underlying SDKs for all providers have been updated.

## Examples

First, set up your environment variables (e.g., in a `.env` file and load with `dotenv`):

```.env
# Filebase
FILEBASE_KEY=YOUR_FILEBASE_ACCESS_KEY
FILEBASE_SECRET=YOUR_FILEBASE_SECRET_KEY
FILEBASE_BUCKET=your-filebase-bucket-name

# Pinata
PINATA_JWT=YOUR_PINATA_JWT

# Storacha (No key needed here, login via w3 cli)
```

Then, use the library in your code:

```javascript
const fs = require("fs");
const { join } = require("path");
const { uploadFile, deleteFile } = require("ipfs-storage");
const { create } = require('@web3-storage/w3up-client'); // Needed for pre-configured client example
require("dotenv").config(); // Load .env variables

// Helper function to extract CID v1 from common IPFS gateway URLs
const extractCidFromUrl = (url) => {
  try {
    const urlObject = new URL(url);
    const hostnameParts = urlObject.hostname.split(".");
    // Assuming format like https://{cid}.ipfs.{gateway}/
    if (hostnameParts.length > 2 && hostnameParts[1] === "ipfs") {
      return hostnameParts[0];
    }
  } catch (e) { /* ignore */ }
  return null;
};

// Example usage (run within an async function or use .then())
async function runExamples() {
  let fileBuffer;
  try {
    fileBuffer = fs.readFileSync(join(__dirname, "banner.png"));
  } catch (err) {
    console.error("Error reading file:", err);
    return;
  }

  const fileData = { hash: "banner-test", ext: ".png", buffer: fileBuffer };

  // --- Filebase Example ---
  if (process.env.FILEBASE_KEY) {
    try {
      const filebaseConnect = {
        key: process.env.FILEBASE_KEY,
        secret: process.env.FILEBASE_SECRET,
        bucket: process.env.FILEBASE_BUCKET,
      };
      const url = await uploadFile.filebase(filebaseConnect, fileData);
      console.log("✅ FILEBASE Upload:", url);

      await deleteFile.filebase(filebaseConnect, { hash: fileData.hash, ext: fileData.ext });
      console.log("✅ FILEBASE Delete: OK");
    } catch (err) {
      console.error("🆘 FILEBASE:", err.message || err);
    }
  }

  // --- Pinata Example ---
  if (process.env.PINATA_JWT) {
    try {
      const pinataConnect = { jwt: process.env.PINATA_JWT };
      // Pinata upload now returns { url, providerId }
      const result = await uploadFile.pinata(pinataConnect, fileData);
      console.log("✅ PINATA Upload:", result.url);

      // Pinata delete now requires the providerId
      await deleteFile.pinata(pinataConnect, { providerId: result.providerId });
      console.log("✅ PINATA Delete: OK");
    } catch (err) {
      console.error("🆘 PINATA:", err.message || err);
    }
  }

  // --- Fleek Example ---
  /* // Temporarily disabled due to SDK compatibility issues
  if (process.env.FLEEK_PAT && process.env.FLEEK_PROJECT_ID) {
  // ... (Fleek example code commented out) ...
  }
  */

  // --- Storacha Example (formerly Web3.storage) ---
  console.log("\n--- Storacha ---");

  // Storacha requires a one-time EXTERNAL setup using `w3 login <email>`
  // and `w3 space use <did>` before this library can use the ambient state.
  // The library CANNOT perform the interactive email login.
  console.log("Attempting Storacha using ambient agent state...");
  try {
    // If agent is logged in and space is set externally, this will work:
    const url = await uploadFile.storacha({}, fileData);
    console.log("✅ STORACHA Upload (Ambient):", url);
    const cid = extractCidFromUrl(url);
    if (cid) {
      await deleteFile.storacha({}, { cid });
      console.log("✅ STORACHA Delete (Ambient): OK");
    } else {
      console.error("🆘 STORACHA Delete (Ambient): Could not extract CID from URL", url);
    }
  } catch (err) {
    console.warn("🆘 STORACHA (Ambient State):", err.message || err, "(FAILED: Ensure agent is logged in and space is selected externally via w3 commands)");
  }

  // Option for applications: Pass a pre-configured client & space DID
  // (Application must handle client creation, login flow, and space selection itself)
  console.log("\nExample: Using Storacha with a pre-configured client (if available)... ");
  let preConfiguredClient;
  let spaceDidToUse; // Replace with your actual Space DID
  try {
    // Example: Initialize client (in a real app, handle login flow properly)
    preConfiguredClient = await create();
    const accounts = await preConfiguredClient.accounts();
    if (!accounts || Object.keys(accounts).length === 0) {
      console.warn("  -> Storacha Pre-config: Agent not logged in. Skipping pre-configured client test.");
      // In a real app: initiate login -> await client.login('email'); ... wait for link click ...
    } else {
      const spaces = await preConfiguredClient.spaces();
      if (!spaces || spaces.length === 0) {
         console.warn("  -> Storacha Pre-config: Agent has no spaces. Skipping pre-configured client test.");
      } else {
         spaceDidToUse = spaces[0].did(); // Using the first space for the example
         console.log(`  -> Storacha Pre-config: Using space DID: ${spaceDidToUse}`);

         const storachaConnect = { client: preConfiguredClient, spaceDid: spaceDidToUse };
         const url = await uploadFile.storacha(storachaConnect, fileData);
         console.log("✅ STORACHA Upload (Pre-config):", url);
         const cid = extractCidFromUrl(url);
         if (cid) {
           await deleteFile.storacha(storachaConnect, { cid });
           console.log("✅ STORACHA Delete (Pre-config): OK");
         } else {
           console.error("🆘 STORACHA Delete (Pre-config): Could not extract CID from URL", url);
         }
      }
    }
  } catch (err) {
     console.error("🆘 STORACHA (Pre-configured Client Example):", err.message || err);
  }

  // --- Lighthouse Example ---
  if (process.env.LIGHTHOUSE_TOKEN) {
    try {
      const lighthouseConnect = { token: process.env.LIGHTHOUSE_TOKEN };
      const url = await uploadFile.lighthouse(lighthouseConnect, fileData);
      console.log("✅ LIGHTHOUSE Upload:", url);

      // Note: deleteFile.lighthouse is currently not implemented (pending SDK docs)
      const cid = extractCidFromUrl(url);
      if (cid) {
        try {
          await deleteFile.lighthouse(lighthouseConnect, { cid });
          console.log("✅ LIGHTHOUSE Delete: OK (Unimplemented function did not throw?)");
        } catch (deleteErr) {
          if (deleteErr.message && deleteErr.message.includes("not implemented")) {
            console.log("✅ LIGHTHOUSE Delete: OK (Not implemented as expected)");
          } else {
            console.error("🆘 LIGHTHOUSE Delete Error:", deleteErr.message || deleteErr);
          }
        }
      } else {
        console.error("🆘 LIGHTHOUSE Delete: Could not extract CID from URL", url);
      }
    } catch (err) {
      console.error("🆘 LIGHTHOUSE:", err.message || err);
    }
  }
}

runExamples();

---

`(c)` Alex Baker
```
