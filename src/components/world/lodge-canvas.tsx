import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { gallery, type GalleryItem } from "@/content/gallery";
import { CATALOG } from "@/content/library";
import { publicPath, stars } from "@/content/packet";

type Room = { position: [number, number, number]; target: [number, number, number] };

const ROOMS: Record<string, Room> = {
  "/": { position: [0.2, 1.62, 2.05], target: [0.25, 2.2, -4.7] },
  "/need": { position: [11.2, 1.5, 1.3], target: [11.2, 1.7, -5.6] },
  "/stars": { position: [20.5, 1.5, 2.15], target: [20.5, 1.58, -4.85] },
  "/form": { position: [28.6, 1.45, 1.2], target: [28.6, 1.5, -5.3] },
  "/comparison": { position: [36.8, 1.55, 1.5], target: [36.8, 1.7, -5.6] },
  "/contact": { position: [44.2, 1.42, 1.2], target: [44.2, 1.45, -5.2] },
};

type PlateSpec = { src: string; title: string; detail: string; x: number; y: number; z: number; h: number; aspect: number };

const PLATES: PlateSpec[] = [
  { src: publicPath("/plates/set-wood.jpg"), title: "Wood wall", detail: "A set wall from the picture’s reference stills. Swap the plate in the scene list if this frame should be something else.", x: -4.35, y: 2.75, z: -4.45, h: 1.45, aspect: 370 / 477 },
  { src: publicPath("/plates/set-director.jpg"), title: "The director", detail: "A reference still of the director on the floor. It stays part of the room, and it opens like the other pieces.", x: -2.2, y: 2.9, z: -4.35, h: 1.4, aspect: 659 / 413 },
  { src: publicPath("/plates/set-chair.jpg"), title: "The chair", detail: "The empty chair from the set. This is the still behind the title while the room loads.", x: 0.15, y: 2.95, z: -4.2, h: 1.9, aspect: 618 / 573 },
  { src: publicPath("/plates/set-camera.jpg"), title: "The camera", detail: "The camera on the floor. A placeholder exhibit for the apparatus of the picture.", x: 2.2, y: 2.75, z: -4.35, h: 2.2, aspect: 412 / 764 },
  { src: publicPath("/plates/psycho-left.jpg"), title: "House, left", detail: "A tall still from the reference set. Edit the title and this note with the plate list.", x: 6.4, y: 1.9, z: -5.4, h: 3.4, aspect: 412 / 1400 },
  { src: publicPath("/plates/psycho-right.jpg"), title: "House, right", detail: "The matching tall still, hung beside the first.", x: 7.7, y: 1.9, z: -5.45, h: 3.4, aspect: 536 / 1400 },
  { src: publicPath("/plates/open-water.jpg"), title: "Open water", detail: "A wide still further down the room.", x: 11.2, y: 1.85, z: -5.7, h: 4.5, aspect: 1400 / 996 },
  { src: publicPath("/plates/diner-left.jpg"), title: "Diner, left", detail: "The left side of the diner set.", x: 27.15, y: 1.7, z: -5.2, h: 3.3, aspect: 424 / 1242 },
  { src: publicPath("/plates/diner-table.jpg"), title: "Diner table", detail: "The table, low on the wall.", x: 29.15, y: 0.85, z: -5.45, h: 1.55, aspect: 1153 / 510 },
  { src: publicPath("/plates/diner-right.jpg"), title: "Diner, right", detail: "The right side of the diner set.", x: 31.15, y: 1.85, z: -5.25, h: 3.1, aspect: 495 / 987 },
  { src: publicPath("/plates/archive.jpg"), title: "Archive", detail: "The archive wall. Registration and paper live near this stretch of the room.", x: 36.8, y: 1.75, z: -5.7, h: 4.3, aspect: 1400 / 963 },
  { src: publicPath("/plates/lot-left.jpg"), title: "The lot", detail: "The lot, left of the crew still.", x: 43.15, y: 1.7, z: -5.2, h: 2.4, aspect: 577 / 589 },
  { src: publicPath("/plates/lot-crew.jpg"), title: "The crew", detail: "The crew on the lot, at the far end of the room.", x: 45.05, y: 1.65, z: -5.4, h: 3.2, aspect: 576 / 955 },
];

const OBJECT_SPOTS: Record<string, [number, number]> = {
  "the-shape": [10.2, 3.6],
  mask: [16.8, 4.4],
  blade: [28.6, 4.4],
  registration: [38.2, 3.8],
};

export type Piece =
  | { id: string; kind: "plate"; title: string; credit: string; year: string; detail: string; image?: string }
  | { id: string; kind: "book"; title: string; credit: string; year: string; detail: string }
  | ({ id: string; kind: GalleryItem["kind"]; title: string; credit: string; year: string; detail: string; image?: string });

const dragged = { moved: false, x: 0, y: 0 };

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

function woodTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const g = canvas.getContext("2d");
  if (!g) return new THREE.CanvasTexture(canvas);
  g.fillStyle = "#16110d";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 67) % 512;
    g.strokeStyle = i % 3 === 0 ? "rgba(92, 64, 38, 0.35)" : "rgba(40, 26, 16, 0.45)";
    g.lineWidth = 1 + (i % 3);
    g.beginPath();
    g.moveTo(x, 0);
    for (let y = 0; y <= 512; y += 16) g.lineTo(x + Math.sin(y * 0.04 + i) * 8, y);
    g.stroke();
  }
  for (let i = 0; i < 40; i += 1) {
    g.fillStyle = `rgba(0,0,0,${0.03 + (i % 5) * 0.015})`;
    g.fillRect((i * 37) % 512, (i * 91) % 512, 18, 3);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function curtainGeometry() {
  const geo = new THREE.PlaneGeometry(1.85, 6.4, 28, 48);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const ny = (y + 3.2) / 6.4;
    const gather = 0.22 + Math.sin(ny * Math.PI) * 0.78;
    pos.setZ(i, Math.sin(x * 7.4) * 0.075 * gather);
  }
  geo.computeVertexNormals();
  return geo;
}

