import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Semua model digambar dalam sentimeter.
// Titik asal ada di antara kedua mata. +x ke kanan, +y ke atas, +z ke arah kamera.
// Mata di x = +-3.1, dahi sekitar y = 6, puncak kepala sekitar y = 11, pusat kepala sekitar z = -8.

type Physical = THREE.MeshPhysicalMaterialParameters;

let cloth: THREE.CanvasTexture | null = null;

/** Tekstur serat halus untuk kain, beludru, dan bulu. */
function clothBump() {
  if (cloth) return cloth;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(128, 128);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 110 + Math.random() * 145;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  cloth = new THREE.CanvasTexture(canvas);
  cloth.wrapS = cloth.wrapT = THREE.RepeatWrapping;
  cloth.repeat.set(5, 5);
  return cloth;
}

const physical = (params: Physical) => new THREE.MeshPhysicalMaterial(params);
const fabric = (color: string, sheenColor = '#FFFFFF', roughness = 0.85) =>
  physical({ color, roughness, sheen: 1, sheenRoughness: 0.45, sheenColor, bumpMap: clothBump(), bumpScale: 0.25, side: THREE.DoubleSide });
const satin = (color: string) => physical({ color, roughness: 0.32, sheen: 1, sheenRoughness: 0.25, sheenColor: '#FFFFFF', clearcoat: 0.35, clearcoatRoughness: 0.4 });
const gloss = (color: string) => physical({ color, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 });
const gold = () => physical({ color: '#F2C25A', metalness: 1, roughness: 0.34, envMapIntensity: 2.4 });
const steel = () => physical({ color: '#D6DAE2', metalness: 1, roughness: 0.32, envMapIntensity: 2.2 });

function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number] = [0, 0, 0],
  rotation: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1]
) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(...position);
  item.rotation.set(...rotation);
  item.scale.set(...scale);
  item.castShadow = true;
  return item;
}

function group(...children: THREE.Object3D[]) {
  const item = new THREE.Group();
  item.add(...children);
  return item;
}

const sphere = (detail = 32) => new THREE.SphereGeometry(1, detail, Math.round(detail * 0.75));

/** Tabung melengkung yang mengecil, untuk tanduk, topi, dan tali. */
function taperedTube(points: [number, number, number][], startRadius: number, endRadius: number, segments = 48) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const radial = 20;
  const geometry = new THREE.TubeGeometry(curve, segments, 1, radial, false);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const center = new THREE.Vector3();
  const vertex = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    const ring = Math.floor(i / (radial + 1));
    const t = ring / segments;
    curve.getPointAt(t, center);
    vertex.fromBufferAttribute(position, i).sub(center);
    vertex.multiplyScalar(startRadius + (endRadius - startRadius) * Math.pow(t, 0.85)).add(center);
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function extruded(shape: THREE.Shape, depth: number, bevel: number) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 4,
    curveSegments: 20,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

