import Logger from "../lib/Logger";

export const killErrorHandler = () => {
  const spaceape = Il2Cpp.domain.assembly("SpaceApe.Rpc").image;
  const sharplaModel = Il2Cpp.domain.assembly("SharplaModel").image;
  const assembly = Il2Cpp.domain.assembly("Assembly-CSharp").image;

  Logger.log("Killing error handler...");

  spaceape
    .class("com.spaceape.rpc.RpcServices")
    .method("NotifyErrorAndDisconnectNetwork").implementation = function () {
    Logger.log("Killed NotifyErrorAndDisconnectNetwork");
    return;
  };

  sharplaModel
    .class("com.spaceape.sharpla.rpcs.SharplaCmdAudit")
    .method("Write").implementation = function () {
    Logger.log("Killed Write");
    return;
  };

  assembly
    .class("SharplaToRpcExecuter")
    .method("OnLocalExecutionFailure").implementation = function () {
    Logger.log("Killed OnLocalExecutionFailure");
    return;
  };
};
