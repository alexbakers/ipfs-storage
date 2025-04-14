import { deleteFile as filebase } from "../providers/filebase.js";
import { deleteFile as lighthouse } from "../providers/lighthouse.js";
import { deleteFile as pinata } from "../providers/pinata.js";
// import { deleteFile as fleek } from "../providers/fleek.js"; // Temporarily disabled
import { deleteFile as storacha } from "../providers/storacha.js"; // Re-enabled

export { filebase, lighthouse, pinata, storacha }; // Added storacha