/** Melengkungkan bentuk datar mengikuti silinder selebar kepala. */
function bendAroundHead(geometry: THREE.BufferGeometry, radius: number) {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const angle = position.getX(i) / radius;
    const r = radius + position.getZ(i);
    position.setXYZ(i, Math.sin(angle) * r, position.getY(i), Math.cos(angle) * r - radius);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Permukaan berbulu: titik digeser sedikit secara acak. */
function fluffy(geometry: THREE.BufferGeometry, amount: number) {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const normal = geometry.attributes.normal as THREE.BufferAttribute;
  const key = new Map<string, number>();
  for (let i = 0; i < position.count; i++) {
    const id = `${position.getX(i).toFixed(3)},${position.getY(i).toFixed(3)},${position.getZ(i).toFixed(3)}`;
    if (!key.has(id)) key.set(id, Math.random() * amount);
    const push = key.get(id)!;
    position.setXYZ(i, position.getX(i) + normal.getX(i) * push, position.getY(i) + normal.getY(i) * push, position.getZ(i) + normal.getZ(i) * push);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/* Telinga hewan */

function pointedEars(fur: string, inner: string) {
  const ear = (side: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.3, 0);
    shape.quadraticCurveTo(-1.5, 3.2, 0.1, 5);
    shape.quadraticCurveTo(1.7, 3.2, 2.3, 0);
    shape.quadraticCurveTo(0, -0.7, -2.3, 0);
    const inside = new THREE.Shape();
    inside.moveTo(-1.35, 0.25);
    inside.quadraticCurveTo(-0.85, 2.3, 0.1, 3.7);
    inside.quadraticCurveTo(1, 2.3, 1.35, 0.25);
    inside.quadraticCurveTo(0, -0.1, -1.35, 0.25);
    return group(
      mesh(extruded(shape, 0.7, 0.4), fabric(fur)),
      mesh(extruded(inside, 0.1, 0.12), fabric(inner, '#FFD9E6', 0.75), [0, 0, 0.62])
    );
  };
  const left = ear(-1);
  left.position.set(-5, 9, -4.5);
  left.rotation.set(-0.15, 0.32, 0.28);
  const right = ear(1);
  right.position.set(5, 9, -4.5);
  right.rotation.set(-0.15, -0.32, -0.28);
  return group(left, right);
}

function bunnyEars() {
  const ear = (side: number) => {
    const body = group(
      mesh(sphere(), fabric('#F8F5F2'), [0, 5.6, 0], [0, 0, 0], [1.75, 5.8, 0.72]),
      mesh(sphere(), fabric('#F7B9CB', '#FFE1EA', 0.7), [0, 5.3, 0.46], [0, 0, 0], [1.02, 4.7, 0.34])
    );
    body.position.set(side * 2.6, 8.4, -3.5);
    body.rotation.set(-0.12, 0, -side * 0.16);
    return body;
  };
  return group(ear(-1), ear(1));
}

function roundEars(fur: string, inner: string) {
  const ear = (side: number) =>
    group(
      mesh(sphere(), fabric(fur), [side * 6.1, 9.6, -5], [0, 0, 0], [2.85, 2.85, 1.35]),
      mesh(sphere(), fabric(inner, '#FFFFFF', 0.9), [side * 6.1, 9.45, -3.95], [0, 0, 0], [1.72, 1.72, 0.5])
    );
  return group(ear(-1), ear(1));
}

function frogEyes() {
  const eye = (side: number) => {
    const x = side * 3.6;
    return group(
      mesh(sphere(), gloss('#5DB84D'), [x, 9.1, -3], [0, 0, 0], [2.7, 2.6, 2.5]),
      mesh(sphere(), gloss('#F7F7F2'), [x, 9.5, -1.3], [0, 0, 0], [1.9, 1.9, 1.5]),
      mesh(sphere(), gloss('#13130F'), [x, 9.6, 0.05], [0, 0, 0], [0.98, 0.98, 0.42])
    );
  };
  return group(eye(-1), eye(1));
}

function dinoSpikes() {
  const skin = physical({ color: '#4FAE3F', roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.45, bumpMap: clothBump(), bumpScale: 0.3 });
  const parts: THREE.Mesh[] = [];
  const count = 7;
  for (let i = 0; i < count; i++) {
    const a = -1.12 + (2.24 * i) / (count - 1);
    const height = 5.2 - Math.abs(a) * 1.9;
    const x = Math.sin(a) * 7.5;
    const y = 1.3 + Math.cos(a) * 10.6;
    parts.push(
      mesh(new THREE.ConeGeometry(1.75, height, 28), skin, [x + (Math.sin(a) * height) / 2, y + (Math.cos(a) * height) / 2 - 0.5, -4.2], [0, 0, -a], [1, 1, 0.7])
    );
  }
  return group(...parts);
}

/* Pita dan mahkota */

function satinBow() {
  const ribbon = satin('#EE5F92');
  const dark = satin('#CF4577');
  const lobe = (side: number) => mesh(sphere(), ribbon, [side * 2.95, 0.1, 0], [0, side * 0.28, side * 0.2], [2.85, 1.72, 0.92]);
  const tail = (side: number) => mesh(taperedTube([[side * 0.5, -0.4, 0.1], [side * 1.5, -2.1, 0.45], [side * 2.3, -4, 0.1]], 0.62, 0.42), dark);
  const item = group(lobe(-1), lobe(1), tail(-1), tail(1), mesh(sphere(), dark, [0, 0, 0.35], [0, 0, 0], [0.98, 1.02, 0.85]));
  item.position.set(2.6, 10.1, -1.5);
  item.rotation.set(-0.08, 0, -0.14);
  return item;
}

function goldCrown() {
  const shape = new THREE.Shape();
  shape.moveTo(-10, 0);
  const peaks = 5;
  for (let i = 0; i < peaks; i++) {
    const start = -10 + (20 * i) / peaks;
    const width = 20 / peaks;
    const tall = 3.6 + Math.cos(((i - 2) / 2.5) * 1.5) * 1.7;
    shape.lineTo(start + width * 0.08, 1.7);
    shape.lineTo(start + width / 2, tall);
    shape.lineTo(start + width * 0.92, 1.7);
  }
  shape.lineTo(10, 0);
  shape.quadraticCurveTo(0, 0.5, -10, 0);
  const band = bendAroundHead(extruded(shape, 0.2, 0.1), 7.2);
  const metal = gold();
  const gem = (x: number, y: number, color: string, size: number) => {
    const a = x / 7.2;
    const item = mesh(new THREE.OctahedronGeometry(size, 1), physical({ color, roughness: 0.06, clearcoat: 1, metalness: 0.1, reflectivity: 1 }), [Math.sin(a) * 7.5, y, Math.cos(a) * 7.5 - 7.2]);
    item.scale.z = 0.62;
    return item;
  };
  const items: THREE.Object3D[] = [mesh(band, metal)];
  for (let i = 0; i < peaks; i++) {
    const x = -10 + (20 * (i + 0.5)) / peaks;
    const a = x / 7.2;
    const tall = 3.6 + Math.cos(((i - 2) / 2.5) * 1.5) * 1.7;
    items.push(mesh(sphere(16), metal, [Math.sin(a) * 7.2, tall + 0.1, Math.cos(a) * 7.2 - 7.2], [0, 0, 0], [0.34, 0.34, 0.34]));
    items.push(gem(x, 0.95, i % 2 ? '#2D8FE0' : '#E0245E', i === 2 ? 0.66 : 0.46));
  }
  const crown = group(...items);
  crown.position.set(0, 7.2, -1.2);
  crown.rotation.x = -0.1;
  return crown;
}

function flowerRing(colors: string[], centre: string, petals: number, leafy: boolean) {
  const byMaterial = new Map<string, THREE.BufferGeometry[]>();
  const add = (color: string, geometry: THREE.BufferGeometry) => byMaterial.set(color, [...(byMaterial.get(color) ?? []), geometry]);
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const place = (geometry: THREE.BufferGeometry, x: number, y: number, z: number, rx: number, ry: number, rz: number, sx: number, sy: number, sz: number) => {
    euler.set(rx, ry, rz, 'YXZ');
    quaternion.setFromEuler(euler);
    matrix.compose(new THREE.Vector3(x, y, z), quaternion, new THREE.Vector3(sx, sy, sz));
    return geometry.clone().applyMatrix4(matrix);
  };
  const base = new THREE.SphereGeometry(1, 16, 12);
  const count = 13;
  for (let i = 0; i < count; i++) {
    const a = -1.4 + (2.8 * i) / (count - 1);
    const x = Math.sin(a) * 7.7;
    const z = Math.cos(a) * 8.1 - 8;
    const y = 7.2 + Math.cos(a) * 0.9 + (i % 2 ? 0.4 : -0.1);
    const size = i % 2 ? 0.86 : 1.2;
    const color = colors[i % colors.length];
    if (leafy) {
      for (const tilt of [-1, 1]) {
        add('#5F9E4B', place(base, x + Math.cos(a) * tilt * 1.5 * size, y - 0.5, z - Math.sin(a) * tilt * 1.5 * size, 0, a, tilt * 0.6, 1.25 * size, 0.56 * size, 0.1));
      }
    }
    for (let p = 0; p < petals; p++) {
      const angle = (Math.PI * 2 * p) / petals;
      const px = Math.cos(angle) * 0.85 * size;
      const py = Math.sin(angle) * 0.85 * size;
      add(color, place(base, x + Math.cos(a) * px, y + py, z - Math.sin(a) * px + 0.25, 0.2, a, angle, 0.72 * size, 0.46 * size, 0.2 * size));
    }
    add(centre, place(base, x, y, z + 0.45, 0, a, 0, 0.36 * size, 0.36 * size, 0.24 * size));
  }
  const items = Array.from(byMaterial, ([color, geometries]) =>
    mesh(mergeGeometries(geometries)!, physical({ color, roughness: 0.62, sheen: 0.7, sheenRoughness: 0.5, sheenColor: '#FFFFFF' }))
  );
  return group(...items);
}

/* Kacamata */

function glasses(shape: THREE.Shape, frame: THREE.Material, lens: THREE.Material, radius: number, bridgeY = 0.35) {
  const eye = (side: number) => {
    const rim = shape.clone();
    const inner = new THREE.Path(shape.getPoints(32).map((p) => p.clone().multiplyScalar(0.8)).reverse());
    rim.holes = [inner];
    const lensShape = new THREE.Shape(shape.getPoints(32).map((p) => p.clone().multiplyScalar(0.82)));
    return group(
      mesh(extruded(rim, 0.22, 0.09), frame),
      mesh(new THREE.ShapeGeometry(lensShape), lens, [0, 0, 0.02])
    );
  };
  const left = eye(-1);
  left.position.set(-3.25, 0, 1.2);
  const right = eye(1);
  right.position.set(3.25, 0, 1.2);
  const temple = (side: number) => mesh(taperedTube([[side * (3.25 + radius), bridgeY, 1.1], [side * 7.4, bridgeY + 0.1, -2.4], [side * 7.6, bridgeY - 0.5, -9]], 0.18, 0.13, 24), frame);
  const bridge = mesh(taperedTube([[-(3.25 - radius * 0.9), bridgeY, 1.25], [0, bridgeY + 0.5, 1.75], [3.25 - radius * 0.9, bridgeY, 1.25]], 0.15, 0.15, 16), frame);
  return group(left, right, temple(-1), temple(1), bridge);
}

const tintedLens = (color: string, opacity: number) =>
  physical({ color, transparent: true, opacity, roughness: 0.04, metalness: 0.25, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });

function heartShape(size: number) {
  const s = new THREE.Shape();
  s.moveTo(0, -size * 0.95);
  s.bezierCurveTo(-size * 0.35, -size * 0.55, -size * 1.25, -size * 0.1, -size * 1.1, size * 0.45);
  s.bezierCurveTo(-size * 0.95, size * 1.05, -size * 0.2, size * 1.05, 0, size * 0.42);
  s.bezierCurveTo(size * 0.2, size * 1.05, size * 0.95, size * 1.05, size * 1.1, size * 0.45);
  s.bezierCurveTo(size * 1.25, -size * 0.1, size * 0.35, -size * 0.55, 0, -size * 0.95);
  return s;
}

function starShape(size: number) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? size * 0.52 : size;
    const a = Math.PI / 2 + (Math.PI * i) / 5;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  return s;
}

function aviatorShape() {
  const s = new THREE.Shape();
  s.moveTo(-2.4, 0.9);
  s.bezierCurveTo(-1.6, 1.6, 1.6, 1.6, 2.5, 0.9);
  s.bezierCurveTo(2.9, -0.5, 1.8, -2, 0.3, -2);
  s.bezierCurveTo(-1.5, -2, -2.8, -0.6, -2.4, 0.9);
  return s;
}

function pixelGlasses() {
  const black = physical({ color: '#0D0D10', roughness: 0.25, clearcoat: 1 });
  const white = physical({ color: '#F7F7F7', roughness: 0.3 });
  const cell = 0.62;
  const box = new THREE.BoxGeometry(cell, cell, 0.5);
  const parts: THREE.Mesh[] = [];
  for (let x = -11; x <= 11; x++) parts.push(mesh(box, black, [x * cell, 0.95, 1.3]));
  for (const side of [-1, 1]) {
    for (let row = 0; row < 3; row++) {
      for (let col = -3 + row; col <= 3 - row; col++) parts.push(mesh(box, black, [side * 3.25 + col * cell, 0.95 - (row + 1) * cell, 1.3]));
    }
    parts.push(mesh(box, white, [side * 3.25 - cell, 0.95 - cell, 1.6], [0, 0, 0], [0.8, 0.8, 0.2]));
    parts.push(mesh(box, white, [side * 3.25, 0.95 - cell * 2, 1.6], [0, 0, 0], [0.8, 0.8, 0.2]));
  }
  return group(...parts);
}

/* Topeng dan ikat kepala */

function heroMask() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const toX = (x: number) => 256 + (x / 9) * 256;
  const toY = (y: number) => 128 - (y / 4.5) * 128;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.moveTo(toX(-8.2), toY(2.4));
  ctx.quadraticCurveTo(toX(0), toY(3.5), toX(8.2), toY(2.4));
  ctx.quadraticCurveTo(toX(8), toY(-2.8), toX(3.8), toY(-3));
  ctx.quadraticCurveTo(toX(1.4), toY(-3), toX(0), toY(-1));
  ctx.quadraticCurveTo(toX(-1.4), toY(-3), toX(-3.8), toY(-3));
  ctx.quadraticCurveTo(toX(-8), toY(-2.8), toX(-8.2), toY(2.4));
  ctx.fill();
  ctx.fillStyle = '#000';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(toX(side * 1.35), toY(-0.1));
    ctx.quadraticCurveTo(toX(side * 3.1), toY(1.35), toX(side * 5.2), toY(0.6));
    ctx.quadraticCurveTo(toX(side * 3.3), toY(-1.35), toX(side * 1.35), toY(-0.1));
    ctx.fill();
  }
  const shape = new THREE.CanvasTexture(canvas);
  const geometry = bendAroundHead(new THREE.PlaneGeometry(18, 9, 72, 18), 8.6);
  const face = physical({ color: '#C4122A', roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.16, alphaMap: shape, alphaTest: 0.5, side: THREE.DoubleSide });
  const back = mesh(geometry, face, [0, -0.1, 1.45]);
  const front = mesh(geometry, face, [0, -0.1, 1.62]);
  return group(back, front);
}

