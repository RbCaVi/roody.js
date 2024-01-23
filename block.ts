//import PIL
//import PIL.Image

//const PIL={}

//welded=top,left,bottom,right
//rotate= 0    1    2      3

import * as canvas from "canvas";

type WeldedSide = 0 | 1 | 2;
type Welded = [WeldedSide, WeldedSide, WeldedSide, WeldedSide];

type Rotate = 0 | 1 | 2 | 3;

function resize(c, size) {
  const out = canvas.createCanvas(size, size);
  const ctx = out.getContext("2d");
  ctx.drawImage(c, 0, 0, size, size);
  return out;
}

function crop(c, [x, y, x2, y2]) {
  console.log(`cropping to ${x},${y} ${x2},${y2}`);
  const out = canvas.createCanvas(x2 - x, y2 - y);
  const ctx = out.getContext("2d");
  ctx.drawImage(c, x, y, x2 - x, y2 - y, 0, 0, x2 - x, y2 - y);
  return out;
}

abstract class Block {
  abstract draw(welded: Welded, rotate: Rotate, size: number): canvas.Canvas;
}

class NormalBlock extends Block {
  image: canvas.Canvas;
  static async create(file: string, offset = 0) {
    const image = crop(await canvas.loadImage(`blocks/${file}.png`), [
      offset,
      0,
      offset + 32,
      32,
    ]);
    return new NormalBlock(image);
  }

  constructor(image: canvas.Canvas) {
    super();
    this.image = image;
  }

  draw(welded: Welded, rotate: Rotate = 0, size: number = 128) {
    const [top, left, bottom, right] = rotatewelded(welded, rotate);
    const im = canvas.createCanvas(16, 16);
    for (const [x, xside] of [
      [0, left],
      [8, right],
    ]) {
      for (const [y, yside] of [
        [0, top],
        [8, bottom],
      ]) {
        im.getContext("2d").drawImage(
          this.image,
          x + 16 * xside,
          y + 16 * yside,
          8,
          8,
          x,
          y,
          8,
          8,
        );
      }
    }
    const im2 = rotateblock(im, rotate);
    return resize(im2, size);
  }
}

function assert(x: boolean, reason: string = "no reason given") {
  if (!x) {
    throw new Error(`Assertion failed: ${reason}`);
  }
}

function rotateblock(im: canvas.Canvas | canvas.Image, rotate: Rotate) {
  if (rotate == 0) {
    return im;
  }
  assert(im.width == im.height);
  const im2 = canvas.createCanvas(im.width, im.height);
  const ctx = im2.getContext("2d");
  if (rotate == 3) {
    ctx.save();
    ctx.setTransform(new canvas.DOMMatrix([0, -1, 1, 0, 0, im.height]));
    ctx.drawImage(im, 0, 0);
    ctx.restore();
  }
  if (rotate == 1) {
    ctx.save();
    ctx.setTransform(new canvas.DOMMatrix([0, 1, 1, 0, 0, 0]));
    ctx.drawImage(im, 0, 0);
    ctx.restore();
  }
  if (rotate == 2) {
    ctx.save();
    ctx.setTransform(new canvas.DOMMatrix([1, 0, 0, -1, 0, im.height]));
    ctx.drawImage(im, 0, 0);
    ctx.restore();
  }
  return im2;
}

function rotatewelded(welded: Welded, rotate: Rotate): Welded {
  if (rotate == 0) {
    return welded;
  }
  if (rotate == 3) {
    return [3, 0, 1, 2].map((i) => welded[i]) as Welded;
  }
  if (rotate == 1) {
    return [1, 0, 3, 2].map((i) => welded[i]) as Welded;
  }
  if (rotate == 2) {
    return [2, 1, 0, 3].map((i) => welded[i]) as Welded;
  }
  assert(false,"invalid rotate");
}

class TwoSideBlock extends Block {
  image: canvas.Image;
  static async create(file, offset = 0) {
    const image = crop(await canvas.loadImage(`blocks/${file}.png`), [
      offset,
      0,
      offset + 32,
      32,
    ]);
    return new TwoSideBlock(image);
  }

  constructor(image) {
    super();
    this.image = image;
  }

