import { uploadFile as filebase } from "../providers/filebase.js";
import { uploadFile as lighthouse } from "../providers/lighthouse.js";
import { uploadFile as pinata } from "../providers/pinata.js";
// import { uploadFile as fleek } from "../providers/fleek.js"; // Temporarily disabled
import { uploadFile as storacha } from "../providers/storacha.js"; // Re-enabled

export { filebase, lighthouse, pinata, storacha }; // Added storacha