/** Pita melingkari kepala. */
function headband(y: number, height: number, material: THREE.Material) {
  const geometry = new THREE.CylinderGeometry(1, 1, height, 56, 1, true);
  return mesh(geometry, material, [0, y, -8], [0, 0, 0], [7.85, 1, 9.35]);
}

function ninjaBand() {
  const cloth = fabric('#BC1228', '#FF8A95', 0.82);
  (cloth as THREE.MeshPhysicalMaterial).side = THREE.DoubleSide;
  const plate = bendAroundHead(new THREE.BoxGeometry(5.4, 2.1, 0.3, 24, 2, 1), 9.2);
  const spike = new THREE.Shape();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 ? 0.25 : 0.82;
    const a = (Math.PI * i) / 4;
    if (i === 0) spike.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else spike.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const tail = (side: number, drop: number) => mesh(taperedTube([[side * 7.8, 5.6, -8], [side * 10, 5, -9], [side * 12.2, 5 - drop, -8]], 0.72, 0.5, 24), cloth);
  return group(
    headband(5.5, 2.5, cloth),
    mesh(plate, steel(), [0, 5.55, 1.1]),
    mesh(extruded(spike, 0.08, 0.05), physical({ color: '#2B2D33', metalness: 1, roughness: 0.32 }), [0, 5.55, 1.4]),
    tail(1, 1.8),
    tail(1, 4)
  );
}