  draw(welded: Welded, rotate: Rotate = 0, size: number = 128) {
    if (rotate == 1) {
      rotate = 3;
    }
    if (rotate == 2) {
      rotate = 0;
    }
    const [top, left, bottom, right] = rotatewelded(welded, rotate);
    const im = canvas.createCanvas(16, 16);
    for (const [x, xside] of [
      [0, left],
      [8, right],
    ]) {
      for (const [y, yside] of [
        [0, top],
        [8, bottom],
      ]) {
        im.getContext("2d").drawImage(
          this.image,
          x + 16 * xside,
          y + 16 * yside,
          8,
          8,
          x,
          y,
          8,
          8,
        );
      }
    }
    const im2 = rotateblock(im, rotate);
    return resize(im2, size);
  }
}

class NoWeldBlock extends Block {
  image: canvas.Image;
  static async create(file) {
    const image = crop(
      await canvas.loadImage(`blocks/noweld/${file}.png`),
      [0, 0, 16, 16],
    );
    return new NoWeldBlock(image);
  }

  constructor(image) {
    super();
    this.image = image;
  }

  draw(_1: Welded, _2: Rotate, size: number = 128) {
    const im = canvas.createCanvas(16, 16);
    im.getContext("2d").drawImage(this.image, 0, 0, 16, 16);
    return resize(im, size);
  }
}

class WaferBlock extends Block {
  wafer: canvas.Image;
  wire: canvas.Image;
  image: canvas.Image;
  static async create(file, base = "wafer", offset = 0) {
    const wafer = crop(
      await canvas.loadImage(`blocks/${base}.png`),
      [0, 0, 32, 32],
    );
    const wire = crop(await canvas.loadImage("blocks/wire.png"), [
      offset,
      0,
      offset + 32,
      32,
    ]);
    const image = crop(await canvas.loadImage(`blocks/${base}/${file}.png`), [
      offset,
      0,
      offset + 32,
      32,
    ]);
    return new WaferBlock(wafer, wire, image);
  }

  constructor(wafer, wire, image) {
    super();
    this.wafer = wafer;
    this.wire = wire;
    this.image = image;
  }

  draw(
    welded: Welded,
    rotate: Rotate = 0,
    size: number = 128,
    offset = [0, 0],
  ) {
    const [top, left, bottom, right] = rotatewelded(welded, rotate);
    const im = canvas.createCanvas(16, 16);
    for (const [x, xside] of [
      [0, left],
      [8, right],
    ]) {
      for (const [y, yside] of [
        [0, top],
        [8, bottom],
      ]) {
        const xoff = xside ? 16 : 0;
        const yoff = yside ? 16 : 0;
        im.getContext("2d").drawImage(
          this.wafer,
          x + xoff,
          y + yoff,
          8,
          8,
          x,
          y,
          8,
          8,
        );
      }
    }
    for (const [x, xside] of [
      [0, left],
      [8, right],
    ]) {
      for (const [y, yside] of [
        [0, top],
        [8, bottom],
      ]) {
        const xoff = (xside == 2 ? 16 : 0) + offset[0];
        const yoff = (yside == 2 ? 16 : 0) + offset[1];
        im.getContext("2d").drawImage(
          this.wire,
          x + xoff,
          y + yoff,
          8,
          8,
          x,
          y,
          8,
          8,
        );
      }
    }
    const ctx = im.getContext("2d");
    ctx.save();
    for (let i = 0; i < rotate; i++) {
      ctx.transform(0, 1, -1, 0, im.width, 0);
    }
    ctx.drawImage(
      this.image,
      16 * offset[0],
      16 * offset[1],
      16 * (offset[0] + 1),
      16 * (offset[1] + 1),
      0,
      0,
      16,
      16,
    );
    ctx.restore();
    return resize(im, size);
  }
}

class WireBlock extends Block {
  wafer: canvas.Image;
  image: canvas.Image;
  static async create(base, offset = 0) {
    const wafer = crop(
      await canvas.loadImage(`blocks/${base}.png`),
      [0, 0, 32, 32],
    );
    const image = crop(await canvas.loadImage("blocks/wire.png"), [
      offset,
      0,
      offset + 32,
      32,
    ]);
    return new WireBlock(wafer, image);
  }

