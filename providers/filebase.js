import AWS from "aws-sdk";
import CID from "cids";

export async function uploadFile(
  connect = { key: "", secret: "", bucket: "" },
  file = { hash: "", ext: "", stream: "", buffer: "" }
) {
  const s3 = new AWS.S3({
    accessKeyId: connect.key,
    secretAccessKey: connect.secret,
    endpoint: "https://s3.filebase.com",
    region: "us-east-1",
    s3ForcePathStyle: true,
  });
  const Metadata = file.ext === ".car" ? { import: "car" } : {};
  const params = {
    Bucket: connect.bucket,
    Key: `${file.hash}${file.ext}`,
    Body: file.stream || Buffer.from(file.buffer, "binary"),
    Metadata,
  };

  return new Promise((resolve, reject) => {
    const request = s3.putObject(params);
    request.on("httpHeaders", (statusCode, headers) => {
      if (statusCode !== 200) reject("ERROR");
      const cid = new CID(headers["x-amz-meta-cid"]).toV1().toString("base32");
      return resolve(`https://${cid}.ipfs.dweb.link`);
    });
    request.send();
  });
}

export async function deleteFile(
  connect = { key: "", secret: "", bucket: "" },
  file = { hash: "", ext: "" }
) {
  const s3 = new AWS.S3({
    accessKeyId: connect.key,
    secretAccessKey: connect.secret,
    endpoint: "https://s3.filebase.com",
    region: "us-east-1",
    s3ForcePathStyle: true,
  });
  const params = {
    Bucket: connect.bucket,
    Key: `${file.hash}${file.ext}`,
  };

  return new Promise((resolve, reject) => {
    const request = s3.deleteObject(params);
    request.on("httpHeaders", () => {
      return resolve();
    });
    request.send();
  });
}
