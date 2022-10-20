const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  uploadFile: async function (
    connect = { jwt: "" },
    file = { hash: "", ext: "", stream: "", buffer: "" }
  ) {
    const data = new FormData();
    data.append("file", file.stream || file.buffer, {
      filename: `${file.hash}${file.ext}`,
    });
    data.append("pinataOptions", '{"cidVersion": 1}');

    const config = {
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
      headers: {
        Authorization: `Bearer ${connect.jwt}`,
        ...data.getHeaders(),
      },
      data: data,
    };

    const res = await axios(config);

    return Promise.resolve(`https://${res.data.IpfsHash}.ipfs.dweb.link`);
  },
  deleteFile: async function (connect = { jwt: "" }, file = { url: "" }) {
    const config = {
      method: "delete",
      url: `https://api.pinata.cloud/pinning/unpin/${file.url.substring(
        file.url.indexOf("/") + 2,
        file.url.indexOf(".")
      )}`,
      headers: {
        Authorization: `Bearer ${connect.jwt}`,
      },
    };

    await axios(config);

    return Promise.resolve();
  },
};