function CameraRig() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { camera, gl, scene } = useThree();
  const reduced = useReducedMotion();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const dragging = useRef(false);
  const idle = useRef(0);
  const look = useRef(new THREE.Vector3(0.25, 2.2, -4.7));
  const pathRef = useRef(pathname);
  const glide = useRef<number | null>(null);
  const galleryYaw = useRef(0);
  const galleryPitch = useRef(0.12);
  pathRef.current = pathname;
  const scratch = useMemo(
    () => ({
      offset: new THREE.Vector3(),
      spherical: new THREE.Spherical(),
      desired: new THREE.Vector3(),
      target: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => {
    const exploring = () => document.querySelector(".is-gallery");
    const place = () => {
      if (glide.current != null) return;
      const room = ROOMS[pathRef.current] ?? ROOMS["/"];
      glide.current = room.position[0];
    };
    const onNudge = (event: Event) => {
      if (!exploring()) return;
      place();
      const dir = (event as CustomEvent<number>).detail;
      glide.current = THREE.MathUtils.clamp((glide.current ?? 0) + dir * 4, -2, 48);
    };
    const onWheel = (event: WheelEvent) => {
      if (!exploring()) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 0.4) return;
      place();
      glide.current = THREE.MathUtils.clamp((glide.current ?? 0) + delta * 0.012, -2, 48);
      event.preventDefault();
    };
    window.addEventListener("gallery-nudge", onNudge);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("gallery-nudge", onNudge);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    const interactive = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest("a, button, input, textarea, select, label, summary, .gallery-dialog, .movie-screen"));
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || interactive(event)) return;
      const galleryMode = document.documentElement.classList.contains("is-gallery");
      const target = event.target;
      if (!galleryMode && event.pointerType === "touch" && target instanceof Element && target.closest(".sheet, header, .site-footer, .gallery-controls")) return;
      dragging.current = true;
      dragged.moved = false;
      dragged.x = event.clientX;
      dragged.y = event.clientY;
      idle.current = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      document.documentElement.classList.add("is-looking");
      if (galleryMode || event.pointerType === "touch") event.preventDefault();
    };
    const move = (event: PointerEvent) => {
      if (!dragging.current) return;
      if (Math.hypot(event.clientX - dragged.x, event.clientY - dragged.y) > 6) dragged.moved = true;
      const exploring = document.querySelector(".is-gallery");
      if (exploring) {
        const pace = event.pointerType === "touch" ? 0.007 : 0.005;
        galleryYaw.current -= (event.clientX - lastX) * pace;
        galleryPitch.current = THREE.MathUtils.clamp(galleryPitch.current - (event.clientY - lastY) * pace, -1.15, 1.35);
      } else {
        yaw.current = THREE.MathUtils.clamp(yaw.current + (event.clientX - lastX) * 0.004, -0.9, 0.9);
        pitch.current = THREE.MathUtils.clamp(pitch.current + (event.clientY - lastY) * 0.003, -0.38, 0.38);
      }
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const up = () => {
      dragging.current = false;
      document.documentElement.classList.remove("is-looking");
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!dragging.current) return;
      if (document.documentElement.classList.contains("is-gallery") || document.documentElement.classList.contains("is-looking")) {
        event.preventDefault();
      }
    };
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("touchmove", onTouchMove);
      document.documentElement.classList.remove("is-looking");
    };
  }, []);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const room = ROOMS[pathname] ?? ROOMS["/"];
    const exploring = document.querySelector(".is-gallery");
    if (exploring) {
      if (glide.current == null) glide.current = room.position[0];
    } else if (glide.current != null) {
      glide.current = THREE.MathUtils.damp(glide.current, room.position[0], 3, d);
      if (Math.abs(glide.current - room.position[0]) < 0.04) glide.current = null;
    }
    const along = glide.current ?? room.position[0];
    const shift = along - room.position[0];
    if (!dragging.current) idle.current += d;
    if (!exploring && !dragging.current && idle.current > 1.6) {
      yaw.current = THREE.MathUtils.damp(yaw.current, 0, 1.3, d);
      pitch.current = THREE.MathUtils.damp(pitch.current, 0, 1.3, d);
    }
    const sway = reduced || exploring ? 0 : Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
    const { offset, spherical, desired, target } = scratch;
    offset.set(room.position[0] - room.target[0], room.position[1] - room.target[1], room.position[2] - room.target[2]);
    spherical.setFromVector3(offset);
    const basePhi = spherical.phi;
    if (exploring) {
      gl.toneMappingExposure = 1.38;
      scene.environmentIntensity = 0.52;
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.near = 26;
        scene.fog.far = 84;
      }
      if (camera instanceof THREE.PerspectiveCamera && camera.fov !== 51) {
        camera.fov = 51;
        camera.updateProjectionMatrix();
      }
      const lookYaw = galleryYaw.current;
      const lookPitch = galleryPitch.current;
      const reach = Math.cos(lookPitch);
      desired.set(along, 1.62, 1.4);
      target.set(along + Math.sin(lookYaw) * reach * 8, 1.62 + Math.sin(lookPitch) * 8, 1.4 - Math.cos(lookYaw) * reach * 8);
    } else {
      gl.toneMappingExposure = 1.18;
      scene.environmentIntensity = 0.34;
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.near = 22;
        scene.fog.far = 52;
      }
      if (camera instanceof THREE.PerspectiveCamera && camera.fov !== 42) {
        camera.fov = 42;
        camera.updateProjectionMatrix();
      }
      spherical.theta += yaw.current + sway;
      spherical.phi = THREE.MathUtils.clamp(basePhi + pitch.current, 0.4, 2.2);
      target.set(room.target[0] + shift, room.target[1], room.target[2]);
      desired.setFromSpherical(spherical);
      desired.add(target);
    }
    camera.position.x = THREE.MathUtils.damp(camera.position.x, desired.x, 1.5, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desired.y, 1.5, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desired.z, 1.5, d);
    look.current.x = THREE.MathUtils.damp(look.current.x, target.x, 1.5, d);
    look.current.y = THREE.MathUtils.damp(look.current.y, target.y, 1.5, d);
    look.current.z = THREE.MathUtils.damp(look.current.z, target.z, 1.5, d);
    camera.lookAt(look.current);
  });

  return null;
}

function RoomSun() {
  const light = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const { camera } = useThree();
  useFrame(() => {
    const sun = light.current;
    if (!sun) return;
    const x = camera.position.x;
    const z = camera.position.z;
    sun.position.set(x + 4, 17.2, z + 3);
    target.position.set(x, 0, z);
  });
  return (
    <>
      <primitive object={target} />
      <directionalLight
        ref={light}
        target={target}
        castShadow
        color="#fff3df"
        intensity={1.35}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.08}
        shadow-camera-near={2}
        shadow-camera-far={36}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
    </>
  );
}

function libraryProbe() {
  const probe = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(12, 8, 12),
    new THREE.MeshBasicMaterial({ color: "#3a261b", side: THREE.BackSide }),
  );
  probe.add(room);
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 2.4),
    new THREE.MeshBasicMaterial({ color: "#d7e4ee" }),
  );
  sky.position.set(0, 3.85, 0);
  sky.rotation.x = Math.PI / 2;
  probe.add(sky);
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 12, 8),
    new THREE.MeshBasicMaterial({ color: "#ffd7a4" }),
  );
  lamp.position.set(1.4, 1.1, 0.6);
  probe.add(lamp);
  probe.add(new THREE.HemisphereLight("#d5e2ee", "#3a2418", 1));
  return probe;
}

function ImageLighting() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const probe = libraryProbe();
    const env = pmrem.fromScene(probe, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.34;
    gl.toneMapping = THREE.AgXToneMapping;
    gl.toneMappingExposure = 1.12;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    return () => {
      env.dispose();
      pmrem.dispose();
      probe.traverse((child) => {
        const mesh = child as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (material && !Array.isArray(material)) material.dispose();
      });
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

function LightingPass() {
  const { gl, scene, camera, size } = useThree();
  const broken = useRef(false);
  const phone = size.width < 768;
  const composer = useMemo(() => {
    if (phone) return null;
    const effect = new EffectComposer(gl);
    effect.addPass(new RenderPass(scene, camera));
    effect.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.14, 0.32, 0.94));
    effect.addPass(new OutputPass());
    return effect;
  }, [camera, gl, phone, scene, size.height, size.width]);
  useEffect(() => {
    composer?.setSize(size.width, size.height);
    return () => composer?.dispose();
  }, [composer, size.height, size.width]);
  useFrame((state) => {
    const exploring = document.documentElement.classList.contains("is-gallery");
    if (phone || !exploring || !composer || broken.current) {
      state.gl.setRenderTarget(null);
      state.gl.render(state.scene, state.camera);
      return;
    }
    try {
      composer.render();
    } catch (error) {
      broken.current = true;
      console.error(error);
      state.gl.setRenderTarget(null);
      state.gl.render(state.scene, state.camera);
    }
  }, 1);
  return null;
}

function fabricTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const g = canvas.getContext("2d");
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 3);
  if (!g) return tex;
  const pixels = g.createImageData(128, 128);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const n = 120 + Math.random() * 110;
    pixels.data[i] = n;
    pixels.data[i + 1] = n;
    pixels.data[i + 2] = n;
    pixels.data[i + 3] = 255;
  }
  g.putImageData(pixels, 0, 0);
  g.strokeStyle = "rgba(255,255,255,0.08)";
  for (let y = 0; y < 128; y += 2) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(128, y + Math.sin(y) * 0.4);
    g.stroke();
  }
  tex.needsUpdate = true;
  return tex;
}

function contactTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const g = canvas.getContext("2d");
  const tex = new THREE.CanvasTexture(canvas);
  if (!g) return tex;
  const shade = g.createRadialGradient(64, 64, 6, 64, 64, 62);
  shade.addColorStop(0, "rgba(0,0,0,0.5)");
  shade.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = shade;
  g.fillRect(0, 0, 128, 128);
  tex.needsUpdate = true;
  return tex;
}

function ContactShadow({ position, size: scale }: { position: [number, number, number]; size: [number, number] }) {
  const map = useMemo(() => contactTexture(), []);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <planeGeometry args={scale} />
      <meshBasicMaterial map={map} transparent depthWrite={false} />
    </mesh>
  );
}

