import "frida-il2cpp-bridge";
import { lengthFixer } from "../functions/lengthFixer.js";
import { hookGraphics } from "../hacks/graphics.js";
import Logger from "../lib/Logger.js";
import Device from "../lib/Device.js";
import { ignoreNotificationErrors } from "../utilities/ignoreNotificationErrors.js";
import { activateMod } from "../utilities/activateMod.js";

Logger.log("Starting mod...");

Il2Cpp.perform(async () => {
  Device.alert("Mod loaded.");
  try {
    activateMod();
    ignoreNotificationErrors();
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