/* Topi */

function wizardHat() {
  const cloth = fabric('#4A2CB0', '#B59CFF');
  const brim = new THREE.LatheGeometry([new THREE.Vector2(6.6, 0.25), new THREE.Vector2(8.6, -0.05), new THREE.Vector2(10.7, -0.75), new THREE.Vector2(10.8, -0.95), new THREE.Vector2(6.6, -0.3)], 64);
  const cone = taperedTube([[0, 8.2, -5.5], [0.1, 14, -5.6], [0.9, 20, -6.7], [3.7, 24.6, -8.4]], 7.1, 0.28, 64);
  const star = extruded(starShape(1.25), 0.08, 0.1);
  return group(
    mesh(brim, cloth, [0, 8.8, -5.2], [0.24, 0, 0], [1, 1, 1.1]),
    mesh(cone, cloth),
    mesh(new THREE.CylinderGeometry(6.25, 6.9, 1.4, 56, 1, true), physical({ color: '#E8B64C', metalness: 1, roughness: 0.28, side: THREE.DoubleSide }), [0, 10.5, -5.5], [-0.02, 0, 0], [1, 1, 1.05]),
    mesh(star, gold(), [-0.3, 15.5, -1.55], [-0.12, 0, 0.2])
  );
}

function peci() {
  const velvet = fabric('#14141A', '#6F6F88', 0.92);
  const body = new THREE.LatheGeometry([new THREE.Vector2(0.001, 5.4), new THREE.Vector2(6.8, 5.3), new THREE.Vector2(7.45, 5), new THREE.Vector2(7.95, 0.1), new THREE.Vector2(7.95, 0)], 64);
  return group(mesh(body, velvet, [0, 7.1, -7.4], [-0.13, 0, 0], [1, 1, 1.16]));
}