const imageCache = new Map<string, THREE.Texture>();

function useImage(src?: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(src ? (imageCache.get(src) ?? null) : null);
  useEffect(() => {
    if (!src) return;
    const cached = imageCache.get(src);
    if (cached) {
      setTex(cached);
      return;
    }
    let live = true;
    const loader = new THREE.TextureLoader();
    loader.load(src, (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = 16;
      loaded.needsUpdate = true;
      imageCache.set(src, loaded);
      if (live) setTex(loaded);
    });
    return () => {
      live = false;
    };
  }, [src]);
  return tex;
}

function Floor() {
  const tex = useMemo(() => woodTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[22, 0, 1.6]} receiveShadow>
      <planeGeometry args={[72, 22]} />
      <meshPhysicalMaterial map={tex} roughness={0.42} metalness={0.08} clearcoat={0.28} clearcoatRoughness={0.35} />
    </mesh>
  );
}

function Curtains() {
  const geo = useMemo(() => curtainGeometry(), []);
  useEffect(() => () => geo.dispose(), [geo]);
  const panels = [];
  for (let i = 0; i < 28; i++) {
    panels.push(
      <mesh key={i} geometry={geo} position={[-4 + i * 1.9, 3.05, -6.35]} rotation={[0, 0, 0]}>
        <meshPhysicalMaterial color={i % 2 === 0 ? "#6d1824" : "#3d0e16"} roughness={0.84} sheen={1} sheenColor={i % 2 === 0 ? "#e7a0a4" : "#9a4048"} sheenRoughness={0.65} side={THREE.DoubleSide} />
      </mesh>,
    );
  }
  return <group>{panels}</group>;
}

function Clickable({ id, onOpen, children }: { id: string; onOpen: (id: string) => void; children: React.ReactNode }) {
  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        if (dragged.moved) return;
        onOpen(id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      {children}
    </group>
  );
}

function panelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const g = canvas.getContext("2d");
  if (!g) return new THREE.CanvasTexture(canvas);
  g.fillStyle = "#120f0c";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4; i++) {
    const x = 18 + i * 122;
    g.fillStyle = i % 2 === 0 ? "#1c1713" : "#16120f";
    g.fillRect(x, 36, 104, 420);
    g.strokeStyle = "rgba(90, 70, 48, 0.45)";
    g.strokeRect(x + 6, 48, 92, 392);
    g.beginPath();
    g.moveTo(x + 52, 48);
    g.lineTo(x + 52, 440);
    g.stroke();
  }
  g.fillStyle = "#2c261e";
  g.fillRect(0, 0, 512, 26);
  g.fillRect(0, 292, 512, 12);
  g.fillRect(0, 478, 512, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 1);
  return tex;
}

const LIBRARY: { id: string; title: string; label: string; credit: string; year: string; detail: string; color: string; x: number; y: number }[] = [
  { id: "book-psycho", title: "Psycho", label: "PSYCHO", credit: "Alfred Hitchcock", year: "1960", color: "#1a120e", x: -1.05, y: 0.5, detail: "The cut in the shower is still the model. Everything that came after is arguing with this film." },
  { id: "book-halloween", title: "Halloween", label: "HALLOWEEN", credit: "John Carpenter", year: "1978", color: "#3d1a22", x: -0.35, y: 0.5, detail: "A quiet street and a kitchen knife. The night does not end when the porch light comes on." },
  { id: "book-exorcist", title: "The Exorcist", label: "EXORCIST", credit: "William Friedkin", year: "1973", color: "#14201c", x: 0.4, y: 0.5, detail: "The bedroom at the top of the stairs, and the voice that is not the girl's." },
  { id: "book-carrie", title: "Carrie", label: "CARRIE", credit: "Brian De Palma", year: "1976", color: "#5a2a32", x: -0.85, y: 1.16, detail: "Blood on the stage, then the dream of the hand. It starts at the prom and does not stay there." },
  { id: "book-chainsaw", title: "The Texas Chain Saw Massacre", label: "CHAIN SAW", credit: "Tobe Hooper", year: "1974", color: "#4a3a28", x: 0.05, y: 1.16, detail: "A house at the end of a dirt road. The heat does as much of the work as the saw." },
  { id: "book-elm", title: "A Nightmare on Elm Street", label: "ELM STREET", credit: "Wes Craven", year: "1984", color: "#241810", x: 0.85, y: 1.16, detail: "Sleep is not a rest. In the morning, the glove is the only thing you remember." },
  { id: "book-lambs", title: "The Silence of the Lambs", label: "THE LAMBS", credit: "Jonathan Demme", year: "1991", color: "#1c1814", x: -0.55, y: 1.82, detail: "Two rooms, a glass wall, and a well. The horror is in the conversation." },
  { id: "book-scream", title: "Scream", label: "SCREAM", credit: "Wes Craven", year: "1996", color: "#6a1824", x: 0.45, y: 1.82, detail: "The phone rings. The rules are said out loud. The mask is a joke until it is not." },
  { id: "book-iswas", title: "It Started With a Scream", label: "A SCREAM", credit: "Trancas International Films", year: "2023", color: "#2a241c", x: 0.1, y: 2.48, detail: "The shelf copy of this presentation. Stars the world already knows, on the horror films that came first." },
];

