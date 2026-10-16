// Renders the mark to the PNG sizes Next can't derive itself (apple-icon on an opaque tile, OG-sized mark). Run after changing the mark.
import fs from "node:fs";
import { chromium } from "@playwright/test";
const svg = fs.readFileSync("app/icon.svg", "utf8");
const tile = svg.replace("<mask", '<rect width="32" height="32" fill="#08090A"/><mask');
const b = await chromium.launch();
for (const [file, size, src] of [["app/apple-icon.png", 180, tile], ["public/mark-512.png", 512, svg]]) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<body style="margin:0;background:transparent">${src.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body>`);
  await p.screenshot({ path: file, omitBackground: true }); await p.close();
}
await b.close(); console.log("icons written");
