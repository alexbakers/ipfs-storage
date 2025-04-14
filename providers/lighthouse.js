import lighthouse from "@lighthouse-web3/sdk";
import { CID } from "multiformats";

const uploadFile = async function (
  connect = { token: "" },
  file = { hash: "", ext: "", stream: "", buffer: "" }
) {
  if (!connect.token) {
    throw new Error("Lighthouse API token is required.");
  }

  const apiKey = connect.token;
  const buffer = file.buffer || (file.stream ? Buffer.from(file.stream) : null);

  if (!buffer) {
    throw new Error("Lighthouse upload requires file buffer or stream.");
  }

  try {
    const uploadResponse = await lighthouse.uploadBuffer(buffer, apiKey);

    if (!uploadResponse?.data?.Hash) {
      throw new Error(
        "Lighthouse upload failed: Invalid response format or missing Hash."
      );
    }

    const cid = CID.parse(uploadResponse.data.Hash);
    // Note: Lighthouse docs use gateway.lighthouse.storage, using dweb.link for consistency here.
    return `https://${cid.toV1().toString()}.ipfs.dweb.link`;
  } catch (err) {
    console.error(`Lighthouse upload failed:`, err);
    const errorMessage =
      err.response?.data?.message || err.message || "Unknown error";
    throw new Error(`Lighthouse upload failed: ${errorMessage}`);
  }
};

const deleteFile = async function (
  connect = { token: "" }, // Added connect param for consistency
  file = { cid: "" }
) {
  // Implementation requires finding the correct SDK method for unpinning.
  throw new Error(
    "Lighthouse deleteFile not implemented. Requires SDK investigation."
  );
};

export { deleteFile, uploadFile };