  constructor(wafer, image) {
    super();
    this.wafer = wafer;
    this.image = image;
  }

  draw(
    welded: Welded,
    rotate: Rotate = 0,
    size: number = 128,
    offset = [0, 0],
  ) {
    const [top, left, bottom, right] = rotatewelded(welded, rotate);
    const im = canvas.createCanvas(16, 16);
    for (const [x, xside] of [
      [0, left],
      [8, right],
    ]) {
      for (const [y, yside] of [
        [0, top],
        [8, bottom],
      ]) {
        const xoff = xside ? 16 : 0;
        const yoff = yside ? 16 : 0;
        im.getContext("2d").drawImage(
          this.wafer,
          x + xoff,
          y + yoff,
          8,
          8,
          x,
          y,
          8,
          8,
        );
      }
    }
    for (const [x, xside] of [
      [0, left],
      [8, right],
    ]) {
      for (const [y, yside] of [
        [0, top],
        [8, bottom],
      ]) {
        const xoff = (xside == 2 ? 16 : 0) + offset[0];
        const yoff = (yside == 2 ? 16 : 0) + offset[1];
        im.getContext("2d").drawImage(
          this.image,
          x + xoff,
          y + yoff,
          8,
          8,
          x,
          y,
          8,
          8,
        );
      }
    }
    return resize(im, size);
  }
}

class PlatformBlock extends Block {
  image: canvas.Image;
  static async create() {
    const image = await canvas.loadImage("blocks/platform.png");
    return new PlatformBlock(image);
  }

  constructor(image) {
    super();
    this.image = image;
  }

  draw(welded: Welded, _, size: number = 128) {
    const [, left, , right] = welded;
    const im = canvas.createCanvas(16, 16);
    let y = 0;
    if (
      (left == 0 && right == 1) ||
      (left == 1 && right == 0) ||
      (left == 0 && right == 0)
    ) {
      y = 16;
    }
    for (const [x, xside] of [
      [0, left],
      [8, right],
    ]) {
      im.getContext("2d").drawImage(
        this.image,
        x + 16 * xside,
        y,
        8,
        16,
        x,
        0,
        8,
        8,
      );
    }
    return resize(im, size);
  }
}

class ActuatorBlock extends Block {
  base: canvas.Image;
  head: canvas.Image;
  static async create() {
    const base = crop(
      await canvas.loadImage("blocks/actuator_base.png"),
      [0, 0, 32, 32],
    );
    const head = crop(
      await canvas.loadImage("blocks/actuator_head.png"),
      [0, 0, 32, 32],
    );
    return new ActuatorBlock(base, head);
  }

  constructor(base, head) {
    super();
    this.base = base;
    this.head = head;
  }

  draw(welded: Welded, rotate: Rotate = 0, size: number = 128) {
    const [headtop, baseleft, basebottom, baseright] = rotatewelded(
      welded,
      rotate,
    );
    const [basetop, headleft, headbottom, headright] = [1, 0, 1, 0];
    const im = canvas.createCanvas(16, 16);
    for (const [x, xside] of [
      [0, headleft],
      [8, headright],
    ]) {
      for (const [y, yside] of [
        [0, headtop],
        [8, headbottom],
      ]) {
        im.getContext("2d").drawImage(
          this.head,
          x + 16 * xside,
          y + 16 * yside,
          8,
          8,
          x,
          y,
          8,
          8,
        );
      }
    }
    for (const [x, xside] of [
      [0, baseleft],
      [8, baseright],
    ]) {
      for (const [y, yside] of [
        [0, basetop],
        [8, basebottom],
      ]) {
        im.getContext("2d").drawImage(
          this.base,
          x + 16 * xside,
          y + 16 * yside,
          8,
          8,
          x,
          y,
          8,
          8,
        );
      }
    }
    const im2 = rotateblock(im, rotate);
    return resize(im2, size);
  }
}

type BlockData =
  | {
      type?: string;
      rotate?: Rotate;
      weld?: "all" | Welded;
    }
  | [string]
  | [string, Rotate]
  | [string, Rotate, "all" | Welded]
  | string
  | null;

