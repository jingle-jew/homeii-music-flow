import { createHash } from "node:crypto";
import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { extractCardVersion } from "../src/core/version-utils.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");

const srcMainPath = path.join(rootDir, "src", "homeii-music-flow.js");
const distMainPath = path.join(rootDir, "dist", "homeii-music-flow.js");
const srcLocalizationPath = path.join(rootDir, "src", "localization");
const distLocalizationPath = path.join(rootDir, "dist", "localization");
const srcSendspinPath = path.join(rootDir, "src", "sendspin-js");
const distSendspinPath = path.join(rootDir, "dist", "sendspin-js");
const vendorEmblaPath = path.join(rootDir, "vendor", "embla-carousel.umd.js");
const distVendorDir = path.join(rootDir, "dist", "vendor");
const brandLogoPath = path.join(rootDir, "docs", "brand", "homeii-flow-logo.svg");
const distLogoPath = path.join(rootDir, "dist", "homeii-flow-logo.svg");

const sourceText = await readFile(srcMainPath, "utf8");
const version = extractCardVersion(sourceText);
const localizationFiles = (await readdir(srcLocalizationPath))
  .filter((file) => file.endsWith(".js"))
  .sort();
const localizationFileVersions = new Map();
const localizationHash = createHash("sha256");
for (const file of localizationFiles) {
  const text = await readFile(path.join(srcLocalizationPath, file), "utf8");
  const fileHash = createHash("sha256").update(text).digest("hex").slice(0, 10);
  localizationFileVersions.set(file, fileHash);
  localizationHash.update(file).update("\0").update(text).update("\0");
}
const localizationIndexVersion = `${version}-locales-${localizationHash.digest("hex").slice(0, 10)}`;

await mkdir(path.dirname(distMainPath), { recursive: true });
await copyFile(srcMainPath, distMainPath);
await rm(distLocalizationPath, { recursive: true, force: true });
await cp(srcLocalizationPath, distLocalizationPath, { recursive: true });

const distMainText = await readFile(distMainPath, "utf8");
await writeFile(
  distMainPath,
  distMainText.replace(
    'from "./localization/index.js";',
    `from "./localization/index.js?v=${localizationIndexVersion}";`,
  ),
);

const distLocalizationIndexPath = path.join(distLocalizationPath, "index.js");
const distLocalizationIndexText = await readFile(distLocalizationIndexPath, "utf8");
const versionedLocalizationIndexText = distLocalizationIndexText.replace(
  /from "\.\/([^"]+\.js)";/g,
  (match, file) => `from "./${file}?v=${version}-${localizationFileVersions.get(file) || "locale"}";`,
);
await writeFile(
  distLocalizationIndexPath,
  versionedLocalizationIndexText,
);

await rm(distSendspinPath, { recursive: true, force: true });
await cp(srcSendspinPath, distSendspinPath, { recursive: true });

await mkdir(distVendorDir, { recursive: true });
await copyFile(vendorEmblaPath, path.join(distVendorDir, "embla-carousel.umd.js"));
await copyFile(brandLogoPath, distLogoPath);

console.log(`Synced Homeii release artifacts for ${version}`);
