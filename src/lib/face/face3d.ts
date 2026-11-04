import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildSticker, isFaceMakeup } from './stickerModels';

// Kamera yang dipakai MediaPipe saat menghitung arah kepala.
const VERTICAL_FOV = 63;
const LANDMARK_COUNT = 478;
const SMOOTHING = 0.4;

export interface FaceInput {
  matrix: ArrayLike<number>;
  landmarks: { x: number; y: number; z: number }[];
}

export interface Crop {
  sx: number;
  sy: number;
  cropW: number;
  cropH: number;
}

interface Track {
  pose: THREE.Group;
  anchor: THREE.Group;
  head: THREE.Mesh;
  faceGeometry: THREE.BufferGeometry;
  makeupWeights: THREE.BufferAttribute;
  hasMakeupWeights: boolean;
  faceDepth: THREE.Mesh;
  faceShadow: THREE.Mesh;
  faceMakeup: THREE.Mesh;
  targetPosition: THREE.Vector3;
  targetRotation: THREE.Quaternion;
  targetAnchor: THREE.Vector3;
  targetScale: number;
  targetVertices: Float32Array;
  isReady: boolean;
}

const addLights = (scene: THREE.Scene) => {
  const key = new THREE.DirectionalLight('#FFFFFF', 1.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 5;
  key.shadow.bias = -0.0015;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 160;
  const area = key.shadow.camera as THREE.OrthographicCamera;
  area.left = area.bottom = -32;
  area.right = area.top = 32;
  scene.add(key, key.target);
  return key;
};

const makeEnvironment = (renderer: THREE.WebGLRenderer) => {
  const generator = new THREE.PMREMGenerator(renderer);
  const texture = generator.fromScene(new RoomEnvironment(), 0.04).texture;
  generator.dispose();
  return texture;
};

const hide = (depthOnly: THREE.Material) => {
  depthOnly.colorWrite = false;
  return depthOnly;
};

export class FaceScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(VERTICAL_FOV, 4 / 3, 1, 1000);
  private key: THREE.DirectionalLight;
  private tracks: Track[] = [];
  private triangles: number[];
  private sticker: string | null = null;
  private lastFrameMs: number[] = [];
  private bufferW = 0;
  private bufferH = 0;

  constructor(canvas: HTMLCanvasElement, triangles: number[]) {
    this.triangles = triangles;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.environment = makeEnvironment(this.renderer);
    this.key = addLights(this.scene);
    this.tracks = [this.makeTrack(), this.makeTrack()];
  }

  private makeTrack(): Track {
    const pose = new THREE.Group();
    pose.matrixAutoUpdate = true;
    const anchor = new THREE.Group();
    pose.add(anchor);

    // Kepala tak terlihat: yang ada di belakang kepala ikut tertutup, misalnya gagang kacamata.
    const head = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), hide(new THREE.MeshBasicMaterial()));
    head.position.set(0, 1.3, -8.2);
    head.scale.set(7.25, 10.4, 8.7);
    head.renderOrder = -2;
    anchor.add(head);

    const faceGeometry = new THREE.BufferGeometry();
    faceGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LANDMARK_COUNT * 3), 3));
    const makeupWeights = new THREE.BufferAttribute(new Float32Array(LANDMARK_COUNT * 4), 4);
    faceGeometry.setAttribute('color', makeupWeights);
    faceGeometry.setIndex(this.triangles);

    const faceDepth = new THREE.Mesh(faceGeometry, hide(new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })));
    faceDepth.renderOrder = -1;
    faceDepth.frustumCulled = false;

    // Permukaan wajah menangkap bayangan dari topi dan kacamata.
    const faceShadow = new THREE.Mesh(faceGeometry, new THREE.ShadowMaterial({ opacity: 0.34, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
    faceShadow.receiveShadow = true;
    faceShadow.frustumCulled = false;

    const faceMakeup = new THREE.Mesh(
      faceGeometry,
      new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
    );
    faceMakeup.frustumCulled = false;
    faceMakeup.visible = false;

    this.scene.add(pose, faceDepth, faceShadow, faceMakeup);
    pose.visible = faceDepth.visible = faceShadow.visible = false;
    return {
      pose,
      anchor,
      head,
      faceGeometry,
      makeupWeights,
      hasMakeupWeights: false,
      faceDepth,
      faceShadow,
      faceMakeup,
      targetPosition: new THREE.Vector3(),
      targetRotation: new THREE.Quaternion(),
      targetAnchor: new THREE.Vector3(),
      targetScale: 1,
      targetVertices: new Float32Array(LANDMARK_COUNT * 3),
      isReady: false,
    };
  }

  setSticker(id: string | null) {
    this.sticker = id;
    for (const track of this.tracks) {
      for (const child of [...track.anchor.children]) {
        if (child !== track.head) track.anchor.remove(child);
      }
      if (id && !isFaceMakeup(id)) track.anchor.add(buildSticker(id));
      track.faceMakeup.visible = false;
    }
  }

  /** Pose baru dari deteksi. Posisi tampilan menyusul pelan di tick(), jadi gerakannya halus. */
  update(faces: FaceInput[], sourceW: number, sourceH: number) {
    const viewH = (depth: number) => 2 * depth * Math.tan(THREE.MathUtils.degToRad(VERTICAL_FOV / 2));
    const matrix = new THREE.Matrix4();
    const inverse = new THREE.Matrix4();
    const scale = new THREE.Vector3();
    const point = new THREE.Vector3();

    this.tracks.forEach((track, index) => {
      const face = faces[index];
      if (!face) {
        track.isReady = false;
        track.pose.visible = track.faceDepth.visible = track.faceShadow.visible = track.faceMakeup.visible = false;
        return;
      }
      matrix.fromArray(Array.from(face.matrix));
      matrix.decompose(track.targetPosition, track.targetRotation, scale);

      // Titik wajah 2D diangkat ke ruang 3D memakai kedalaman kepala dari matriks.
      const depth = -track.targetPosition.z;
      const height = viewH(depth);
      const width = height * (sourceW / sourceH);
      const toCamera = (i: number, out: THREE.Vector3) => {
        const p = face.landmarks[i];
        const z = depth + p.z * width;
        const zoom = z / depth;
        return out.set((p.x - 0.5) * width * zoom, (0.5 - p.y) * height * zoom, -z);
      };
      for (let i = 0; i < LANDMARK_COUNT; i++) {
        toCamera(i, point);
        track.targetVertices.set([point.x, point.y, point.z], i * 3);
      }

      // Stiker ditempatkan dari ukuran wajah orang ini sendiri: titik asalnya tepat di antara mata.
      inverse.compose(track.targetPosition, track.targetRotation, new THREE.Vector3(1, 1, 1)).invert();
      const local = (i: number) => toCamera(i, new THREE.Vector3()).applyMatrix4(inverse);
      const eyes = local(33).add(local(133)).add(local(263)).add(local(362)).multiplyScalar(0.25);
      const faceWidth = local(454).distanceTo(local(234));
      track.targetAnchor.copy(eyes);
      track.targetScale = faceWidth / 14;

      if (!track.hasMakeupWeights) {
        const cheekA = toCamera(205, new THREE.Vector3());
        const cheekB = toCamera(425, new THREE.Vector3());
        const reach = faceWidth * 0.135;
        const color = new THREE.Color('#FF5C8E').convertSRGBToLinear();
        for (let i = 0; i < LANDMARK_COUNT; i++) {
          toCamera(i, point);
          const near = Math.min(point.distanceTo(cheekA), point.distanceTo(cheekB)) / reach;
          track.makeupWeights.setXYZW(i, color.r, color.g, color.b, 0.4 * Math.exp(-near * near * 1.5));
        }
        track.makeupWeights.needsUpdate = true;
        track.hasMakeupWeights = true;
      }

      if (!track.isReady) {
        track.pose.position.copy(track.targetPosition);
        track.pose.quaternion.copy(track.targetRotation);
        track.anchor.position.copy(track.targetAnchor);
        track.anchor.scale.setScalar(track.targetScale);
        (track.faceGeometry.attributes.position.array as Float32Array).set(track.targetVertices);
      }
      track.isReady = true;
      track.pose.visible = track.faceDepth.visible = track.faceShadow.visible = true;
      track.faceMakeup.visible = this.sticker !== null && isFaceMakeup(this.sticker);
    });
  }

  /** Warna dan terang video dipakai untuk pencahayaan, supaya model menyatu dengan ruangan. */
  matchLighting(brightness: number, tint: THREE.Color) {
    this.scene.environmentIntensity = THREE.MathUtils.clamp(0.16 + brightness * 0.62, 0.16, 0.72);
    this.key.intensity = THREE.MathUtils.clamp(0.45 + brightness * 1.7, 0.45, 1.9);
    this.key.color.copy(tint);
  }

  private step() {
    for (const track of this.tracks) {
      if (!track.isReady) continue;
      track.pose.position.lerp(track.targetPosition, SMOOTHING);
      track.pose.quaternion.slerp(track.targetRotation, SMOOTHING);
      track.anchor.position.lerp(track.targetAnchor, SMOOTHING);
      track.anchor.scale.setScalar(THREE.MathUtils.lerp(track.anchor.scale.x, track.targetScale, SMOOTHING));
      const position = track.faceGeometry.attributes.position as THREE.BufferAttribute;
      const vertices = position.array as Float32Array;
      for (let i = 0; i < vertices.length; i++) vertices[i] += (track.targetVertices[i] - vertices[i]) * SMOOTHING;
      position.needsUpdate = true;
    }
    const lead = this.tracks.find((track) => track.isReady);
    if (lead) {
      this.key.target.position.copy(lead.pose.position);
      this.key.position.copy(lead.pose.position).add(new THREE.Vector3(-14, 44, 42));
    }
  }

  private draw(sourceW: number, sourceH: number, crop: Crop) {
    this.camera.aspect = sourceW / sourceH;
    this.camera.setViewOffset(sourceW, sourceH, crop.sx, crop.sy, crop.cropW, crop.cropH);
    this.renderer.render(this.scene, this.camera);
  }

  private size(width: number, height: number) {
    if (this.bufferW === width && this.bufferH === height) return;
    this.bufferW = width;
    this.bufferH = height;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(width, height, false);
  }

  /** Satu frame tampilan. Bayangan dimatikan otomatis kalau perangkat kewalahan. */
  tick(width: number, height: number, sourceW: number, sourceH: number, crop: Crop) {
    const start = performance.now();
    this.size(width, height);
    this.step();
    this.draw(sourceW, sourceH, crop);
    this.lastFrameMs.push(performance.now() - start);
    if (this.lastFrameMs.length >= 40) {
      const average = this.lastFrameMs.reduce((a, b) => a + b, 0) / this.lastFrameMs.length;
      this.lastFrameMs = [];
      if (average > 22 && this.key.castShadow) this.key.castShadow = false;
    }
  }

  /** Menempelkan model ke foto. Hanya menaikkan resolusi kalau foto lebih besar dari tampilan. */
  paintOnto(ctx: CanvasRenderingContext2D, width: number, height: number, sourceW: number, sourceH: number, crop: Crop) {
    const previousW = this.bufferW;
    const previousH = this.bufferH;
    if (width > previousW) this.size(width, height);
    this.draw(sourceW, sourceH, crop);
    ctx.drawImage(this.renderer.domElement, 0, 0, width, height);
    if (width > previousW) {
      this.size(previousW, previousH);
      this.draw(sourceW, sourceH, crop);
    }
  }

  clear() {
    this.renderer.clear();
  }

  dispose() {
    this.renderer.dispose();
  }
}

/** Gambar kecil untuk pilihan stiker, dipakai saat membuat berkas PNG di public/face-stickers. */
export function renderStickerThumbnail(id: string, size: number) {
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(size, size, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.environment = makeEnvironment(renderer);
  scene.environmentIntensity = 0.42;
  const key = addLights(scene);
  key.position.set(-14, 50, 50);
  key.target.position.set(0, 4, -6);

  const skin = new THREE.MeshStandardMaterial({ color: '#D9A586', roughness: 0.6 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 36), skin);
  head.position.set(0, 1.3, -8.2);
  head.scale.set(7.25, 10.4, 8.7);
  head.receiveShadow = true;
  scene.add(head, buildSticker(id));

  const camera = new THREE.PerspectiveCamera(32, 1, 1, 400);
  camera.position.set(9, 12, 56);
  camera.lookAt(0, 6, -6);
  renderer.render(scene, camera);
  const url = canvas.toDataURL('image/png');
  renderer.dispose();
  return url;
}
