import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import * as THREE from "three";
import { encodeFlipbook } from "./flipbook.js";
import { createRenderer, renderToString } from "./headless.js";
import { optimizeSvg } from "./optimize.js";
import type { SceneFactory } from "./scene.js";
import { torusknot } from "./scenes/torusknot.js";

const sceneRegistry: Record<string, SceneFactory> = { torusknot };

interface CliOptions {
  scene: string;
  frames: number;
  fps: number;
  width: number;
  height: number;
  bg: string;
  out: string | undefined;
  params: Record<string, unknown>;
}

function parseNumber(name: string, value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`--${name} must be a positive number`);
  }
  return parsed;
}

function parseArgs(argv: string[]): CliOptions {
  const values: Record<string, string> = {};

  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith("--") || value === undefined || value.startsWith("--")) {
      throw new Error(`Expected --key value, received: ${flag ?? ""}`);
    }
    values[flag.slice(2)] = value;
  }

  const scene = values.scene ?? "torusknot";
  const knownKeys = new Set([
    "scene",
    "frames",
    "fps",
    "width",
    "height",
    "bg",
    "out",
  ]);
  const params = Object.fromEntries(
    Object.entries(values).filter(([key]) => !knownKeys.has(key)),
  );
  params.color ??= "#ffffff";

  return {
    scene,
    frames: parseNumber("frames", values.frames ?? "24"),
    fps: parseNumber("fps", values.fps ?? "12"),
    width: parseNumber("width", values.width ?? "480"),
    height: parseNumber("height", values.height ?? "480"),
    bg: values.bg ?? "none",
    out: values.out,
    params,
  };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (!Number.isInteger(options.frames)) {
    throw new Error("--frames must be an integer");
  }

  const factory = sceneRegistry[options.scene];
  if (!factory) {
    throw new Error(`Unknown scene: ${options.scene}`);
  }

  const outputPath = options.out ?? `out/${options.scene}.svg`;
  const renderable = factory(options.params, {
    THREE,
    width: options.width,
    height: options.height,
  });
  const renderer = await createRenderer(options.width, options.height);
  const frames: string[] = [];

  for (let frame = 0; frame < options.frames; frame += 1) {
    renderable.update(frame, options.frames);
    frames.push(
      renderToString(renderer, renderable.scene, renderable.camera),
    );
  }

  const flipbook = encodeFlipbook(frames, {
    fps: options.fps,
    width: options.width,
    height: options.height,
    background: options.bg,
  });
  const svg = optimizeSvg(flipbook);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, svg, "utf8");

  const sizeKb = Buffer.byteLength(svg) / 1024;
  console.log(
    `Wrote ${outputPath} (${options.frames} frames, ${sizeKb.toFixed(1)} KB)`,
  );
}

await main();
