const { uploadFile: lighthouse } = require("../providers/lighthouse.js");
const { uploadFile: filebase } = require("../providers/filebase.js");
const { uploadFile: pinata } = require("../providers/pinata.js");
const { uploadFile: fleek } = require("../providers/fleek.js");
const { uploadFile: web3 } = require("../providers/web3.js");

module.exports = { lighthouse, filebase, pinata, fleek, web3 };