function gradCap() {
  const navy = fabric('#1B2A5C', '#7588CF', 0.9);
  const skull = new THREE.LatheGeometry([new THREE.Vector2(0.001, 4), new THREE.Vector2(7.2, 3.9), new THREE.Vector2(7.95, 0)], 64);
  const board = new THREE.BoxGeometry(19, 0.4, 19);
  const threadColor = gold();
  return group(
    mesh(skull, navy, [0, 7.3, -7.2], [-0.13, 0, 0], [1, 1, 1.14]),
    mesh(board, navy, [0, 11.4, -7.5], [-0.14, Math.PI / 4, 0]),
    mesh(sphere(16), threadColor, [0, 11.75, -7.5], [0, 0, 0], [0.5, 0.3, 0.5]),
    mesh(taperedTube([[0, 11.8, -7.5], [4.6, 11.4, -1.2], [7, 9.4, -0.8], [7.3, 6, -0.7]], 0.12, 0.12, 24), threadColor),
    mesh(new THREE.CylinderGeometry(0.42, 0.58, 2.2, 16), physical({ color: '#E8B64C', roughness: 0.65, sheen: 1, sheenColor: '#FFF2C2' }), [7.3, 4.9, -0.7])
  );
}

function santaHat() {
  const red = fabric('#BD1626', '#FF7A85');
  const white = physical({ color: '#FFFFFF', emissive: '#6E6A64', roughness: 1, sheen: 1, sheenColor: '#FFFFFF', bumpMap: clothBump(), bumpScale: 0.9 });
  const body = taperedTube([[0, 8.2, -6.2], [0.3, 12.2, -6.5], [3, 15.4, -7], [7.6, 14.4, -6.2], [10.2, 10.1, -5.3]], 7, 0.65, 64);
  const brimGeometry = fluffy(new THREE.TorusGeometry(7.45, 1.18, 28, 72), 0.16);
  return group(
    mesh(body, red),
    mesh(brimGeometry, white, [0, 8.2, -6.6], [Math.PI / 2 + 0.08, 0, 0], [1, 1.16, 1]),
    mesh(fluffy(new THREE.SphereGeometry(1.45, 40, 30), 0.2), white, [10.4, 9.4, -5.2])
  );
}

