import Device from "./Device.js";
import Logger from "./Logger.js";
import fs from "frida-fs";

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Settings {
  serverIp: string;
  serverPort?: number;
  graphics?: "low" | "med" | "high" | "high_120";
  delay?: number;
  loadScript?: string;
  aPlusColor?: Color;
  aColor?: Color;
  bColor?: Color;
  fps?: number;
}

class SettingsReader {
  settings: Settings | null = null;

  constructor() {
    try {
      if (Logger) {
        Logger.log("Reading settings file");
      }
      const settings = fs
        .readFileSync(Device.documents("settings.json"))
        .toString();
      this.settings = JSON.parse(settings);
    } catch (e) {
      const error = e as Error;
      if (Logger) {
        Logger.log(`Error reading settings file: ${error.message}`);
      }
    }
    Logger.log("Ended reading settings file");
  }

  getSetting(setting: keyof Settings) {
    if (!this.settings) {
      return null;
    }
    return this.settings[setting];
  }
}

export default new SettingsReader();
