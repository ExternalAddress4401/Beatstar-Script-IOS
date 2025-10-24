import Device from "../lib/Device";
import { networkRequest } from "../lib/Utilities";

export const saveUserame = () => {
  const raksha = Il2Cpp.domain.assembly("RakshaModel").image;

  const player = Il2Cpp.gc.choose(
    raksha.class("com.spaceape.flamingo.model.PlayerTO")
  )[0];
  const username = player.field("name").value;
  const discriminator = player.field("nameUid").value;

  console.log(username.content + "#" + discriminator);

  networkRequest("/update", {
    username: username.content + "#" + discriminator,
    androidId: Device.getDeviceID(),
  });
};
