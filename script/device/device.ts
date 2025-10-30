import "frida-il2cpp-bridge";
import { lengthFixer } from "../functions/lengthFixer.js";
import { unlockCustomSongs } from "../hacks/unlockCustomSongs.js";
import { hookGraphics } from "../hacks/graphics.js";
import Logger from "../lib/Logger.js";
import Device from "../lib/Device.js";
import { ignoreNotificationErrors } from "../utilities/ignoreNotificationErrors.js";
import { saveProfile } from "../utilities/saveProfile.js";
import { customServer } from "../private-server/customServer.js";
import { hookCintaId } from "../private-server/hookCintaId.js";

Logger.log("Starting mod...");

Il2Cpp.perform(async () => {
  saveProfile();
  hookCintaId();
  customServer();
  try {
    Device.alert("Mod loaded.");

    ignoreNotificationErrors();

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
