import type { Camera, Scene } from "three";
import type * as THREE_NS from "three";

export interface SceneContext {
  THREE: typeof THREE_NS;
  width: number;
  height: number;
}

export interface RenderableScene {
  scene: Scene;
  camera: Camera;
  update(frame: number, frameCount: number): void;
}

export type SceneFactory = (
  params: Record<string, unknown>,
  ctx: SceneContext,
) => RenderableScene;
