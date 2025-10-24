import Logger from "./Logger";
import ObjC from "frida-objc-bridge";

interface AlertOptions {
  title?: string;
  message: string;
  buttonTitle?: string;
  style?: number;
}

class Device {
  static alert(options: AlertOptions | string) {
    const config = typeof options === "string" ? { message: options } : options;

    const handler = new ObjC.Block({
      retType: "void",
      argTypes: ["object"],
      implementation() {},
    });

    ObjC.schedule(ObjC.mainQueue, () => {
      const UIApplication = ObjC.classes.UIApplication;
      const UIWindowScene = ObjC.classes.UIWindowScene;
      const UIAlertController = ObjC.classes.UIAlertController;
      const UIAlertAction = ObjC.classes.UIAlertAction;

      const windowScene = UIApplication.sharedApplication()
        .connectedScenes()
        .allObjects()
        .objectAtIndex_(0);

      const keyWindow = windowScene.windows().firstObject();
      let viewController = keyWindow.rootViewController();

      // Get the topmost presented view controller
      while (viewController.presentedViewController()) {
        viewController = viewController.presentedViewController();
      }

      const alert =
        UIAlertController.alertControllerWithTitle_message_preferredStyle_(
          config.title || null,
          config.message,
          1
        );

      const defaultAction = UIAlertAction.actionWithTitle_style_handler_(
        config.buttonTitle || "OK",
        config.style || 0,
        handler
      );

      alert.addAction_(defaultAction);
      viewController.presentViewController_animated_completion_(
        alert,
        true,
        null
      );
    });
  }

  static documents(path?: string): string {
    const basePath =
      ObjC.classes.NSProcessInfo.processInfo()
        .environment()
        .objectForKey_("HOME")
        .toString() + "/Documents/";

    return path ? basePath + path : basePath;
  }

  static getDeviceLanguage(): string {
    try {
      const NSLocale = ObjC.classes.NSLocale;
      const currentLocale = NSLocale.currentLocale();
      const languageCode = currentLocale.languageCode();
      return languageCode.toString();
    } catch (error) {
      return "en";
    }
  }

  static getDeviceID(): string {
    try {
      const SecurityModule = Process.getModuleByName("Security");

      const SecItemCopyMatching = new NativeFunction(
        SecurityModule.getExportByName("SecItemCopyMatching"),
        "int",
        ["pointer", "pointer"]
      );
      const SecItemAdd = new NativeFunction(
        SecurityModule.getExportByName("SecItemAdd"),
        "int",
        ["pointer", "pointer"]
      );
      const SecItemDelete = new NativeFunction(
        SecurityModule.getExportByName("SecItemDelete"),
        "int",
        ["pointer"]
      );

      // iCloud Keychain
      const searchQuerySync = ObjC.classes.NSMutableDictionary.alloc().init();
      searchQuerySync.setObject_forKey_(
        ObjC.classes.NSNumber.numberWithBool_(true),
        "r_Data"
      );
      searchQuerySync.setObject_forKey_("genp", "class");
      searchQuerySync.setObject_forKey_("beatclone", "svce");
      searchQuerySync.setObject_forKey_("deviceID", "acct");
      searchQuerySync.setObject_forKey_(
        ObjC.classes.NSNumber.numberWithBool_(true),
        "sync"
      );

      const resultPtr = Memory.alloc(Process.pointerSize);
      resultPtr.writePointer(NULL);

      const searchStatusSync = SecItemCopyMatching(searchQuerySync, resultPtr);

      if (searchStatusSync === 0) {
        const resultRef = new ObjC.Object(resultPtr.readPointer());
        Logger.log("Using existing iCloud Device ID");
        return ObjC.classes.NSString.alloc()
          .initWithData_encoding_(resultRef, 4)
          .toString();
      }

      // Local Keychain
      const searchQueryLocal = ObjC.classes.NSMutableDictionary.alloc().init();
      searchQueryLocal.setObject_forKey_(
        ObjC.classes.NSNumber.numberWithBool_(true),
        "r_Data"
      );
      searchQueryLocal.setObject_forKey_("genp", "class");
      searchQueryLocal.setObject_forKey_("beatclone", "svce");
      searchQueryLocal.setObject_forKey_("deviceID", "acct");

      const localSearchStatus = SecItemCopyMatching(
        searchQueryLocal,
        resultPtr
      );

      if (localSearchStatus === 0) {
        const resultRef = new ObjC.Object(resultPtr.readPointer());
        const localId = ObjC.classes.NSString.alloc()
          .initWithData_encoding_(resultRef, 4)
          .toString();

        // Migrate to iCloud
        const saveQuery = ObjC.classes.NSMutableDictionary.alloc().init();
        saveQuery.setObject_forKey_("genp", "class");
        saveQuery.setObject_forKey_("beatclone", "svce");
        saveQuery.setObject_forKey_("deviceID", "acct");
        saveQuery.setObject_forKey_(resultRef, "v_Data");
        saveQuery.setObject_forKey_("ck", "pdmn");
        saveQuery.setObject_forKey_(
          ObjC.classes.NSNumber.numberWithBool_(true),
          "sync"
        );

        const saveStatus = SecItemAdd(saveQuery, NULL);

        if (saveStatus === 0) {
          SecItemDelete(searchQueryLocal);
          Logger.log("Migrated local Device ID to iCloud");
        }

        return localId;
      }

      // Create new ID
      Logger.log("Creating new Device ID");
      const uuid = ObjC.classes.NSUUID.UUID().UUIDString();
      const uuidData =
        ObjC.classes.NSString.stringWithString_(uuid).dataUsingEncoding_(4);

      const saveQuery = ObjC.classes.NSMutableDictionary.alloc().init();
      saveQuery.setObject_forKey_("genp", "class");
      saveQuery.setObject_forKey_("beatclone", "svce");
      saveQuery.setObject_forKey_("deviceID", "acct");
      saveQuery.setObject_forKey_(uuidData, "v_Data");
      saveQuery.setObject_forKey_("ck", "pdmn");
      saveQuery.setObject_forKey_(
        ObjC.classes.NSNumber.numberWithBool_(true),
        "sync"
      );

      SecItemAdd(saveQuery, NULL);
      return uuid;
    } catch (error) {
      Logger.log("[Keychain] Error getting Device ID");
      return "";
    }
  }
}

export default Device;