function spineTexture(label: string, year: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 512;
  const g = canvas.getContext("2d");
  if (!g) return new THREE.CanvasTexture(canvas);
  g.fillStyle = color;
  g.fillRect(0, 0, 128, 512);
  g.fillStyle = "#c6a15a";
  g.fillRect(8, 16, 112, 10);
  g.fillRect(8, 486, 112, 10);
  g.save();
  g.translate(78, 256);
  g.rotate(Math.PI / 2);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#f4ead7";
  g.font = "600 54px sans-serif";
  g.fillText(label, 0, 0);
  g.font = "500 32px sans-serif";
  g.fillStyle = "#c6a15a";
  g.fillText(year, 0, 48);
  g.restore();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function ShelfBook({
  book,
  onOpen,
  onFocus,
}: {
  book: (typeof LIBRARY)[number];
  onOpen: (id: string) => void;
  onFocus: (x: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const hover = useRef(0);
  const tex = useMemo(() => spineTexture(book.label, book.year, book.color), [book.label, book.year, book.color]);
  useEffect(() => () => tex.dispose(), [tex]);
  useFrame((_, delta) => {
    if (!group.current) return;
    const next = hover.current ? 0.2 : 0.07;
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, next, 8, Math.min(delta, 0.05));
  });
  return (
    <Clickable id={book.id} onOpen={onOpen}>
      <group
        ref={group}
        position={[book.x, book.y, 0.07]}
        onPointerOver={(event) => {
          event.stopPropagation();
          hover.current = 1;
          onFocus(book.x);
        }}
        onPointerOut={() => {
          hover.current = 0;
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          hover.current = 1;
          onFocus(book.x);
        }}
      >
        <mesh>
          <boxGeometry args={[0.16, 0.36, 0.22]} />
          <meshStandardMaterial color={book.color} roughness={0.58} />
        </mesh>
        <mesh position={[0, 0, 0.112]}>
          <planeGeometry args={[0.155, 0.35]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </Clickable>
  );
}

function LibraryNook({ onOpen }: { onOpen: (id: string) => void }) {
  const ladder = useRef<THREE.Group>(null);
  const ladderX = useRef(0);
  const cloth = useMemo(() => fabricTexture(), []);
  useEffect(() => () => cloth.dispose(), [cloth]);
  const velvet = { color: "#6e2433", roughness: 0.9, metalness: 0, sheen: 1, sheenColor: "#e7a0a4", sheenRoughness: 0.5, roughnessMap: cloth };
  const wood = { color: "#3a291c", roughness: 0.48, metalness: 0.08 };
  const spines = ["#1c140f", "#3d1a22", "#241810", "#4a3a28", "#14201c", "#2a2420", "#5a2a32", "#6a5438", "#101418"];
  const shelves = [0.34, 1.0, 1.66, 2.32, 2.98];
  const plate = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const g = canvas.getContext("2d");
    if (g) {
      g.fillStyle = "#2a2118";
      g.fillRect(0, 0, 512, 96);
      g.strokeStyle = "#c6a15a";
      g.lineWidth = 4;
      g.strokeRect(8, 8, 496, 80);
      g.fillStyle = "#f4ead7";
      g.font = "600 42px sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("THE LIBRARY", 256, 48);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  useEffect(() => () => plate.dispose(), [plate]);

  useFrame((_, delta) => {
    if (!ladder.current) return;
    const d = Math.min(delta, 0.05);
    ladder.current.position.x = THREE.MathUtils.damp(ladder.current.position.x, THREE.MathUtils.clamp(ladderX.current, -1.05, 1.05), 3.2, d);
  });

  return (
    <group>
      <group position={[0.95, 0, -1.72]} rotation={[0, -0.42, 0]}>
        <mesh position={[0, 0.16, 0.12]} rotation={[-0.08, 0, 0]} castShadow>
          <cylinderGeometry args={[0.46, 0.5, 0.16, 20]} />
          <meshStandardMaterial color="#241810" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.4, 0.06]} rotation={[-0.18, 0, 0]} scale={[1.15, 0.42, 0.85]} castShadow>
          <sphereGeometry args={[0.42, 24, 16]} />
          <meshPhysicalMaterial {...velvet} />
        </mesh>
        <mesh position={[0, 0.86, -0.28]} rotation={[-0.55, 0, 0]} scale={[1.1, 0.85, 0.38]} castShadow>
          <sphereGeometry args={[0.4, 24, 16]} />
          <meshPhysicalMaterial {...velvet} />
        </mesh>
        <mesh position={[0, 1.18, -0.42]} rotation={[-0.5, 0, 0]} scale={[1.1, 0.55, 0.7]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshPhysicalMaterial {...velvet} />
        </mesh>
        {[-0.4, 0.4].map((x) => (
          <mesh key={x} position={[x, 0.52, 0.02]} rotation={[1.15, 0, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.42, 6, 12]} />
            <meshPhysicalMaterial {...velvet} />
          </mesh>
        ))}
        <mesh position={[0, 0.28, 0.58]} rotation={[-0.35, 0, 0]} scale={[1.5, 0.38, 0.95]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshPhysicalMaterial {...velvet} />
        </mesh>
      </group>
      <mesh position={[0.7, 0.015, -1.85]} rotation={[-Math.PI / 2, 0, -0.2]}>
        <planeGeometry args={[1.7, 1.35]} />
        <meshStandardMaterial color="#4a1824" roughness={0.9} />
      </mesh>
      <group position={[-3.58, 0, -3.05]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.7, -0.16]}>
          <boxGeometry args={[2.7, 3.45, 0.06]} />
          <meshStandardMaterial {...wood} />
        </mesh>
        {[-1.32, 1.32].map((x) => (
          <mesh key={x} position={[x, 1.7, 0]}>
            <boxGeometry args={[0.06, 3.45, 0.36]} />
            <meshStandardMaterial {...wood} />
          </mesh>
        ))}
        {shelves.map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <boxGeometry args={[2.58, 0.045, 0.34]} />
            <meshStandardMaterial {...wood} />
          </mesh>
        ))}
        <mesh position={[0, 3.4, 0.02]}>
          <boxGeometry args={[2.85, 0.05, 0.08]} />
          <meshStandardMaterial color="#b7b1a8" metalness={0.72} roughness={0.28} />
        </mesh>
        {shelves.slice(0, 4).map((y) =>
          Array.from({ length: 16 }, (_, index) => {
            const height = 0.26 + ((index * 5) % 4) * 0.025;
            return (
              <mesh key={`${y}-${index}`} position={[-1.12 + index * 0.15, y + 0.03 + height / 2, -0.02]}>
                <boxGeometry args={[0.07, height, 0.22]} />
                <meshStandardMaterial color={spines[(index + Math.round(y)) % spines.length]} roughness={0.7} />
              </mesh>
            );
          }),
        )}
        <mesh position={[0, 3.22, 0.2]}>
          <planeGeometry args={[1.15, 0.22]} />
          <meshBasicMaterial map={plate} toneMapped={false} />
        </mesh>
        <pointLight position={[0.4, 2.1, 0.85]} color="#f4ead7" intensity={3.2} distance={4.5} decay={2} />
        {LIBRARY.map((book) => (
          <ShelfBook key={book.id} book={book} onOpen={onOpen} onFocus={(x) => { ladderX.current = x; }} />
        ))}
        <group ref={ladder} position={[-0.2, 0, 0.28]}>
          <mesh position={[0, 3.28, 0]}>
            <boxGeometry args={[0.28, 0.06, 0.08]} />
            <meshStandardMaterial color="#c5ccd2" metalness={0.8} roughness={0.25} />
          </mesh>
          {[-0.16, 0.16].map((x) => (
            <mesh key={x} position={[x, 1.65, 0]}>
              <boxGeometry args={[0.045, 3.15, 0.045]} />
              <meshStandardMaterial color="#6b4a32" roughness={0.5} />
            </mesh>
          ))}
          {[0.45, 0.95, 1.45, 1.95, 2.45, 2.9].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[0.32, 0.03, 0.03]} />
              <meshStandardMaterial color="#6b4a32" roughness={0.5} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

const STAGE = new Set(["set-chair.jpg", "set-director.jpg", "set-camera.jpg", "set-wood.jpg"]);

function HeroStage({ onOpen }: { onOpen: (id: string) => void }) {
  const panels = useMemo(() => panelTexture(), []);
  useEffect(() => () => panels.dispose(), [panels]);
  const byName = (name: string) => PLATES.find((plate) => plate.src.endsWith(name));
  const chair = byName("set-chair.jpg");
  const director = byName("set-director.jpg");
  const camera = byName("set-camera.jpg");

  return (
    <group>
      <mesh position={[0.2, 2.15, -4.9]}>
        <planeGeometry args={[8.4, 4.4]} />
        <meshStandardMaterial map={panels} roughness={0.82} metalness={0.02} />
      </mesh>
      <mesh position={[-4.0, 2.15, -2.7]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.4, 4.4]} />
        <meshStandardMaterial map={panels} roughness={0.82} metalness={0.02} />
      </mesh>
      <mesh position={[0.2, 0.07, -4.84]}>
        <boxGeometry args={[8.4, 0.14, 0.06]} />
        <meshStandardMaterial color="#2a241c" roughness={0.55} />
      </mesh>
      {chair ? <Plate plate={{ ...chair, x: 0.45, y: 2.25, z: -4.82, h: 2.2, aspect: 618 / 573 }} onOpen={onOpen} /> : null}
      {director ? <Plate plate={{ ...director, x: -2.05, y: 2.55, z: -4.82, h: 1.2, aspect: 659 / 413 }} onOpen={onOpen} /> : null}
      {camera ? <Plate plate={{ ...camera, x: 2.45, y: 2.3, z: -4.82, h: 1.85, aspect: 412 / 764 }} onOpen={onOpen} /> : null}
      <LibraryNook onOpen={onOpen} />
      <group position={[-1.7, 0, -2.6]}>
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.018, 0.022, 2.1, 8]} />
          <meshStandardMaterial color="#3a3428" metalness={0.45} roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.15, 0]}>
          <cylinderGeometry args={[0.16, 0.26, 0.32, 16]} />
          <meshStandardMaterial color="#e7c99a" emissive="#c47a32" emissiveIntensity={0.85} roughness={0.45} />
        </mesh>
        <pointLight position={[0, 2.05, 0.15]} color="#e7b56a" intensity={6} distance={6.5} decay={2} />
      </group>
    </group>
  );
}