function partyHat() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#2FA8E8';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#FFD84D';
  for (let i = -256; i < 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 256);
    ctx.lineTo(i + 28, 256);
    ctx.lineTo(i + 28 + 90, 0);
    ctx.lineTo(i + 90, 0);
    ctx.fill();
  }
  const paper = new THREE.CanvasTexture(canvas);
  paper.colorSpace = THREE.SRGBColorSpace;
  paper.wrapS = THREE.RepeatWrapping;
  paper.repeat.set(2, 1);
  const hat = group(
    mesh(new THREE.ConeGeometry(4.3, 11.8, 56, 1, true), physical({ map: paper, roughness: 0.34, clearcoat: 0.8, side: THREE.DoubleSide }), [0, 5.9, 0]),
    mesh(fluffy(new THREE.SphereGeometry(1.1, 32, 24), 0.2), physical({ color: '#F0407E', roughness: 0.9, sheen: 1, sheenColor: '#FFB7CF' }), [0, 12.05, 0]),
    mesh(fluffy(new THREE.TorusGeometry(4.2, 0.48, 16, 48), 0.14), physical({ color: '#F0407E', roughness: 0.9, sheen: 1, sheenColor: '#FFB7CF' }), [0, 0.1, 0], [Math.PI / 2, 0, 0])
  );
  hat.position.set(0.8, 8.6, -3);
  hat.rotation.set(-0.08, 0, -0.14);
  hat.scale.setScalar(0.82);
  return hat;
}

