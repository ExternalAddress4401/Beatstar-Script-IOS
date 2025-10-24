import * as nofail from "./noFail.js";
import * as autoplay from "./autoplay.js";
import Device from "../lib/Device.js";

export const search = () => {
  const assembly = Il2Cpp.domain.assembly("Assembly-CSharp").image;

  assembly
    .class("SongCollection_SearchElement")
    .method("UpdateInputFilledState").implementation = function () {
    const input = this.field("inputField").value as Il2Cpp.Object;
    const text = input.field("m_Text").value as Il2Cpp.String;
    const searchTerm = text.toString().slice(1, -1);

    if (searchTerm == "nofail") {
      nofail.toggle();
      Device.alert(nofail.getStatus());
    } else if (searchTerm == "autoplay") {
      autoplay.toggle();
      Device.alert(autoplay.getStatus());
    }
  };
};