function Plate({ plate, onOpen }: { plate: PlateSpec; onOpen: (id: string) => void }) {
  const tex = useImage(plate.src);
  const w = plate.h * plate.aspect;
  if (!tex) return null;
  return (
    <Clickable id={plate.src} onOpen={onOpen}>
      <group position={[plate.x, plate.y, plate.z]}>
        <mesh position={[0, 0, -0.03]}>
          <boxGeometry args={[w + 0.06, plate.h + 0.06, 0.04]} />
          <meshStandardMaterial color="#1a120e" roughness={0.5} metalness={0.15} />
        </mesh>
        <mesh>
          <planeGeometry args={[w, plate.h]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </Clickable>
  );
}

function CatalogPiece({
  item,
  x,
  z = -3.15,
  onOpen,
}: {
  item: GalleryItem;
  x: number;
  z?: number;
  onOpen: (id: string) => void;
}) {
  const tex = useImage(item.image);
  if (item.kind === "sculpture") {
    return (
      <Clickable id={item.id} onOpen={onOpen}>
        <group position={[x, 0, z]}>
          <mesh position={[0, 0.48, 0]}>
            <boxGeometry args={[0.78, 0.96, 0.78]} />
            <meshStandardMaterial color="#161311" roughness={0.42} metalness={0.08} />
          </mesh>
          {item.form === "mask" ? (
            <mesh position={[0, 1.32, 0]}>
              <sphereGeometry args={[0.32, 28, 20]} />
              <meshStandardMaterial color="#efeae2" roughness={0.35} />
            </mesh>
          ) : null}
          {item.form === "blade" ? (
            <mesh position={[0, 1.4, 0]} rotation={[0, 0, 0.12]}>
              <boxGeometry args={[0.05, 1.05, 0.16]} />
              <meshStandardMaterial color="#c5ccd2" metalness={0.8} roughness={0.2} />
            </mesh>
          ) : null}
          {item.form !== "mask" && item.form !== "blade" ? (
            <>
              <mesh position={[0, 1.4, 0]}>
                <cylinderGeometry args={[0.15, 0.2, 0.85, 18]} />
                <meshStandardMaterial color="#1a1816" metalness={0.3} roughness={0.45} />
              </mesh>
              <mesh position={[0, 1.95, 0]}>
                <sphereGeometry args={[0.15, 20, 14]} />
                <meshStandardMaterial color="#1a1816" metalness={0.3} roughness={0.45} />
              </mesh>
            </>
          ) : null}
        </group>
      </Clickable>
    );
  }
  if (item.kind === "exhibit") {
    return (
      <Clickable id={item.id} onOpen={onOpen}>
        <group position={[x, 0, z]}>
          <mesh position={[0, 0.36, 0]}>
            <boxGeometry args={[0.86, 0.72, 0.66]} />
            <meshStandardMaterial color="#2c261f" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.1, 0.02]}>
            <planeGeometry args={[0.48, 0.6]} />
            <meshStandardMaterial map={tex ?? undefined} color={tex ? "#ffffff" : "#4a433d"} />
          </mesh>
        </group>
      </Clickable>
    );
  }
  if (!tex) return null;
  return (
    <Clickable id={item.id} onOpen={onOpen}>
      <group position={[x, 1.62, z]}>
        <mesh position={[0, 0, -0.03]}>
          <boxGeometry args={[1.02, 1.36, 0.05]} />
          <meshStandardMaterial color="#1c140f" roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh>
          <planeGeometry args={[0.88, 1.2]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </Clickable>
  );
}

function DynamicLights() {
  const wall = useRef<THREE.SpotLight>(null);
  const plinth = useRef<THREE.SpotLight>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const wallTarget = useMemo(() => new THREE.Object3D(), []);
  const plinthTarget = useMemo(() => new THREE.Object3D(), []);
  const { camera } = useThree();

  useFrame((state) => {
    const x = camera.position.x;
    const flicker = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.035;
    if (wall.current) {
      wall.current.position.set(x, 4.85, -0.35);
      wall.current.intensity = 22 * flicker;
    }
    wallTarget.position.set(x, 2.85, -4.9);
    if (plinth.current) {
      plinth.current.position.set(x - 0.4, 3.35, 1.15);
      plinth.current.intensity = 14 * flicker;
    }
    plinthTarget.position.set(x, 0.45, -2.5);
    if (lamp.current) {
      lamp.current.position.set(x, 2.15, 1.8);
      lamp.current.intensity = 4.2 * flicker;
    }
  });

  return (
    <>
      <primitive object={wallTarget} />
      <primitive object={plinthTarget} />
      <spotLight ref={wall} target={wallTarget} angle={0.62} penumbra={0.55} color="#f6ead8" distance={18} decay={2} />
      <spotLight ref={plinth} target={plinthTarget} angle={0.5} penumbra={0.75} color="#f0d2a4" distance={11} decay={2} />
      <pointLight ref={lamp} color="#e7b56a" distance={9} decay={2} />
      <pointLight position={[20.5, 5.15, -2.4]} color="#f4ead7" intensity={5.5} distance={8} decay={2} />
      <pointLight position={[8.4, 2.2, -0.6]} color="#f3e2c8" intensity={3.5} distance={5.5} decay={2} />
      <pointLight position={[33.2, 2.2, -0.6]} color="#f3e2c8" intensity={3.5} distance={5.5} decay={2} />
      <pointLight position={[47.5, 2.1, -0.5]} color="#f3e2c8" intensity={3.2} distance={5.5} decay={2} />
      <hemisphereLight args={["#c4b09a", "#2a221c", 0.55]} />
    </>
  );
}

function MovieScreen() {
  const group = useRef<THREE.Group>(null);
  const { camera, gl, scene, size } = useThree();
  const renderer = useMemo(() => new CSS3DRenderer(), []);
  const screen = useMemo(() => {
    const iframe = document.createElement("iframe");
    iframe.className = "movie-screen";
    iframe.src = "https://www.youtube-nocookie.com/embed/LZKoYCWAp8I?rel=0&modestbranding=1&playsinline=1";
    iframe.title = "Gallery film";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    iframe.style.width = "960px";
    iframe.style.height = "540px";
    iframe.style.border = "0";
    iframe.style.pointerEvents = "none";
    const object = new CSS3DObject(iframe);
    const scale = 4.62 / 960;
    object.scale.set(scale, scale, scale);
    object.position.set(0, 0, 0.07);
    return object;
  }, []);

  useEffect(() => {
    const layer = renderer.domElement;
    layer.style.position = "fixed";
    layer.style.inset = "0";
    layer.style.zIndex = "3";
    layer.style.pointerEvents = "none";
    document.body.appendChild(layer);
    return () => {
      layer.remove();
    };
  }, [renderer]);

  useFrame(() => {
    const anchor = group.current;
    const rect = gl.domElement.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || size.width));
    const height = Math.max(1, Math.round(rect.height || size.height));
    if (renderer.getSize().width !== width || renderer.getSize().height !== height) renderer.setSize(width, height);
    if (anchor) {
      const normal = new THREE.Vector3(0, 0, 1).transformDirection(anchor.matrixWorld);
      const center = anchor.getWorldPosition(new THREE.Vector3());
      const facing = normal.dot(camera.position.clone().sub(center));
      const galleryOn = document.documentElement.classList.contains("is-gallery");
      screen.element.style.visibility = facing > 0.2 ? "visible" : "hidden";
      screen.element.style.pointerEvents = galleryOn && facing > 0.2 ? "auto" : "none";
    }
    renderer.render(scene, camera);
  });

  return (
    <group ref={group} position={[20.5, 4.6, -4.82]}>
      <mesh>
        <boxGeometry args={[4.9, 2.78, 0.06]} />
        <meshStandardMaterial color="#120e0c" roughness={0.4} metalness={0.4} />
      </mesh>
      <primitive object={screen} />
    </group>
  );
}

function chapelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const g = canvas.getContext("2d");
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (!g) return tex;
  g.fillStyle = "#cbb496";
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 500; i += 1) {
    g.fillStyle = `rgba(80, 50, 30, ${Math.random() * 0.06})`;
    g.fillRect(Math.random() * 1024, Math.random() * 1024, 40, 6);
  }
  const figure = (x: number, y: number, scale: number, robe: string) => {
    g.fillStyle = "#e7d3b8";
    g.beginPath();
    g.ellipse(x, y - 46 * scale, 18 * scale, 22 * scale, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = robe;
    g.beginPath();
    g.moveTo(x - 34 * scale, y);
    g.quadraticCurveTo(x - 8 * scale, y + 120 * scale, x + 36 * scale, y + 4 * scale);
    g.quadraticCurveTo(x + 4 * scale, y + 48 * scale, x - 34 * scale, y);
    g.fill();
  };
  const hand = (x: number, y: number, dir: number) => {
    g.save();
    g.translate(x, y);
    g.rotate(dir);
    g.fillStyle = "#e4cbb0";
    g.fillRect(-80, -9, 100, 18);
    g.beginPath();
    g.ellipse(28, 0, 20, 14, 0, 0, Math.PI * 2);
    g.fill();
    for (let i = 0; i < 4; i += 1) g.fillRect(36, -14 + i * 8, 24, 5);
    g.restore();
  };
  const panels = [
    [36, 36, 460, 460],
    [528, 36, 460, 460],
    [36, 528, 460, 460],
    [528, 528, 460, 460],
  ];
  panels.forEach(([x, y, w, h]) => {
    g.strokeStyle = "#8a5a32";
    g.lineWidth = 16;
    g.strokeRect(x, y, w, h);
    g.strokeStyle = "#f0e2c4";
    g.lineWidth = 5;
    g.strokeRect(x + 18, y + 18, w - 36, h - 36);
  });
  hand(180, 250, -0.35);
  hand(360, 270, 2.7);
  figure(760, 250, 1.15, "#6e2438");
  figure(250, 760, 1.2, "#1d3d5c");
  figure(760, 780, 1.05, "#8a6232");
  g.fillStyle = "#6e2438";
  g.fillRect(470, 0, 84, 1024);
  g.fillStyle = "#e6d2a2";
  g.fillRect(500, 0, 24, 1024);
  return tex;
}

function shelfTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const g = canvas.getContext("2d");
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  if (!g) return tex;
  g.fillStyle = "#2a2118";
  g.fillRect(0, 0, 512, 128);
  const colors = ["#1c140f", "#3d1a22", "#4a3a28", "#14201c", "#5a2a32", "#241810", "#6a5438", "#101418", "#2c241c", "#6e2433"];
  let x = 0;
  let i = 0;
  while (x < 512) {
    const w = 14 + (i % 5) * 4;
    g.fillStyle = colors[i % colors.length];
    g.fillRect(x, 6, w - 2, 116);
    g.fillStyle = "rgba(198, 161, 90, 0.85)";
    g.fillRect(x + 2, 12, w - 6, 4);
    x += w;
    i += 1;
  }
  return tex;
}

function BookWall({
  position,
  rotation,
  length,
  tex,
  withGallery = false,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
  tex: THREE.Texture;
  withGallery?: boolean;
}) {
  const height = 17.6;
  const lower = [0.4, 0.95, 1.5, 2.05];
  const upper = [3.6, 4.75, 5.9, 7.05, 8.2, 9.35, 10.5, 11.65, 12.8, 13.95, 15.1, 16.25];
  const levels = withGallery ? [...lower, ...upper] : [0.5, 1.7, 2.9, 4.1, 5.3, 6.5, 7.7, 8.9, 10.1, 11.3, 12.5, 13.7, 14.9, 16.1];
  const map = useMemo(() => {
    const copy = tex.clone();
    copy.repeat.set(Math.max(4, length / 1.8), 1);
    copy.needsUpdate = true;
    return copy;
  }, [tex, length]);
  const bays = Math.max(4, Math.round(length / 2.6));
  const wood = { color: "#3a291c", roughness: 0.5 };
  const stone = { color: "#e7e1d6", roughness: 0.38 };
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, height / 2, -0.18]}>
        <boxGeometry args={[length, height, 0.08]} />
        <meshStandardMaterial {...wood} />
      </mesh>
      {Array.from({ length: bays + 1 }, (_, index) => (
        <mesh key={index} position={[-length / 2 + (index * length) / bays, height / 2, 0]}>
          <boxGeometry args={[0.07, height - 0.1, 0.36]} />
          <meshStandardMaterial {...wood} />
        </mesh>
      ))}
      {levels.map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0]}>
            <boxGeometry args={[length - 0.08, 0.045, 0.32]} />
            <meshStandardMaterial color="#4a3828" roughness={0.48} />
          </mesh>
          <mesh position={[0, y + 0.2, 0.04]}>
            <planeGeometry args={[length - 0.2, 0.34]} />
            <meshStandardMaterial map={map} roughness={0.72} />
          </mesh>
        </group>
      ))}
      {withGallery ? (
        <>
          <mesh position={[0, 2.7, 0.48]}>
            <boxGeometry args={[length - 0.12, 0.08, 0.95]} />
            <meshStandardMaterial color="#4a3828" roughness={0.46} />
          </mesh>
          <mesh position={[0, 3.28, 0.92]}>
            <boxGeometry args={[length - 0.1, 0.055, 0.055]} />
            <meshStandardMaterial color="#d9d3c8" metalness={0.35} roughness={0.4} />
          </mesh>
          {Array.from({ length: bays + 1 }, (_, index) => (
            <mesh key={`rail-${index}`} position={[-length / 2 + (index * length) / bays, 3.02, 0.92]}>
              <boxGeometry args={[0.045, 0.52, 0.045]} />
              <meshStandardMaterial {...stone} />
            </mesh>
          ))}
          {Array.from({ length: bays }, (_, index) => {
            const x = -length / 2 + ((index + 0.5) * length) / bays;
            return (
              <group key={`bust-${index}`} position={[x, 2.8, 0.18]}>
                <mesh position={[0, 0.1, 0]}>
                  <cylinderGeometry args={[0.07, 0.09, 0.18, 8]} />
                  <meshStandardMaterial {...stone} />
                </mesh>
                {index % 2 === 0 ? (
                  <mesh position={[0, 0.28, 0]}>
                    <sphereGeometry args={[0.09, 12, 10]} />
                    <meshStandardMaterial color="#f3eee6" roughness={0.32} />
                  </mesh>
                ) : (
                  <mesh position={[0, 0.28, 0]}>
                    <cylinderGeometry args={[0.04, 0.07, 0.14, 8]} />
                    <meshStandardMaterial {...stone} />
                  </mesh>
                )}
              </group>
            );
          })}
        </>
      ) : null}
      <mesh position={[0, height - 0.1, 0.12]}>
        <boxGeometry args={[length, 0.16, 0.22]} />
        <meshStandardMaterial color="#e6d7b8" roughness={0.48} />
      </mesh>
    </group>
  );
}

function RollingLadder({ x }: { x: number }) {
  return (
    <group position={[x, 0, 7.85]}>
      <mesh position={[0, 2.72, 0.15]}>
        <boxGeometry args={[0.36, 0.05, 0.08]} />
        <meshStandardMaterial color="#c5ccd2" metalness={0.8} roughness={0.25} />
      </mesh>
      {[-0.16, 0.16].map((side) => (
        <mesh key={side} position={[side, 1.35, 0]}>
          <boxGeometry args={[0.045, 2.7, 0.045]} />
          <meshStandardMaterial color="#6b4a32" roughness={0.48} />
        </mesh>
      ))}
      {[0.4, 0.85, 1.3, 1.75, 2.2, 2.6].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[0.34, 0.03, 0.03]} />
          <meshStandardMaterial color="#6b4a32" roughness={0.48} />
        </mesh>
      ))}
    </group>
  );
}

function Chesterfield({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const cloth = useMemo(() => fabricTexture(), []);
  const velvet = { color: "#4e1420", roughness: 0.86, metalness: 0, sheen: 1, sheenColor: "#e7a0a4", sheenRoughness: 0.45, roughnessMap: cloth };
  const seat = useMemo(() => new RoundedBoxGeometry(1.72, 0.2, 0.66, 4, 0.08), []);
  const back = useMemo(() => new RoundedBoxGeometry(1.72, 0.58, 0.2, 4, 0.08), []);
  const rail = useMemo(() => new RoundedBoxGeometry(1.7, 0.07, 0.62, 2, 0.02), []);
  useEffect(() => () => {
    cloth.dispose();
    seat.dispose();
    back.dispose();
    rail.dispose();
  }, [back, cloth, rail, seat]);
  const buttons = [-0.52, -0.17, 0.17, 0.52].flatMap((x) => [-0.1, 0.12].map((y) => [x, y] as const));
  return (
    <group position={position} rotation={rotation}>
      {[-0.72, 0.72].flatMap((x) => [-0.22, 0.24].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.16, z]} castShadow>
          <cylinderGeometry args={[0.04, 0.055, 0.32, 12]} />
          <meshStandardMaterial color="#2a1c14" roughness={0.45} />
        </mesh>
      )))}
      <mesh geometry={rail} position={[0, 0.34, 0.02]} castShadow receiveShadow>
        <meshStandardMaterial color="#1a120e" roughness={0.5} />
      </mesh>
      <mesh geometry={seat} position={[0, 0.48, 0.06]} castShadow>
        <meshPhysicalMaterial {...velvet} />
      </mesh>
      <mesh geometry={back} position={[0, 0.82, -0.22]} rotation={[-0.16, 0, 0]} castShadow>
        <meshPhysicalMaterial {...velvet} />
      </mesh>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.6, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.58, 8, 16]} />
          <meshPhysicalMaterial {...velvet} />
        </mesh>
      ))}
      {buttons.map(([x, y]) => (
        <mesh key={`${x}-${y}`} position={[x, 0.82 + y, -0.11]}>
          <sphereGeometry args={[0.022, 10, 8]} />
          <meshStandardMaterial color="#c6a15a" metalness={0.72} roughness={0.28} />
        </mesh>
      ))}
    </group>
  );
}

function LibraryLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.06, 10]} />
        <meshStandardMaterial color="#2a241c" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.015, 0.018, 1.55, 8]} />
        <meshStandardMaterial color="#b7a48a" metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.62, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.13, 0.22, 24, 1, true]} />
        <meshStandardMaterial color="#f3e6cf" emissive="#c47a32" emissiveIntensity={0.35} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 1.5, 0]} color="#e7b56a" intensity={1.8} distance={3.8} decay={2} />
    </group>
  );
}

function orientalRug() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const g = canvas.getContext("2d");
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  if (!g) return tex;
  g.fillStyle = "#7a1c28";
  g.fillRect(0, 0, 1024, 1024);
  const frame = (inset: number, color: string, width: number) => {
    g.strokeStyle = color;
    g.lineWidth = width;
    g.strokeRect(inset, inset, 1024 - inset * 2, 1024 - inset * 2);
  };
  frame(18, "#1c2744", 28);
  frame(52, "#f0e2c4", 10);
  frame(70, "#1c2744", 6);
  frame(84, "#c6a15a", 4);
  frame(96, "#f3ead8", 8);
  const rosette = (x: number, y: number, r: number, petal: string) => {
    g.fillStyle = petal;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.38, r * 0.18, a, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#f3ead8";
    g.beginPath();
    g.arc(x, y, r * 0.22, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#1c2744";
    g.beginPath();
    g.arc(x, y, r * 0.08, 0, Math.PI * 2);
    g.fill();
  };
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      if (row === 2 && col === 2) continue;
      rosette(180 + col * 166, 180 + row * 166, 28, (row + col) % 2 ? "#1c2744" : "#c6a15a");
    }
  }
  rosette(512, 512, 92, "#f0e2c4");
  g.strokeStyle = "#1c2744";
  g.lineWidth = 8;
  g.beginPath();
  g.arc(512, 512, 150, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = "#c6a15a";
  g.lineWidth = 3;
  g.beginPath();
  g.arc(512, 512, 168, 0, Math.PI * 2);
  g.stroke();
  [[160, 160], [864, 160], [160, 864], [864, 864]].forEach(([x, y]) => {
    g.fillStyle = "#1c2744";
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + 70, y + 10, x + 90, y + 80);
    g.quadraticCurveTo(x + 20, y + 40, x, y);
    g.fill();
  });
  return tex;
}

function LibraryHall({ onOpen }: { onOpen: (id: string) => void }) {
  const books = useMemo(() => shelfTexture(), []);
  const fresco = useMemo(() => chapelTexture(), []);
  const rug = useMemo(() => orientalRug(), []);
  useEffect(() => () => {
    books.dispose();
    fresco.dispose();
    rug.dispose();
  }, [books, fresco, rug]);
  const plaster = { map: fresco, emissiveMap: fresco, emissive: "#fff4e4", emissiveIntensity: 0.34, color: "#fff8ee", roughness: 0.62, metalness: 0, side: THREE.DoubleSide };
  return (
    <group>
      <BookWall position={[21.5, 0, 9.1]} rotation={[0, Math.PI, 0]} length={54} tex={books} withGallery />
      <NorthExhibit tex={books} />
      <BookWall position={[-5.9, 0, 1.5]} rotation={[0, Math.PI / 2, 0]} length={15.2} tex={books} withGallery />
      <BookWall position={[48.6, 0, 1.5]} rotation={[0, -Math.PI / 2, 0]} length={15.2} tex={books} withGallery />
      <mesh position={[5.75, 18.05, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[23.5, 15.8]} />
        <meshStandardMaterial {...plaster} />
      </mesh>
      <mesh position={[37.25, 18.05, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[23.5, 15.8]} />
        <meshStandardMaterial {...plaster} />
      </mesh>
      <mesh position={[21.5, 18.05, -3.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 5.8]} />
        <meshStandardMaterial {...plaster} />
      </mesh>
      <mesh position={[21.5, 18.05, 6.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 5.8]} />
        <meshStandardMaterial {...plaster} />
      </mesh>
      <mesh position={[21.5, 18.22, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.5, 4.2]} />
        <meshStandardMaterial color="#9eb4c4" emissive="#1a2430" emissiveIntensity={0.18} roughness={0.2} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[21.5, 18.12, 1.5]}>
        <boxGeometry args={[7.7, 0.08, 0.08]} />
        <meshStandardMaterial color="#c6a15a" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[21.5, 18.12, 1.5]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[4.4, 0.08, 0.08]} />
        <meshStandardMaterial color="#c6a15a" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[17.6, 18.1, 1.5]}>
        <boxGeometry args={[0.12, 0.16, 4.4]} />
        <meshStandardMaterial color="#8a5a32" roughness={0.45} />
      </mesh>
      <mesh position={[25.4, 18.1, 1.5]}>
        <boxGeometry args={[0.12, 0.16, 4.4]} />
        <meshStandardMaterial color="#8a5a32" roughness={0.45} />
      </mesh>
      <mesh position={[21.5, 18.1, -0.6]}>
        <boxGeometry args={[7.9, 0.16, 0.12]} />
        <meshStandardMaterial color="#8a5a32" roughness={0.45} />
      </mesh>
      <mesh position={[21.5, 18.1, 3.6]}>
        <boxGeometry args={[7.9, 0.16, 0.12]} />
        <meshStandardMaterial color="#8a5a32" roughness={0.45} />
      </mesh>
      <directionalLight position={[21.5, 24, 1.5]} intensity={0.9} color="#f7f1e4" />
      <pointLight position={[21.5, 15.2, 1.5]} color="#fff4e0" intensity={12} distance={28} decay={2} />
      <Vitrine position={[13.4, 0, 3.5]} />
      <Vitrine position={[30.2, 0, 3.5]} />
      <RollingLadder x={8} />
      <RollingLadder x={21.5} />
      <RollingLadder x={34} />
      <group position={[21.5, 0, 1.5]}>
        <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 28]} />
          <meshStandardMaterial color="#4a3424" roughness={0.38} metalness={0.06} />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.1, 0.72, 12]} />
          <meshStandardMaterial color="#3a291c" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.28, 0.22, 0.06, 16]} />
          <meshStandardMaterial color="#2a1c14" roughness={0.5} />
        </mesh>
        <mesh position={[0.18, 0.92, 0]}>
          <sphereGeometry args={[0.16, 20, 14]} />
          <meshStandardMaterial color="#1d3d5c" roughness={0.35} />
        </mesh>
        <mesh position={[0.18, 0.78, 0]}>
          <cylinderGeometry args={[0.04, 0.07, 0.1, 10]} />
          <meshStandardMaterial color="#c6a15a" metalness={0.45} roughness={0.35} />
        </mesh>
      </group>
      <mesh position={[21.5, 0.03, 1.55]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[11.5, 7.2]} />
        <meshStandardMaterial map={rug} roughness={0.94} />
      </mesh>
      <mesh position={[20.5, 0.03, -2.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 2.6]} />
        <meshStandardMaterial map={rug} roughness={0.94} />
      </mesh>
      <mesh position={[0.75, 0.03, -1.8]} rotation={[-Math.PI / 2, 0, 0.2]} receiveShadow>
        <planeGeometry args={[2.4, 1.7]} />
        <meshStandardMaterial map={rug} roughness={0.94} />
      </mesh>
      <group position={[21.5, 0, 9.1]} rotation={[0, Math.PI, 0]}>
        {CATALOG.map((book) => (
          <ShelfBook key={book.id} book={book} onOpen={onOpen} onFocus={() => {}} />
        ))}
      </group>
      <Chesterfield position={[21.5, 0, 0.15]} />
      <Chesterfield position={[21.5, 0, 2.85]} rotation={[0, Math.PI, 0]} />
      <ContactShadow position={[21.5, 0.045, 0.15]} size={[2.8, 1.35]} />
      <ContactShadow position={[21.5, 0.045, 2.85]} size={[2.8, 1.35]} />
      <LibraryLamp position={[18.2, 0, 0.45]} />
      <LibraryLamp position={[24.8, 0, 2.65]} />
      <ContactShadow position={[18.2, 0.045, 0.45]} size={[0.7, 0.7]} />
      <ContactShadow position={[24.8, 0.045, 2.65]} size={[0.7, 0.7]} />
      <mesh position={[21.5, 0.84, 1.5]}>
        <cylinderGeometry args={[0.05, 0.07, 0.14, 8]} />
        <meshStandardMaterial color="#6e2433" roughness={0.35} metalness={0.15} />
      </mesh>
      {Array.from({ length: 8 }, (_, step) => (
        <mesh key={step} position={[1.15, 0.18 + step * 0.32, 6.35 + step * 0.24]}>
          <boxGeometry args={[0.95, 0.16, 0.28]} />
          <meshStandardMaterial color="#4a3828" roughness={0.48} />
        </mesh>
      ))}
    </group>
  );
}

