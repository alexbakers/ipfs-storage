/*
import { FleekSdk, PersonalAccessTokenService } from "@fleek-platform/sdk/node";
import { CID } from "multiformats";
import { Readable } from "stream";

const uploadFile = async function (
  connect = { pat: "", projectId: "" },
  file = { hash: "", ext: "", stream: "", buffer: "" }
) {
  if (!connect.pat || !connect.projectId) {
    throw new Error(
      "Fleek Personal Access Token (pat) and Project ID (projectId) are required."
    );
  }

  const accessTokenService = new PersonalAccessTokenService({
    personalAccessToken: connect.pat,
    projectId: connect.projectId,
  });

  const fleekSdk = new FleekSdk({ accessTokenService });

  const fileName = `${file.hash}${file.ext}`;
  let fileStream;

  if (file.buffer) {
    fileStream = Readable.from(file.buffer);
  } else if (file.stream) {
    fileStream =
      file.stream instanceof Readable
        ? file.stream
        : Readable.from(file.stream);
  } else {
    throw new Error("Fleek upload requires file buffer or stream.");
  }

  const fileLikeObject = {
    name: fileName,
    stream: () => fileStream,
  };

  try {
    const result = await fleekSdk
      .storage()
      .uploadFile({ file: fileLikeObject });
    if (!result || !result.pin || !result.pin.cid) {
      throw new Error("Fleek upload failed: Invalid response format.");
    }

    const cid = CID.parse(result.pin.cid);
    return Promise.resolve(`https://${cid.toV1().toString()}.ipfs.cf-ipfs.com`);
  } catch (err) {
    console.error(`Fleek upload failed for ${fileName}:`, err);
    throw new Error(`Fleek upload failed: ${err.message}`);
  }
};

const deleteFile = async function (
  connect = { pat: "", projectId: "" },
  file = { cid: "" }
) {
  if (!connect.pat || !connect.projectId) {
    throw new Error(
      "Fleek Personal Access Token (pat) and Project ID (projectId) are required."
    );
  }
  if (!file.cid) {
    throw new Error("Fleek delete requires the file CID.");
  }

  const accessTokenService = new PersonalAccessTokenService({
    personalAccessToken: connect.pat,
    projectId: connect.projectId,
  });

  const fleekSdk = new FleekSdk({ accessTokenService });

  try {
    await fleekSdk.storage().delete({ cid: file.cid });
    return true;
  } catch (err) {
    console.error(`Fleek delete failed for CID ${file.cid}:`, err);
    throw new Error(`Fleek delete failed: ${err.message}`);
  }
};

export { uploadFile, deleteFile };
*/

// Provider temporarily disabled due to ESM compatibility issues with @fleek-platform/sdk
const disabledError = () => {
  throw new Error(
    "Fleek provider temporarily disabled due to SDK compatibility issues."
  );
};

export const uploadFile = async () => disabledError();
export const deleteFile = async () => disabledError();
