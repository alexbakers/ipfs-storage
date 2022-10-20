const { Readable } = require("stream");
const web3 = require("web3.storage");

module.exports = {
  uploadFile: async function (
    connect = { token: "" },
    file = { hash: "", ext: "", stream: "", buffer: "" }
  ) {
    const storage = new web3.Web3Storage({ token: connect.token });
    if (file.buffer) {
      file.stream = () => Readable.from(file.buffer);
    } else if (file.stream) {
      file.stream = () => file.stream;
    }
    const cid = await storage.put([file], {
      name: `${file.hash}${file.ext}`,
      wrapWithDirectory: false,
    });
    return Promise.resolve(`https://${cid}.ipfs.w3s.link`);
  },
  deleteFile: async function () {
    return Promise.resolve();
  },
};
