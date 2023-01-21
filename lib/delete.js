const { deleteFile: lighthouse } = require("../providers/lighthouse.js");
const { deleteFile: filebase } = require("../providers/filebase.js");
const { deleteFile: pinata } = require("../providers/pinata.js");
const { deleteFile: fleek } = require("../providers/fleek.js");
const { deleteFile: web3 } = require("../providers/web3.js");

module.exports = { lighthouse, filebase, pinata, fleek, web3 };
