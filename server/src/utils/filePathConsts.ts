import * as path from "path";

export const PUBLIC_DIR = path.join(__dirname, "..", "public");

export const HLS_DIR = path.resolve(PUBLIC_DIR, "hls");
export const RECORD_DIR = path.resolve(PUBLIC_DIR, "records");
export const staticFilePaths = [
  { route: "/api/static/hls", folder: HLS_DIR },
  { route: "/api/static/record", folder: RECORD_DIR },
];
