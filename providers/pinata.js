import { Blob } from "buffer";
import { CID } from "multiformats";
import { PinataSDK } from "pinata";

const uploadFile = async function (
  connect = { jwt: "" },
  file = { hash: "", ext: "", stream: "", buffer: "" }
) {
  if (!connect.jwt) {
    throw new Error("Pinata JWT is required.");
  }

  const pinata = new PinataSDK({ pinataJwt: connect.jwt });

  const fileName = `${file.hash}${file.ext}`;
  let fileContent = file.buffer;

  // The SDK expects a File object, created from Blob/Buffer.
  // Stream handling might be complex, relying on buffer for now.
  if (!fileContent) {
    if (file.stream) {
      console.warn(
        "Pinata provider currently prefers buffer input over streams. Attempting to read stream..."
      );
      // Consuming stream to buffer here can be memory intensive for large files.
      // Consider alternatives if large stream uploads are common.
      const chunks = [];
      for await (const chunk of file.stream) {
        chunks.push(chunk);
      }
      fileContent = Buffer.concat(chunks);
    } else {
      throw new Error("Pinata upload requires file buffer or stream.");
    }
  }

  const blob = new Blob([fileContent]);
  const fileObject = new File([blob], fileName); // Requires Node >= 18 (experimental) or >= 20

  try {
    const result = await pinata.upload.public.file(fileObject);
    if (!result || !result.cid || !result.id) {
      throw new Error(
        "Pinata upload failed: Invalid response format or missing CID/ID."
      );
    }

    const cid = CID.parse(result.cid);
    const ipfsUrl = `https://${cid.toV1().toString()}.ipfs.dweb.link`;

    // Return URL and Pinata ID (needed for deletion)
    return { url: ipfsUrl, providerId: result.id };
  } catch (err) {
    console.error(`Pinata upload failed for ${fileName}:`, err);
    // Attempt to parse Pinata API error response
    const errorMessage =
      err.response?.data?.error || err.message || "Unknown error";
    throw new Error(`Pinata upload failed: ${errorMessage}`);
  }
};

const deleteFile = async function (
  connect = { jwt: "" },
  file = { providerId: "" }
) {
  if (!connect.jwt) {
    throw new Error("Pinata JWT is required.");
  }
  if (!file.providerId) {
    throw new Error("Pinata delete requires the Pinata file ID (providerId).");
  }

  const pinata = new PinataSDK({ pinataJwt: connect.jwt });

  try {
    // Delete expects an array of Pinata IDs
    await pinata.files.public.delete([file.providerId]);
    return true;
  } catch (err) {
    console.error(`Pinata delete failed for ID ${file.providerId}:`, err);
    const errorMessage =
      err.response?.data?.error || err.message || "Unknown error";
    throw new Error(`Pinata delete failed: ${errorMessage}`);
  }
};

export { deleteFile, uploadFile };
