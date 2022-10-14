const { deleteFile: filebase } = require("../providers/filebase.js");
const { deleteFile: moralis } = require("../providers/moralis.js");
const { deleteFile: pinata } = require("../providers/pinata.js");
const { deleteFile: web3 } = require("../providers/web3.js");

module.exports = { filebase, moralis, pinata, web3 };
