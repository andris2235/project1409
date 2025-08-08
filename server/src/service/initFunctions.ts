import { connectMV } from "./multiviewer";
import onvifController from "./OnvifCamera";

export async function initFunc() {
  connectMV();
  await onvifController.initAll();
}
