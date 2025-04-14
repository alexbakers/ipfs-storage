import { create } from "@web3-storage/w3up-client";
import { StoreConf } from "@web3-storage/w3up-client/stores/conf";
import { Blob } from "buffer";
import { CID } from "multiformats";

// --- Storacha Provider ---
// IMPORTANT:
// This provider works in two modes:
// 1. Ambient State (Default): Assumes the execution environment has a w3up agent
//    that has ALREADY been authorized via email (`w3 login <email>`) and has
//    a default space selected (`w3 space use <did>`). The library CANNOT handle
//    the initial interactive email login required by Storacha.
// 2. Pre-configured Client: Accepts an optional authorized `client` instance and
//    an optional `spaceDid` via the `connect` object. This allows applications
//    (like Strapi plugins) to manage the Storacha client lifecycle externally.

const ERR_MSG_LOGIN =
  "Storacha agent not logged in or initialized. Run 'w3 login <email>' externally first, or pass a pre-configured client.";
const ERR_MSG_SPACE =
  "No Storacha space DID provided in 'connect.spaceDid' and no default space set for the agent. Run 'w3 space use <did>' externally or provide 'spaceDid'.";

const uploadFile = async function (
  connect = { client: undefined, spaceDid: undefined },
  file = { hash: "", ext: "", stream: "", buffer: "" }
) {
  let client = connect.client;
  const managedClient = !client;

  try {
    // --- Client Initialization and Auth Check ---
    if (!client) {
      const store = new StoreConf({ profile: "w3cli" });
      client = await create({ store });
    }
    if (managedClient) {
      const accounts = await client.accounts();
      if (!accounts || Object.keys(accounts).length === 0) {
        throw new Error(ERR_MSG_LOGIN);
      }
    }

    // --- Space Selection ---
    if (connect.spaceDid) {
      await client.setCurrentSpace(connect.spaceDid);
    } else {
      const currentSpace = await client.currentSpace();
      if (!currentSpace) {
        throw new Error(ERR_MSG_SPACE);
      }
    }

    // --- Prepare File Blob ---
    let fileContent = file.buffer;
    if (!fileContent) {
      if (file.stream) {
        const chunks = [];
        for await (const chunk of file.stream) {
          chunks.push(chunk);
        }
        fileContent = Buffer.concat(chunks);
      } else {
        throw new Error("Storacha upload requires file buffer or stream.");
      }
    }
    const blob = new Blob([fileContent]);

    // --- Upload ---
    const rootCid = await client.uploadFile(blob);
    if (!rootCid) {
      throw new Error("Storacha upload failed: No CID returned.");
    }
    return Promise.resolve(`https://${rootCid.toString()}.ipfs.w3s.link`);
  } catch (err) {
    // --- Error Handling ---
    const baseMessage = `Storacha upload failed: ${err.message}`;
    // Add specific guidance for common setup issues
    if (
      err.message?.includes("missing capability") ||
      err.message?.includes("space not found") ||
      err.message?.includes("space mismatch")
    ) {
      console.error(`${baseMessage}. ${ERR_MSG_SPACE}`);
      throw new Error(`${baseMessage}. ${ERR_MSG_SPACE}`);
    } else if (
      err.message?.includes("Agent not authorized") ||
      err.message?.includes("not logged in")
    ) {
      console.error(`${baseMessage}. ${ERR_MSG_LOGIN}`);
      throw new Error(`${baseMessage}. ${ERR_MSG_LOGIN}`);
    } else {
      console.error(baseMessage, err); // Log full error for other cases
      throw new Error(baseMessage);
    }
  }
};

const deleteFile = async function (
  connect = { client: undefined, spaceDid: undefined },
  file = { cid: "" }
) {
  let client = connect.client;
  const managedClient = !client;

  if (!file.cid) {
    throw new Error("Storacha delete requires the file CID.");
  }

  try {
    // --- Client Initialization and Auth Check ---
    if (!client) {
      const store = new StoreConf({ profile: "w3cli" });
      client = await create({ store });
    }
    if (managedClient) {
      const accounts = await client.accounts();
      if (!accounts || Object.keys(accounts).length === 0) {
        throw new Error(ERR_MSG_LOGIN);
      }
    }

    // --- Space Selection ---
    if (connect.spaceDid) {
      await client.setCurrentSpace(connect.spaceDid);
    } else {
      const currentSpace = await client.currentSpace();
      if (!currentSpace) {
        throw new Error(ERR_MSG_SPACE);
      }
    }

    // --- Delete ---
    const cidToDelete = CID.parse(file.cid);
    await client.remove(cidToDelete, { shards: true });
    return true;
  } catch (err) {
    // --- Error Handling ---
    const baseMessage = `Storacha delete failed for CID ${file.cid}: ${err.message}`;
    if (
      err.message?.includes("missing capability") ||
      err.message?.includes("space not found") ||
      err.message?.includes("space mismatch")
    ) {
      console.error(`${baseMessage}. ${ERR_MSG_SPACE}`);
      throw new Error(`${baseMessage}. ${ERR_MSG_SPACE}`);
    } else if (
      err.message?.includes("Agent not authorized") ||
      err.message?.includes("not logged in")
    ) {
      console.error(`${baseMessage}. ${ERR_MSG_LOGIN}`);
      throw new Error(`${baseMessage}. ${ERR_MSG_LOGIN}`);
    } else {
      console.error(baseMessage, err);
      throw new Error(baseMessage);
    }
  }
};

export { deleteFile, uploadFile };