function NorthExhibit({ tex }: { tex: THREE.Texture }) {
  const map = useMemo(() => {
    const copy = tex.clone();
    copy.repeat.set(26, 1);
    copy.needsUpdate = true;
    return copy;
  }, [tex]);
  const shelves = [6.4, 7.6, 8.8, 10, 11.2, 12.4, 13.6, 14.8, 16];
  return (
    <group position={[21.5, 0, -5.95]}>
      <mesh position={[0, 2.85, 0.06]}>
        <boxGeometry args={[54, 5.7, 0.1]} />
        <meshStandardMaterial color="#14110f" roughness={0.88} />
      </mesh>
      <mesh position={[0, 11.6, -0.04]}>
        <boxGeometry args={[54, 11.2, 0.08]} />
        <meshStandardMaterial color="#3a291c" roughness={0.5} />
      </mesh>
      {shelves.map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0.1]}>
            <boxGeometry args={[53.6, 0.05, 0.28]} />
            <meshStandardMaterial color="#4a3828" roughness={0.48} />
          </mesh>
          <mesh position={[0, y + 0.22, 0.16]}>
            <planeGeometry args={[53.4, 0.36]} />
            <meshStandardMaterial map={map} roughness={0.72} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Vitrine({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.84, 0.58]} />
        <meshStandardMaterial color="#241c16" roughness={0.42} metalness={0.12} />
      </mesh>
      <mesh position={[0, 1.12, 0]}>
        <boxGeometry args={[1.08, 0.52, 0.5]} />
        <meshPhysicalMaterial color="#e8eef2" roughness={0.04} metalness={0} transmission={0.92} thickness={0.18} ior={1.48} transparent />
      </mesh>
      <mesh position={[0, 1.08, 0]}>
        <boxGeometry args={[0.62, 0.06, 0.26]} />
        <meshStandardMaterial color="#6e2433" roughness={0.4} />
      </mesh>
    </group>
  );
}

function SalonLights() {
  const targets = useMemo(() => [0, 1, 2, 3].map(() => new THREE.Object3D()), []);
  return (
    <group>
      {targets.map((target, index) => {
        const x = 16.4 + index * 2.75;
        return (
          <group key={index}>
            <primitive object={target} position={[x, 1.5, -4.9]} />
            <spotLight position={[x, 4.05, -3.4]} target={target} angle={0.38} penumbra={0.65} intensity={7} distance={7.5} color="#f4e6cf" decay={2} />
            <mesh position={[x, 4.15, -4.55]}>
              <boxGeometry args={[0.42, 0.035, 0.1]} />
              <meshStandardMaterial color="#c6a15a" metalness={0.62} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Scene({ onOpen }: { onOpen: (id: string) => void }) {
  const portraits = stars.map((star) => ({
    id: star.name,
    kind: "painting" as const,
    title: star.name,
    credit: star.origin,
    year: "",
    detail: star.body,
    wall: "north" as const,
    along: 0,
    image: star.image,
  }));
  const objects = gallery.filter((item) => item.kind !== "painting");
  const portraitStart = 15.45;
  const portraitEnd = 25.55;
  const step = portraits.length > 1 ? (portraitEnd - portraitStart) / (portraits.length - 1) : 0;

  return (
    <>
      <fog attach="fog" args={["#090807", 22, 52]} />
      <ambientLight intensity={0.22} color="#f0e2cc" />
      <DynamicLights />
      <RoomSun />
      <ImageLighting />
      <LightingPass />
      <CameraRig />
      <Floor />
      <LibraryHall onOpen={onOpen} />
      <Curtains />
      <HeroStage onOpen={onOpen} />
      {PLATES.filter((plate) => !STAGE.has(plate.src.slice(plate.src.lastIndexOf("/") + 1))).map((plate) => (
        <Plate key={plate.src} plate={plate} onOpen={onOpen} />
      ))}
      {portraits.map((item, index) => (
        <CatalogPiece key={item.id} item={item} x={portraitStart + step * index} z={-4.85} onOpen={onOpen} />
      ))}
      <MovieScreen />
      <SalonLights />
      {objects.map((item) => {
        const spot = OBJECT_SPOTS[item.id] ?? [20, -2.5];
        return <CatalogPiece key={item.id} item={item} x={spot[0]} z={spot[1]} onOpen={onOpen} />;
      })}
    </>
  );
}

function Dialog({ piece, onClose }: { piece: Piece; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="gallery-dialog" role="presentation" onClick={onClose}>
      <article className="gallery-card" role="dialog" aria-modal="true" aria-labelledby="gallery-title" onClick={(event) => event.stopPropagation()}>
        <p className="gallery-kicker">{piece.kind} · {piece.year}</p>
        <h2 id="gallery-title">{piece.title}</h2>
        <p className="gallery-credit">{piece.credit}</p>
        {piece.image ? <img src={piece.image} alt="" /> : null}
        <p>{piece.detail}</p>
        <button type="button" className="gallery-close" onClick={onClose}>Close</button>
      </article>
    </div>
  );
}

export default function LodgeCanvas() {
  const [openId, setOpenId] = useState<string | null>(null);
  const plate = PLATES.find((item) => item.src === openId);
  const star = stars.find((item) => item.name === openId);
  const extra = gallery.find((item) => item.id === openId);
  const book = LIBRARY.find((item) => item.id === openId) ?? CATALOG.find((item) => item.id === openId);
  const piece: Piece | null = plate
    ? { id: plate.src, kind: "plate", title: plate.title, credit: "Room still", year: "Reference", detail: plate.detail, image: plate.src }
    : star
      ? { id: star.name, kind: "painting", title: star.name, credit: star.origin, year: "", detail: star.body, image: star.image }
      : extra
        ? { id: extra.id, kind: extra.kind, title: extra.title, credit: extra.credit, year: extra.year, detail: extra.detail, image: extra.image }
        : book
          ? { id: book.id, kind: "book", title: book.title, credit: book.credit, year: book.year, detail: book.detail }
          : null;

  return (
    <>
      <Canvas className="lodge-canvas" camera={{ position: [0.2, 1.62, 2.05], fov: 42, near: 0.1, far: 90 }} dpr={[1, 1.25]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
        <Scene onOpen={setOpenId} />
      </Canvas>
      {piece ? createPortal(<Dialog piece={piece} onClose={() => setOpenId(null)} />, document.body) : null}
    </>
  );
}