function normalize(block: BlockData): NormalizedBlockData {
  if (!block) {
    return { type: "air", rotate: 0, weld: "all" };
  }
  if (typeof block == "string") {
    return { type: block, rotate: 0, weld: "all" };
  }
  if (Array.isArray(block)) {
    const out = {
      type: "air",
      rotate: 0 as Rotate,
      weld: "all" as "all" | Welded,
    };
    block.map((x: any, i: number) => {
      out[["type", "rotate", "weld"][i]] = x;
    });
    return out;
  }
  const out = {
    type: "air",
    rotate: 0 as Rotate,
    weld: "all" as "all" | Welded,
  };
  Object.entries(block).map(([k, v]) => {
    out[k] = v;
  });
  return out;
}

function get(vss, xi, yi) {
  if (xi < 0 || yi < 0 || yi >= vss.length) {
    return normalize("air");
  }
  const vs = vss[yi];
  if (xi >= vs.length) {
    return normalize("air");
  }
  return vs[xi];
}

const wafertypes = [
  "accelerometer",
  "capacitor",
  "diode",
  "galvanometer",
  "latch",
  "matcher",
  "potentiometer",
  "sensor",
  "transistor",
  "wire_board",
];
const wiretypes = ["detector", "port", "toggler", "trigger", "wire"];
const wiredtypes = ["lamp", "combiner"].concat(wafertypes, wiretypes);
const noweldtypes = [
  "copper_ore",
  "iron_ore",
  "pulp",
  "sand",
  "silicon",
  "spawner",
  "telecross",
  "air",
];
const twowaytypes = ["wire_spool", "wood", "mirror"];

function canweld(side, block) {
  let sides;
  if (noweldtypes.includes(block["type"])) {
    return false;
  } else if (
    [
      "cap",
      "flower_magenta",
      "flower_yellow",
      "grass",
      "motor",
      "pedestal",
      "spikes",
    ].includes(block["type"])
  ) {
    sides = [false, false, true, false];
  } else if (["actuator_head", "wire_spool", "telewall"].includes(block["type"])) {
    // no sides
    sides = [true, false, true, false];
  } else if (
    ["combiner", "extractor", "injector", "platform"].includes(block["type"])
  ) {
    // no top/bottom
    sides = [false, true, false, true];
  } else if (
    [
      "arc_furnace",
      "beam_core",
      "collector",
      "creator",
      "destroyer",
      "dismantler",
      "magnet",
      "manipulator",
      "mantler",
      "teleportore",
    ].includes(block["type"])
  ) {
    // no top
    sides = [false, true, true, true];
  } else {
    return true;
  }
  const i = { top: 0, bottom: 2, left: 1, right: 3 }[side] + block["rotate"];
  const i2 = i % 4;
  return sides[i2];
}

type NormalizedBlockData = {
  type: string;
  rotate: Rotate;
  weld: "all" | Welded;
};