function devilHorns() {
  const red = physical({ color: '#A80F20', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 });
  const horn = (side: number) =>
    mesh(taperedTube([[side * 3.6, 8, -2.8], [side * 4.7, 10.3, -2.4], [side * 6.6, 12.1, -2.1], [side * 8, 15.2, -2.6]], 1.32, 0.05, 40), red);
  return group(horn(-1), horn(1));
}

/** Pipi merona dipakai di permukaan wajah, jadi tidak punya model. */
const MAKEUP_ONLY = new Set(['blush']);
export const isFaceMakeup = (id: string) => MAKEUP_ONLY.has(id);

/** Bentuk pengganti pipi merona untuk gambar pilihan stiker. */
function blushPreview() {
  const pink = new THREE.MeshBasicMaterial({ color: '#FF6F9A', transparent: true, opacity: 0.55 });
  return group(
    mesh(sphere(), pink, [-4.3, -4.1, -1.05], [0, -0.45, 0], [2.1, 1.25, 0.25]),
    mesh(sphere(), pink, [4.3, -4.1, -1.05], [0, 0.45, 0], [2.1, 1.25, 0.25])
  );
}

export function buildSticker(id: string): THREE.Object3D {
  switch (id) {
    case 'bigBow':
      return satinBow();
    case 'catEars':
      return pointedEars('#F7F4EF', '#F6B3C6');
    case 'orangeEars':
      return pointedEars('#E98A2C', '#F9C8A8');
    case 'bunnyEars':
      return bunnyEars();
    case 'bearEars':
      return roundEars('#8D5F38', '#D8B48C');
    case 'pandaEars':
      return roundEars('#17171A', '#2F2F35');
    case 'frogEyes':
      return frogEyes();
    case 'dinoSpikes':
      return dinoSpikes();
    case 'crown':
      return goldCrown();
    case 'flowerCrown':
      return flowerRing(['#FFFFFF', '#FFD65C', '#FF9CC2', '#FFFFFF', '#FFB56E'], '#E2A02A', 7, true);
    case 'sakuraCrown':
      return flowerRing(['#FFC1D6', '#FFA3C1', '#FFD6E3'], '#D94F7E', 5, true);
    case 'heartGlasses':
      return glasses(heartShape(1.95), gloss('#E6246F'), tintedLens('#FF6FA5', 0.58), 2.2, 0.55);
    case 'starGlasses':
      return glasses(starShape(2.75), gold(), tintedLens('#FFD84D', 0.42), 2.2, 0.2);
    case 'sunglasses':
      return glasses(aviatorShape(), physical({ color: '#B8B9C0', metalness: 1, roughness: 0.22 }), tintedLens('#0D1014', 0.9), 2.5, 0.65);
    case 'pixelGlasses':
      return pixelGlasses();
    case 'heroMask':
      return heroMask();
    case 'ninjaBand':
      return ninjaBand();
    case 'wizardHat':
      return wizardHat();
    case 'peci':
      return peci();
    case 'gradCap':
      return gradCap();
    case 'santaHat':
      return santaHat();
    case 'partyHat':
      return partyHat();
    case 'devilHorns':
      return devilHorns();
    case 'blush':
      return blushPreview();
    default:
      return new THREE.Group();
  }
}
