/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Cloud build environment only: Remotion's own Chrome download is blocked
// there, and the headless shell does not trust the network proxy's
// certificate. Use the pre-installed Chromium in that case. On a normal
// machine this path does not exist and Remotion's default browser is used.
import {existsSync} from "node:fs";
const localChromium = "/opt/pw-browsers/chromium";
if (existsSync(localChromium)) {
  Config.setBrowserExecutable(localChromium);
  Config.setChromeMode("chrome-for-testing");
}
