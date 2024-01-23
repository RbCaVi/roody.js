import { makeimage } from "./block.js";
import * as fs from "fs";

let blocks;
blocks = [
  ["iron_bar", { "type": "wire_spool", "rotate": 2, "weld": [false, false, true, false] }],
  ["air", "iron_bar"],
];
//blocks = [["iron_bar"]];
blocks=[["iron_bar",{type:"wire_spool",rotate:1,weld:"all"},"iron_bar"]];
const im = await makeimage(blocks);
const data = im.toBuffer("image/png");
fs.writeFileSync("./image.png", data);
//const out = fs.createWriteStream("output.png");
//const stream = im.createPNGStream();
//stream.pipe(out);
