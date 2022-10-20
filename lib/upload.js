const { uploadFile: filebase } = require("../providers/filebase.js");
const { uploadFile: pinata } = require("../providers/pinata.js");
const { uploadFile: fleek } = require("../providers/fleek.js");
const { uploadFile: web3 } = require("../providers/web3.js");

module.exports = { filebase, pinata, fleek, web3 };
