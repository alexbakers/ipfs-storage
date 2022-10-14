const { uploadFile: filebase } = require("../providers/filebase.js");
const { uploadFile: moralis } = require("../providers/moralis.js");
const { uploadFile: pinata } = require("../providers/pinata.js");
const { uploadFile: web3 } = require("../providers/web3.js");

module.exports = { filebase, moralis, pinata, web3 };
