import { checkExistFolder } from "../utils/commonFunc";
import { staticFilePaths } from "../utils/filePathConsts";
import { connectMV } from "./multiviewer";
import onvifController from "./OnvifCamera";

function checkFolders() {
  staticFilePaths.forEach((i) => {
    checkExistFolder(i.folder);
  });
}


export async function initFunc() {
  checkFolders()
  connectMV();
  await onvifController.initAll();
}
