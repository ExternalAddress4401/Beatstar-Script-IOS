import Device from "../lib/Device";
import fs from "frida-fs";

export const saveProfile = () => {
  const syncResp = Il2Cpp.domain
    .assembly("RakshaModel")
    .image.class("com.spaceape.flamingo.commands.SyncResp");

  const poll = setInterval(() => {
    const objects = Il2Cpp.gc.choose(syncResp);
    if (objects.length) {
      const json = Il2Cpp.domain.assembly("JsonFx.Json").image;
      const rakshaClient = Il2Cpp.domain.assembly("raksha-client").image;

      const o = json.class("JsonFx.Json.JsonWriterSettings").alloc();
      o.method(".ctor").invoke();

      const str = rakshaClient
        .class("raksha.RakshaJson")
        .method("Serialize")
        .invoke(objects[0] as any, o) as Il2Cpp.String;

      console.log(objects[0]);

      const parsed = JSON.parse(str.content);
      fs.writeFileSync(
        Device.documents("profile"),
        JSON.stringify(parsed, null, 2)
      );

      console.log("Saved");

      clearInterval(poll);
    }
  }, 2000);
};
