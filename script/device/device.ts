import "frida-il2cpp-bridge";
import { lengthFixer } from "../functions/lengthFixer.js";
import { unlockAllSongs } from "../hacks/unlockAllSongs.js";
import { unlockCustomSongs } from "../hacks/unlockCustomSongs.js";
import { getScores } from "../utilities/getScores.js";
import { hookGraphics } from "../hacks/graphics.js";
import Logger from "../lib/Logger.js";
import Device from "../lib/Device.js";
import { ignoreNotificationErrors } from "../utilities/ignoreNotificationErrors.js";

Logger.log("Starting mod...");

Il2Cpp.perform(async () => {
  try {
    const scores = await getScores();
    let messageString = "mod loaded";

    if (scores && scores.length > 0) {
      messageString += ` with ${scores.length} ${
        scores.length === 1 ? "score" : "scores"
      }`;
    }

    Logger.log(messageString);
    Device.alert(messageString);

    ignoreNotificationErrors();

    unlockAllSongs();
    Logger.log("Unlocked all songs");

    unlockCustomSongs();
    Logger.log("Unlocked custom songs");

    lengthFixer();
    Logger.log("Fixed length");
    hookGraphics();
    Logger.log("Hooked graphics");
  } catch (error) {
    Logger.log(`Main initialization error: ${error}`);
    setTimeout(() => {
      Device.alert(`Main initialization error: ${error}`);
    }, 3000);
  }
});
