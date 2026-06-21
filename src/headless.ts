import { JSDOM } from "jsdom";
import type { Camera, Scene } from "three";
import type { SVGRenderer } from "three/addons/renderers/SVGRenderer.js";

let dom: JSDOM | undefined;

export function installDom(): void {
  if (dom) {
    return;
  }

  dom = new JSDOM("<!doctype html><html><body></body></html>");
  const global = globalThis as any;
  global.window = dom.window;
  global.document = dom.window.document;
  global.SVGElement = dom.window.SVGElement;
  global.XMLSerializer = dom.window.XMLSerializer;
  global.Node = dom.window.Node;
}

export async function createRenderer(
  width: number,
  height: number,
): Promise<SVGRenderer> {
  installDom();
  const { SVGRenderer } = await import(
    "three/addons/renderers/SVGRenderer.js"
  );
  const renderer = new SVGRenderer();
  renderer.setSize(width, height);
  renderer.setPrecision(1);
  return renderer;
}

export function renderToString(
  renderer: SVGRenderer,
  scene: Scene,
  camera: Camera,
): string {
  renderer.render(scene, camera);
  return new XMLSerializer().serializeToString(renderer.domElement);
}
