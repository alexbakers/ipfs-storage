const axios = require("axios");
const FormData = require("form-data");
const CID = require("multiformats/cid").CID;

module.exports = {
  uploadFile: async function (
    connect = { token: "" },
    file = { hash: "", ext: "", stream: "", buffer: "" }
  ) {
    const data = new FormData();
    data.append("file", file.stream || file.buffer, {
      filename: `${file.hash}${file.ext}`,
    });

    const config = {
      method: "post",
      url: "https://node.lighthouse.storage/api/v0/add",
      headers: {
        Authorization: `Bearer ${connect.token}`,
        ...data.getHeaders(),
      },
      data: data,
    };

    const res = await axios(config);

    const cid = CID.parse(res.data["Hash"]);
    return Promise.resolve(`https://${cid.toV1().toString()}.ipfs.dweb.link`);
  },
  deleteFile: async function () {
    return Promise.resolve();
  },
};
