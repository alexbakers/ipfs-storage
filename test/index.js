import dotenv from "dotenv";
import fs from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { deleteFile, uploadFile } from "../index.js";

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

dotenv.config();

// Helper function to extract CID v1 from common IPFS gateway URLs
const extractCidFromUrl = (url) => {
  try {
    const urlObject = new URL(url);
    const hostnameParts = urlObject.hostname.split(".");
    if (hostnameParts.length > 2 && hostnameParts[1] === "ipfs") {
      // Assumes format like https://{cid}.ipfs.{gateway}/
      return hostnameParts[0];
    }
  } catch (e) {
    console.error(`Error parsing URL to extract CID: ${url}`, e);
  }
  return null;
};

// --- Temp Warning Supression ---
const originalEmitWarning = process.emitWarning;
const suppressAwsV2Warning = (warning, ...args) => {
  if (
    typeof warning === "string" &&
    warning.includes("AWS SDK for JavaScript (v2) is in maintenance mode")
  ) {
    // Suppress the specific warning
    return;
  }
  // Emit other warnings as usual
  originalEmitWarning(warning, ...args);
};
// --------------------------------

let data;
try {
  data = fs.readFileSync(join(__dirname, "..", "banner.png"));
} catch (err) {
  console.log("🆘 ERROR reading banner.png:", err);
  process.exit(1);
}

// Updated check for required environment variables
if (
  !process.env.FILEBASE_KEY ||
  !process.env.PINATA_JWT ||
  !process.env.FLEEK_PAT ||
  !process.env.FLEEK_PROJECT_ID ||
  !process.env.LIGHTHOUSE_TOKEN
) {
  console.log("🆘 ERROR: Ensure necessary ENV variables are set in .env file", {
    FILEBASE_KEY: !!process.env.FILEBASE_KEY,
    PINATA_JWT: !!process.env.PINATA_JWT,
    FLEEK_PAT: !!process.env.FLEEK_PAT,
    FLEEK_PROJECT_ID: !!process.env.FLEEK_PROJECT_ID,
    LIGHTHOUSE_TOKEN: !!process.env.LIGHTHOUSE_TOKEN,
  });
  process.exit(1);
}

console.log("Starting IPFS Storage Tests...");

// --- Filebase Test ---
if (process.env.FILEBASE_KEY) {
  process.emitWarning = suppressAwsV2Warning; // Suppress warning
  try {
    console.log("\n--- Filebase Test ---");
    const filebaseConnect = {
      key: process.env.FILEBASE_KEY,
      secret: process.env.FILEBASE_SECRET,
      bucket: process.env.FILEBASE_BUCKET,
    };
    const fileData = { hash: "test-banner-esm", ext: ".png", buffer: data };

    const url = await uploadFile.filebase(filebaseConnect, fileData);
    console.log("✅ FILEBASE Upload:", url);

    await deleteFile.filebase(filebaseConnect, {
      hash: "test-banner-esm",
      ext: ".png",
    });
    console.log("✅ FILEBASE Delete: OK");
  } catch (err) {
    console.log("🆘 FILEBASE:", err.message || err);
  } finally {
    process.emitWarning = originalEmitWarning; // Restore original warning handler
  }
}

// --- Pinata Test ---
if (process.env.PINATA_JWT) {
  try {
    console.log("\n--- Pinata Test ---");
    const pinataConnect = { jwt: process.env.PINATA_JWT };
    const fileData = { hash: "test-banner-esm", ext: ".png", buffer: data };

    const result = await uploadFile.pinata(pinataConnect, fileData);
    console.log("✅ PINATA Upload:", result.url);

    await deleteFile.pinata(pinataConnect, { providerId: result.providerId });
    console.log("✅ PINATA Delete: OK");
  } catch (err) {
    console.log("🆘 PINATA:", err.message || err);
  }
}

// --- Fleek Test ---
/* // Temporarily disabled
if (process.env.FLEEK_PAT && process.env.FLEEK_PROJECT_ID) {
  try {
    console.log("\n--- Fleek Test ---");
    const fleekConnect = {
      pat: process.env.FLEEK_PAT,
      projectId: process.env.FLEEK_PROJECT_ID,
    };
    const fileData = { hash: "test-banner-esm", ext: ".png", buffer: data };

    const url = await uploadFile.fleek(fleekConnect, fileData);
    console.log("✅ FLEEK Upload:", url);

    const cid = extractCidFromUrl(url);
    if (cid) {
      await deleteFile.fleek(fleekConnect, { cid });
      console.log("✅ FLEEK Delete: OK");
    } else {
      console.log("🆘 FLEEK Delete: Could not extract CID from URL", url);
    }
  } catch (err) {
    console.log("🆘 FLEEK:", err.message || err);
  }
}
*/

// --- Storacha (formerly Web3.storage) Test ---
// NOTE: This test relies on the ambient agent state.
// Run `w3 login <email>` and `w3 space use <did>` before running tests.
try {
  console.log("\n--- Storacha Test (Ambient State) ---");
  const fileData = { hash: "test-banner-esm", ext: ".png", buffer: data };

  const url = await uploadFile.storacha({}, fileData);
  console.log("✅ STORACHA Upload:", url);

  const cid = extractCidFromUrl(url);
  if (cid) {
    await deleteFile.storacha({}, { cid });
    console.log("✅ STORACHA Delete: OK");
  } else {
    console.log("🆘 STORACHA Delete: Could not extract CID from URL", url);
  }
} catch (err) {
  console.log(
    "🆘 STORACHA:",
    err.message || err,
    "(Is agent logged in and space selected?)"
  );
}

// --- Lighthouse Test ---
if (process.env.LIGHTHOUSE_TOKEN) {
  try {
    console.log("\n--- Lighthouse Test ---");
    const lighthouseConnect = { token: process.env.LIGHTHOUSE_TOKEN };
    const fileData = { hash: "test-banner-esm", ext: ".png", buffer: data };

    const url = await uploadFile.lighthouse(lighthouseConnect, fileData);
    console.log("✅ LIGHTHOUSE Upload:", url);

    const cid = extractCidFromUrl(url);
    if (cid) {
      try {
        await deleteFile.lighthouse(lighthouseConnect, { cid });
        console.log(
          "✅ LIGHTHOUSE Delete: OK (Unexpected - function should be unimplemented)"
        );
      } catch (deleteErr) {
        if (
          deleteErr.message &&
          deleteErr.message.includes("not implemented")
        ) {
          // Removed console.log for expected error
          // console.log("✅ LIGHTHOUSE Delete: OK (Function not implemented as expected)");
        } else {
          console.log(
            "🆘 LIGHTHOUSE Delete Error:",
            deleteErr.message || deleteErr
          );
        }
      }
    } else {
      console.log("🆘 LIGHTHOUSE Delete: Could not extract CID from URL", url);
    }
  } catch (err) {
    console.log("🆘 LIGHTHOUSE:", err.message || err);
  }
}

console.log("\nIPFS Storage Tests Complete.");
