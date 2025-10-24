import Device from "../lib/Device.js";
import { setScores } from "../lib/Globals.js";
import Logger from "../lib/Logger.js";
import { networkRequest } from "../lib/Utilities.js";

export interface Score {
  beatmapId: number;
  score: number;
}

export const getScores = () => {
  return new Promise<Score[]>(async function (resolve, reject) {
    try {
      const scores = (await networkRequest("/getScores", {
        androidId: Device.getDeviceID(),
      })) as string;
      
      Logger.log(`Scores: ${scores}`);
      const parsedScores = JSON.parse(scores);
      setScores(parsedScores);
      resolve(parsedScores);
    } catch (e: any) {
      Logger.log(`Error fetching scores: ${e}`);
      resolve([]); // Risolve con array vuoto in caso di errore
    }
  });
};