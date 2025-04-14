import AWS from "aws-sdk";
import { CID } from "multiformats";

const uploadFile = async function (
  connect = { key: "", secret: "", bucket: "" },
  file = { hash: "", ext: "", stream: "", buffer: "" }
) {
  if (!connect.key || !connect.secret || !connect.bucket) {
    throw new Error("Filebase requires key, secret, and bucket.");
  }

  const s3 = new AWS.S3({
    accessKeyId: connect.key,
    secretAccessKey: connect.secret,
    endpoint: "https://s3.filebase.com",
    region: "us-east-1",
    s3ForcePathStyle: true,
  });

  const key = `${file.hash}${file.ext}`;
  const body = file.stream || (file.buffer ? Buffer.from(file.buffer) : null);
  if (!body) {
    throw new Error("Filebase upload requires file buffer or stream.");
  }

  const params = {
    Bucket: connect.bucket,
    Key: key,
    Body: body,
    Metadata: file.ext === ".car" ? { import: "car" } : {},
  };

  return new Promise((resolve, reject) => {
    const request = s3.putObject(params);
    request.on("httpHeaders", async (statusCode, headers) => {
      if (statusCode !== 200) {
        // Attempt to get error details from the response body if available
        const errorBody =
          request.response?.httpResponse?.body?.toString() || "";
        reject(
          new Error(
            `Filebase upload failed for key ${key}. Status: ${statusCode}. ${errorBody}`
          )
        );
        return;
      }
      try {
        const cid = CID.parse(headers["x-amz-meta-cid"]);
        resolve(`https://${cid.toV1().toString()}.ipfs.cf-ipfs.com`);
      } catch (parseErr) {
        reject(
          new Error(
            `Filebase upload succeeded but failed to parse CID: ${parseErr.message}`
          )
        );
      }
    });
    // Handle stream errors during upload
    request.on("error", (err) => {
      reject(
        new Error(`Filebase upload stream error for key ${key}: ${err.message}`)
      );
    });
    request.send();
  });
};

const deleteFile = async function (
  connect = { key: "", secret: "", bucket: "" },
  file = { hash: "", ext: "" }
) {
  if (!connect.key || !connect.secret || !connect.bucket) {
    throw new Error("Filebase requires key, secret, and bucket.");
  }

  const s3 = new AWS.S3({
    accessKeyId: connect.key,
    secretAccessKey: connect.secret,
    endpoint: "https://s3.filebase.com",
    region: "us-east-1",
    s3ForcePathStyle: true,
  });

  const key = `${file.hash}${file.ext}`;
  const params = {
    Bucket: connect.bucket,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (err) {
    console.error(`Filebase delete failed for key ${key}:`, err);
    throw new Error(`Filebase delete failed for key ${key}: ${err.message}`);
  }
};

export { deleteFile, uploadFile };
