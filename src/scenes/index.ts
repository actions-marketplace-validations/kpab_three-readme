import type { SceneFactory } from "../scene.js";
import { icosahedron } from "./icosahedron.js";
import { torusknot } from "./torusknot.js";

export const sceneRegistry: Record<string, SceneFactory> = {
  torusknot,
  icosahedron,
};
