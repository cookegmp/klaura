/**
 * One-shot HEIC→JPEG conversion for the sample artwork in
 * `documentation/samples/`. Pure-JS via `heic-convert`; no native deps.
 * Output: `/public/sample-art/*.jpg` (web-servable).
 *
 * Run: `node scripts/convert-samples.mjs`
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import heicConvert from "heic-convert";

const SRC = path.resolve("documentation/samples");
const OUT = path.resolve("public/sample-art");

await fs.mkdir(OUT, { recursive: true });

const files = await fs.readdir(SRC);
for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, ext).toLowerCase();
  const outPath = path.join(OUT, `${base}.jpg`);
  try {
    await fs.access(outPath);
    console.log("skip", outPath);
    continue;
  } catch {
    /* not present — convert */
  }
  const buf = await fs.readFile(path.join(SRC, file));
  if (ext === ".heic") {
    const out = await heicConvert({ buffer: buf, format: "JPEG", quality: 0.88 });
    await fs.writeFile(outPath, Buffer.from(out));
    console.log("HEIC →", outPath);
  } else if (ext === ".jpg" || ext === ".jpeg") {
    await fs.writeFile(outPath, buf);
    console.log("copy →", outPath);
  } else {
    console.log("skip non-image", file);
  }
}
console.log("done");
