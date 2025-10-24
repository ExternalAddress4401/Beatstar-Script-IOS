const fs = require("fs");
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

const regex = /\w*\.class\("([\w\.]+?)"\)\.method\("(.*?)"\)\.implementation/g;
const regexMethodOnly = /\.class\("([\w\.]+?)"\)\.method\("(.*?)"\)/g;
const nonWords = /\W/;

const log = JSON.parse(fs.readFileSync("./out.txt").toString());

const addresses = [];
const methodsFound = {
    implementation: [],
    nonImplementation: [],
    critical: []
};

// Lista dei metodi critici che devono essere trovati per il lengthFixer
const criticalMethods = [
  {
    className: "UnityEngine.TextAsset",
    methodName: "get_bytes"
  },
  {
    className: "UnityEngine.Object",
    methodName: "get_name"
  },
  {
    className: "System.BitConverter",
    methodName: "ToString"
  },
  {
    className: "BeatStarRhythmGameFlowListener",
    methodName: "ShowResults"
  },
  {
    className: "raksha.ProtoOutput",
    methodName: "Write"
  }
];

function log_debug(message) {
    console.error(message);
}

function readScripts(path) {
  if (path.includes("node_modules")) {
    return;
  }
  const dir = fs.readdirSync(path);
  for (const file of dir) {
    const stat = fs.lstatSync(path + "/" + file);
    if (stat.isDirectory()) {
      readScripts(path + "/" + file);
    } else if (file.endsWith(".ts")) {
      const script = fs
        .readFileSync(path + "/" + file)
        .toString()
        .replace(/\s+/g, "");

      // Cerca prima i metodi con implementation
      while ((match = regex.exec(script)) !== null) {
        const klass = match[1].split(".").at(-1);
        if (nonWords.test(klass)) {
          console.log(klass + " looks to be invalid.");
          break;
        }
        
        if (!log[klass]) {
          console.error(`Class ${klass} not found in log file`);
          continue;
        }

        let address;
        try {
          if (match[2].includes("overload")) {
            const paramCount = match[2].split(",").length;
            const methodName = match[2].split('"')[0];
            const method = log[klass].find(
              (el) => el.name === methodName && el.parameterCount === paramCount
            );
            
            if (!method) {
              console.error(`Method ${methodName} with ${paramCount} parameters not found in ${klass}`);
              continue;
            }
            address = method.address;
          } else {
            const method = log[klass].find((el) => el.name === match[2]);
            if (!method) {
              console.error(`Method ${match[2]} not found in ${klass}`);
              continue;
            }
            address = method.address;
          }

          console.error(`[Scanner] Found implementation method: ${klass}.${match[2]} at ${address}`);
          addresses.push(address);
          methodsFound.implementation.push(`${klass}.${match[2]} (${address})`);
        } catch (error) {
          console.error(`Error processing ${klass}.${match[2]}: ${error.message}`);
          continue;
        }
      }

      // Check per i metodi senza implementation nelle cartelle specifiche
      if (path.includes("/functions/") || path.includes("/hacks/") || path.includes("/server/") || path.includes("/utilities/")) {
        while ((match = regexMethodOnly.exec(script)) !== null) {
          // Salta se contiene già implementation
          if (script.includes(`${match[0]}.implementation`)) continue;
          
          const klass = match[1].split(".").at(-1);
          const methodName = match[2];
          
          if (log[klass]) {
            const methodData = log[klass].find(el => el.name === methodName);
            if (methodData && !addresses.includes(methodData.address)) {
              console.error(`[Scanner] Found non-implementation method: ${match[1]}.${methodName} at address ${methodData.address}`);
              addresses.push(methodData.address);
              methodsFound.nonImplementation.push(`${match[1]}.${methodName} (${methodData.address})`);
            }
          }
        }
      }

      // Check per i metodi critici
      if (script.includes("lengthFixer")) {
        for (const method of criticalMethods) {
          const klass = method.className.split(".").at(-1);
          if (log[klass]) {
            const methodData = log[klass].find(el => el.name === method.methodName);
            if (methodData && !methodsFound.critical.includes(`${method.className}.${method.methodName} (${methodData.address})`)) {
              console.error(`[Scanner] Found critical method: ${method.className}.${method.methodName} at address ${methodData.address}`);
              if (!addresses.includes(methodData.address)) {  // Previene duplicati negli indirizzi
                addresses.push(methodData.address);
              }
              methodsFound.critical.push(`${method.className}.${method.methodName} (${methodData.address})`);
            }
          }
        }
      }
    }
  }
}

readScripts("./script");

// Riepilogo finale solo in debug mode
    console.error("\n[Scanner] ====== Summary ======");
    console.error(`[Scanner] Implementation methods found: ${methodsFound.implementation.length}`);
    methodsFound.implementation.forEach(m => console.error(`[Scanner] - ${m}`));

    console.error(`\n[Scanner] Non-implementation methods found: ${methodsFound.nonImplementation.length}`);
    methodsFound.nonImplementation.forEach(m => console.error(`[Scanner] - ${m}`));

    console.error(`\n[Scanner] Critical methods found: ${methodsFound.critical.length}`);
    methodsFound.critical.forEach(m => console.error(`[Scanner] - ${m}`));

    console.error(`\n[Scanner] Total addresses found: ${addresses.length}`);

// Questo output deve rimanere perché è usato dal comando graft
console.log("-i " + addresses.join(" -i "));
