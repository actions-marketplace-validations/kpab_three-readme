import assert from "node:assert/strict";
import * as THREE from "three";

import { createRenderer, renderToString } from "../src/headless.js";

const scene = new THREE.Scene();
const geometry = new THREE.IcosahedronGeometry(1);
const material = new THREE.MeshBasicMaterial({ wireframe: true });
scene.add(new THREE.Mesh(geometry, material));

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.z = 3;

const renderer = await createRenderer(240, 240);
const svg = renderToString(renderer, scene, camera);

assert.match(svg, /^<svg\b/);
assert.ok(svg.includes("</svg>"));
assert.match(svg, /<path\b/);
console.log(`SVG char count: ${svg.length}`);
