import type { SceneFactory } from "../scene.js";

export const torus: SceneFactory = (params, ctx) => {
  const { THREE, width, height } = ctx;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.z = 8;

  const geometry = new THREE.TorusGeometry(1.6, 0.5, 8, 20);
  const color = typeof params.color === "string" ? params.color : "#ffffff";
  const material = new THREE.MeshBasicMaterial({ color, wireframe: true });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return {
    scene,
    camera,
    update(frame, frameCount) {
      const t = frame / frameCount;
      mesh.rotation.x = t * Math.PI * 2;
      mesh.rotation.z = t * Math.PI * 2;
    },
  };
};