async function makeimage(blocks: BlockData[][], bsize = 128, autoweld = true) {
  const xsize = Math.max(...blocks.map((x) => x.length));
  const ysize = blocks.length;

  const newblocks: NormalizedBlockData[][] = [];
  for (let i = 0; i < ysize; i++) {
    const line: NormalizedBlockData[] = [];
    for (let j = 0; j < xsize; j++) {
      line.push(normalize("air"));
    }
    newblocks.push(line);
  }
  blocks.map((line: BlockData[], yi) =>
    line.map((block: BlockData, xi) => {
      const block2 = normalize(block);
      newblocks[yi][xi] = block2;
    }),
  );

  console.log(`making canvas of size ${xsize}x${ysize}`);
  const im = canvas.createCanvas(bsize * xsize, bsize * ysize);
  for (let xi = 0; xi < xsize; xi++) {
    for (let yi = 0; yi < ysize; yi++) {
      const block = get(newblocks, xi, yi);
      if (block["type"] == "air") {
        continue;
      }
      if (block["weld"] == "all"||autoweld) {
        block["weld"] = [true, true, true, true];
      }
      console.log("block 1:",block)
      const weldright: WeldedSide =
        canweld("right", block) &&
        canweld("left", get(newblocks, xi + 1, yi));
      const weldleft: WeldedSide =
        canweld("left", block) &&
        canweld("right", get(newblocks, xi - 1, yi));
      const weldbottom: WeldedSide =
        canweld("bottom", block) &&
        canweld("top", get(newblocks, xi, yi + 1));
      const weldtop: WeldedSide =
        canweld("top", block) &&
        canweld("bottom", get(newblocks, xi, yi - 1));
      const weldable = [weldtop,weldleft,weldbottom,weldright]
      block["weld"] = block["weld"].map(
        (e: WeldedSide, i: number) => e && weldable[i],
      );
      console.log("block 2:",block)
      let b: Block;
      if (block["type"] == "wire_board" || block["type"] == "wire") {
        if (block["type"] == "wire") {
          b = await WireBlock.create("frame");
        } else {
          b = await WireBlock.create("wafer");
        }
      } else if (block["type"] in wafertypes) {
        b = await WaferBlock.create(block["type"]);
      } else if (block["type"] in wiretypes) {
        b = await WaferBlock.create(block["type"], "frame");
      } else if (block["type"] in twowaytypes) {
        b = await TwoSideBlock.create(block["type"]);
      } else if (block["type"] in noweldtypes) {
        b = await NoWeldBlock.create(block["type"]);
      } else if (block["type"] == "platform") {
        block["weld"][1] =
          block["weld"][1] &&
          (get(newblocks, xi - 1, yi)["type"] != "platform" ? 2 : true);
        block["weld"][3] =
          block["weld"][3] &&
          (get(newblocks, xi + 1, yi)["type"] != "platform" ? 2 : true);
        b = await PlatformBlock.create();
      } else if (block["type"] == "actuator") {
        b = await ActuatorBlock.create();
      } else {
        b = await NormalBlock.create(block["type"]);
      }
      if (block["type"] in wafertypes.concat(wiretypes)) {
        block["weld"][0] =
          block["weld"][0] &&
          (get(newblocks, xi, yi - 1)["type"] in wiredtypes ? 2 : true);
        block["weld"][1] =
          block["weld"][1] &&
          (get(newblocks, xi - 1, yi)["type"] in wiredtypes ? 2 : true);
        block["weld"][2] =
          block["weld"][2] &&
          (get(newblocks, xi, yi + 1)["type"] in wiredtypes ? 2 : true);
        block["weld"][3] =
          block["weld"][3] &&
          (get(newblocks, xi + 1, yi)["type"] in wiredtypes ? 2 : true);
        //block['weld'][0]=block['weld'][0]&&2
        //block['weld'][1]=block['weld'][1]&&2
        //block['weld'][2]=block['weld'][2]&&2
        //block['weld'][3]=block['weld'][3]&&2
      }
      console.log("block 3:",block)
      const bim = b.draw(block["weld"], block["rotate"], bsize);
      im.getContext("2d").drawImage(bim, xi * bsize, yi * bsize);
    }
  }
  return im;
}

// if(__name__=="__main__"){
//   const blocks=[
//     ["iron_bar",{"type":"wire_spool","rotate":2,"weld":[false,false,true,false]}],
//     ["air","iron_bar"],
//   ];
//   const im=makeimage(blocks);
//   im.show();
//   im.save("recipe.png");

//   blocks=[
//     ["cast_iron",{"type":"wire_spool","rotate":2,"weld":[false,false,true,false]}],
//     ["cast_iron","cast_iron"],
//   ];
//   im=makeimage(blocks)
//   im.show()
//   im.save('frecipe.png')

//   const leftspool={"type":"wire_spool","rotate":1,"weld":[false,false,false,true]};
//   const rightspool={"type":"wire_spool","rotate":1,"weld":[false,true,false,false]};

//   blocks=[
//     [leftspool,"iron_bar",rightspool],
//     [leftspool,"iron_bar",rightspool],
//     [leftspool,"iron_bar",rightspool],
//   ];
//   im=makeimage(blocks)
//   im.show()
//   im.save('inductor.png')

//   im1=makeimage([['wire','glass']])
//   im2=makeimage([['wire_board','glass']])

//   im1.save('E.apng', duration=500, save_all=true, append_images=[im2],loop=0,disposal=0,blend=0)
//   im1.save('E.gif', duration=500, save_all=true, append_images=[im2],loop=0,disposal=2)

//   im=canvas.loadImage('E.apng')
//   im.show()
// }

export { makeimage };
