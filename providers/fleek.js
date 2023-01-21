const AWS = require("aws-sdk");
const CID = require("multiformats/cid").CID;

module.exports = {
  uploadFile: async function (
    connect = { key: "", secret: "", bucket: "" },
    file = { hash: "", ext: "", stream: "", buffer: "" }
  ) {
    const s3 = new AWS.S3({
      apiVersion: "2006-03-01",
      accessKeyId: connect.key,
      secretAccessKey: connect.secret,
      endpoint: "https://storageapi2.fleek.co",
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
        const cid = CID.parse(headers["x-fleek-ipfs-hash"]);
        return resolve(`https://${cid.toV1().toString()}.ipfs.cf-ipfs.com`);
      });
      request.send();
    });
  },
  deleteFile: async function (
    connect = { key: "", secret: "", bucket: "" },
    file = { hash: "", ext: "" }
  ) {
    const s3 = new AWS.S3({
      apiVersion: "2006-03-01",
      accessKeyId: connect.key,
      secretAccessKey: connect.secret,
      endpoint: "https://storageapi2.fleek.co",
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
  },
};
