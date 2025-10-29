import DataCache from "./DataCache.js";

let customSongs: any[] = [];
let lastNote: any = null;
let dataCache: DataCache;

const setLastNote = (value: any) => {
  lastNote = value;
};

const setCustomSongs = (value: any) => {
  customSongs = value;
};

const setDataCache = (value: DataCache) => {
  dataCache = value;
};

export {
  customSongs,
  lastNote,
  dataCache,
  setLastNote,
  setCustomSongs,
  setDataCache,
};
