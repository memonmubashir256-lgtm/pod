import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ChevronDown, ChevronUp, Pause, Play, RotateCcw } from 'lucide-react';
import {
  FINISH_LIST,
  FINISH_OPTIONS,
  HOTSPOTS,
  type FinishOption,
  type HotspotSpec,
} from '../data/catalog';
import { clampExplodedAmount, getHotspotCameraPreset } from '../utils/valenceLogic';

// Pre-allocated scratch helpers outside render loop (zero GC)
const _projVec = new THREE.Vector3();
const _targetPos = new THREE.Vector3();

interface HotspotScreenPos {
  id: HotspotSpec['id'];
  x: number;
  y: number;
  visible: boolean;
}

interface Capsule3DCanvasProps {
  finishId: FinishOption['id'];
  onChangeFinish: (id: FinishOption['id']) => void;
  activeHotspotId: HotspotSpec['id'];
  onSelectHotspot: (id: HotspotSpec['id']) => void;
  reducedMotion: boolean;
  onDiscoverProduct: () => void;
}

function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) {
    const shade = 115 + Math.floor(Math.sin(y * 0.7) * 16 + (y % 4) * 5);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(0, y, 256, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 6);
  return tex;
}

function createParticleSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(130,220,255,0.65)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
  grad.addColorStop(0, 'rgba(81, 244, 232, 0.22)');
  grad.addColorStop(0.45, 'rgba(180, 76, 255, 0.12)');
  grad.addColorStop(1, 'rgba(5, 5, 5, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const Capsule3DCanvas: React.FC<Capsule3DCanvasProps> = ({
  finishId,
  onChangeFinish,
  activeHotspotId,
  onSelectHotspot,
  reducedMotion,
  onDiscoverProduct,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(!reducedMotion);
  const [exploded, setExploded] = useState(0.28);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [hotspotPositions, setHotspotPositions] = useState<HotspotScreenPos[]>([]);

  // Refs read inside animation loop without recreating renderer
  const finishRef = useRef(finishId);
  const isPlayingRef = useRef(isPlaying);
  const explodedTargetRef = useRef(exploded);
  const reducedMotionRef = useRef(reducedMotion);
  const cameraPresetRef = useRef<{
    active: boolean;
    yaw: number;
    pitch: number;
    zoom: number;
  }>({
    active: false,
    yaw: 0.4,
    pitch: 0.22,
    zoom: 4.5,
  });
  const requestRenderRef = useRef<() => void>(() => {});

  useEffect(() => {
    finishRef.current = finishId;
    requestRenderRef.current();
  }, [finishId]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    requestRenderRef.current();
  }, [isPlaying]);

  useEffect(() => {
    explodedTargetRef.current = exploded;
    requestRenderRef.current();
  }, [exploded]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    if (reducedMotion) {
      setIsPlaying(false);
    }
  }, [reducedMotion]);

  const focusHotspot = (id: HotspotSpec['id']) => {
    onSelectHotspot(id);
    const preset = getHotspotCameraPreset(id);
    cameraPresetRef.current = {
      active: true,
      yaw: preset.yaw,
      pitch: preset.pitch,
      zoom: preset.zoom,
    };
    if (id === 'seal' || id === 'cap') {
      setExploded((prev) => Math.max(prev, 0.45));
    }
    requestRenderRef.current();
  };

  useEffect(() => {
    const mount = canvasMountRef.current;
    const container = containerRef.current;
    if (!mount || !container) return;

    // Probe Software WebGL (SwiftShader/llvmpipe/WARP)
    const isSoftwareGl = (() => {
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: true,
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const handleContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.065);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(1.95, 0.85, 4.35);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.6;
    controls.maxDistance = 7.0;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI - 0.35;
    controls.target.set(0, 0.05, 0);

    controls.addEventListener('start', () => {
      cameraPresetRef.current.active = false;
    });

    // Studio Lighting Rig (warm/cool contrast + neon rim)
    const hemiLight = new THREE.HemisphereLight(0x6b9fff, 0x1a0b2e, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1e0, 2.3);
    keyLight.position.set(3.5, 4.5, 4.0);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 14;
      keyLight.shadow.camera.left = -2.5;
      keyLight.shadow.camera.right = 2.5;
      keyLight.shadow.camera.top = 2.5;
      keyLight.shadow.camera.bottom = -2.5;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimPurple = new THREE.DirectionalLight(0xb44cff, 2.0);
    rimPurple.position.set(-4, 2.2, -3);
    scene.add(rimPurple);

    const rimCyan = new THREE.DirectionalLight(0x51f4e8, 1.8);
    rimCyan.position.set(3.8, -1.2, -3.5);
    scene.add(rimCyan);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xffffff, 2.8, 2.4, 4.2);
      softbox.position.set(-2.8, 1.5, 2.5);
      softbox.lookAt(0, 0, 0);
      scene.add(softbox);
    }

    // Procedural textures
    const brushedTex = createBrushedMetalTexture();
    brushedTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const particleTex = createParticleSpriteTexture();
    const shadowTex = createContactShadowTexture();

    // Materials
    const initialFinish = FINISH_OPTIONS[finishRef.current];
    const hullMaterial = new THREE.MeshPhysicalMaterial({
      color: initialFinish.metalColor,
      metalness: 0.88,
      roughness: 0.22,
      clearcoat: 0.92,
      clearcoatRoughness: 0.12,
      anisotropy: 0.8,
      bumpMap: brushedTex,
      bumpScale: 0.008,
    });

    const collarMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1d26,
      metalness: 0.85,
      roughness: 0.36,
    });

    const innerGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdff8ff,
      metalness: 0.05,
      roughness: 0.12,
      transmission: isSoftwareGl ? 0 : 0.78,
      transparent: true,
      opacity: isSoftwareGl ? 0.42 : 0.92,
      ior: 1.52,
      thickness: 0.4,
      depthWrite: false,
    });

    const sealMaterial = new THREE.MeshStandardMaterial({
      color: initialFinish.sealColor,
      emissive: initialFinish.sealColor,
      emissiveIntensity: 0.85,
      roughness: 0.45,
      metalness: 0.1,
    });

    const valveAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0x51f4e8,
      emissive: 0x426bff,
      emissiveIntensity: 0.9,
      metalness: 0.65,
      roughness: 0.25,
    });

    // Composite 8-Part Capsule Group
    const capsuleGroup = new THREE.Group();
    capsuleGroup.rotation.z = -0.18;
    scene.add(capsuleGroup);

    // 1. LatheGeometry Outer Hull (machined bevel profile)
    const hullPoints = [
      new THREE.Vector2(0.0, -1.2),
      new THREE.Vector2(0.36, -1.2),
      new THREE.Vector2(0.44, -1.12),
      new THREE.Vector2(0.44, -0.95),
      new THREE.Vector2(0.415, -0.92),
      new THREE.Vector2(0.44, -0.89),
      new THREE.Vector2(0.44, 0.82),
      new THREE.Vector2(0.46, 0.86),
      new THREE.Vector2(0.46, 1.05),
      new THREE.Vector2(0.41, 1.08),
      new THREE.Vector2(0.37, 1.08),
    ];
    const hullGeo = new THREE.LatheGeometry(hullPoints, 48);
    const hullMesh = new THREE.Mesh(hullGeo, hullMaterial);
    hullMesh.castShadow = !isSoftwareGl;
    hullMesh.receiveShadow = !isSoftwareGl;
    capsuleGroup.add(hullMesh);

    // 2. Knurled Grip Band
    const gripGeo = new THREE.CylinderGeometry(0.446, 0.446, 0.42, 48, 1, true);
    const gripMesh = new THREE.Mesh(gripGeo, collarMaterial);
    gripMesh.position.y = -0.25;
    capsuleGroup.add(gripMesh);

    // 3. Base End-Cap Medallion (slides downward in exploded view)
    const baseCapGroup = new THREE.Group();
    const baseMedallionGeo = new THREE.CylinderGeometry(0.38, 0.34, 0.1, 40);
    const baseMedallion = new THREE.Mesh(baseMedallionGeo, collarMaterial);
    baseMedallion.position.y = -1.23;
    const baseGlowRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.015, 16, 48),
      sealMaterial
    );
    baseGlowRing.rotation.x = Math.PI / 2;
    baseGlowRing.position.y = -1.19;
    baseCapGroup.add(baseMedallion, baseGlowRing);
    capsuleGroup.add(baseCapGroup);

    // 4. Inner Borosilicate Core Sleeve (rises out in exploded view)
    const innerCoreGroup = new THREE.Group();
    const coreGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.95, 36);
    const coreMesh = new THREE.Mesh(coreGeo, innerGlassMaterial);
    coreMesh.position.y = 0.05;
    coreMesh.renderOrder = 2;
    const coreRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.355, 0.018, 16, 40),
      collarMaterial
    );
    coreRing.rotation.x = Math.PI / 2;
    coreRing.position.y = 1.02;
    innerCoreGroup.add(coreMesh, coreRing);
    capsuleGroup.add(innerCoreGroup);

    // 5. Platinum Silicone Hermetic Seal Pad (lifts above rim)
    const sealGroup = new THREE.Group();
    const sealTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.365, 0.042, 20, 48),
      sealMaterial
    );
    sealTorus.rotation.x = Math.PI / 2;
    sealTorus.position.y = 1.1;
    const sealDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.035, 36),
      sealMaterial
    );
    sealDisc.position.y = 1.11;
    sealGroup.add(sealTorus, sealDisc);
    capsuleGroup.add(sealGroup);

    // 6. Micro-Air Pressure Release Valve Assembly on upper collar
    const valveGroup = new THREE.Group();
    const valveHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.095, 0.09, 24),
      collarMaterial
    );
    valveHousing.rotation.z = -Math.PI / 2;
    valveHousing.position.set(0.46, 0.94, 0);
    const valveCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.11, 20),
      valveAccentMaterial
    );
    valveCore.rotation.z = -Math.PI / 2;
    valveCore.position.set(0.47, 0.94, 0);
    valveGroup.add(valveHousing, valveCore);
    capsuleGroup.add(valveGroup);

    // 7. Hinged Collar Knuckle
    const hingeLug = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.16, 0.14),
      collarMaterial
    );
    hingeLug.position.set(0.45, 1.09, 0);
    capsuleGroup.add(hingeLug);

    // 8. Pivoting Acoustic Pop-Cap Dome (pivots from hinge at x=0.45, y=1.14)
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0.45, 1.14, 0);
    const lidPoints = [
      new THREE.Vector2(0.0, 0.19),
      new THREE.Vector2(0.36, 0.19),
      new THREE.Vector2(0.45, 0.14),
      new THREE.Vector2(0.47, 0.04),
      new THREE.Vector2(0.47, -0.02),
      new THREE.Vector2(0.42, -0.02),
    ];
    const lidGeo = new THREE.LatheGeometry(lidPoints, 48);
    const lidMesh = new THREE.Mesh(lidGeo, collarMaterial);
    lidMesh.position.set(-0.45, 0, 0);
    const lidRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.462, 0.012, 12, 48),
      hullMaterial
    );
    lidRing.rotation.x = Math.PI / 2;
    lidRing.position.set(-0.45, 0.03, 0);
    lidPivot.add(lidMesh, lidRing);
    capsuleGroup.add(lidPivot);

    // Contact shadow grounding plane
    const shadowPlane = new THREE.Mesh(
      new THREE.CircleGeometry(1.75, 48),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.7,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.65;
    scene.add(shadowPlane);

    // Orbital Ambient Particle Cloud
    const particleCount = 140;
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 1.4 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.4;
      pPositions[i * 3] = Math.cos(theta) * r;
      pPositions[i * 3 + 1] = y;
      pPositions[i * 3 + 2] = Math.sin(theta) * r;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.065,
      map: particleTex,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Pre-warm shaders on real GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Tracked animation state
    let currentExploded = explodedTargetRef.current;
    let lastTime = performance.now();
    let elapsed = 0;
    let frameId = 0;
    let isDisposed = false;
    let renderBusy = false;
    let renderDirty = false;
    let lastHotspotUpdate = 0;
    let appliedFinish = finishRef.current;

    const updateMaterialForFinish = (fid: FinishOption['id']) => {
      const opt = FINISH_OPTIONS[fid];
      hullMaterial.color.setHex(opt.metalColor);
      sealMaterial.color.setHex(opt.sealColor);
      sealMaterial.emissive.setHex(opt.sealColor);
      appliedFinish = fid;
    };

    const projectHotspots = (w: number, h: number) => {
      capsuleGroup.updateMatrixWorld(true);
      const next: HotspotScreenPos[] = HOTSPOTS.map((hs) => {
        _projVec.set(hs.localAnchor[0], hs.localAnchor[1], hs.localAnchor[2]);
        _projVec.applyMatrix4(capsuleGroup.matrixWorld);
        _projVec.project(camera);
        const visible = _projVec.z > -1 && _projVec.z < 1;
        return {
          id: hs.id,
          x: ((_projVec.x + 1) / 2) * w,
          y: ((-_projVec.y + 1) / 2) * h,
          visible,
        };
      });
      setHotspotPositions(next);
    };

    const stepScene = (dt: number) => {
      if (appliedFinish !== finishRef.current) {
        updateMaterialForFinish(finishRef.current);
      }

      // Smoothly damp exploded view separation
      currentExploded = THREE.MathUtils.damp(
        currentExploded,
        explodedTargetRef.current,
        7.5,
        dt
      );
      lidPivot.rotation.z = -currentExploded * 0.85;
      lidPivot.position.y = 1.14 + currentExploded * 0.42;
      sealGroup.position.y = currentExploded * 0.34;
      innerCoreGroup.position.y = currentExploded * 0.48;
      baseCapGroup.position.y = -currentExploded * 0.36;
      valveGroup.position.x = currentExploded * 0.24;

      if (isPlayingRef.current && !reducedMotionRef.current) {
        elapsed += dt;
        capsuleGroup.rotation.y += dt * 0.42;
        capsuleGroup.position.y = 0.22 + Math.sin(elapsed * 1.4) * 0.07;
        particles.rotation.y -= dt * 0.08;
      } else {
        capsuleGroup.position.y = 0.22;
      }

      // Camera preset damping
      if (cameraPresetRef.current.active) {
        const { yaw, pitch, zoom } = cameraPresetRef.current;
        const cosP = Math.cos(pitch);
        _targetPos.set(
          Math.sin(yaw) * cosP * zoom,
          Math.sin(pitch) * zoom + 0.15,
          Math.cos(yaw) * cosP * zoom
        );
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetPos.x, 5.5, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetPos.y, 5.5, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetPos.z, 5.5, dt);
        if (camera.position.distanceTo(_targetPos) < 0.04) {
          cameraPresetRef.current.active = false;
        }
      }

      controls.update();
    };

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const renderOnce = () => {
      if (isDisposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      stepScene(dt);
      renderer.render(scene, camera);

      if (now - lastHotspotUpdate > 100) {
        lastHotspotUpdate = now;
        projectHotspots(container.clientWidth || width, container.clientHeight || height);
      }
    };

    const requestRender = () => {
      if (isDisposed) return;
      if (isPlayingRef.current && !reducedMotionRef.current) return; // loop is already active
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (isDisposed) return;
        renderDirty = false;
        renderOnce();
        const done = () => {
          renderBusy = false;
          const stillSettling =
            Math.abs(currentExploded - explodedTargetRef.current) > 0.005 ||
            cameraPresetRef.current.active;
          if (renderDirty || stillSettling) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    requestRenderRef.current = requestRender;
    controls.addEventListener('change', requestRender);

    const tick = () => {
      if (isDisposed) return;
      renderOnce();
      if (isPlayingRef.current && !reducedMotionRef.current) {
        if (isSoftwareGl) afterDraw(tick);
        else frameId = requestAnimationFrame(tick);
      }
    };

    // Start either continuous loop or single initial render
    if (isPlayingRef.current && !reducedMotionRef.current) {
      tick();
    } else {
      requestRender();
    }

    // Restart loop when play state toggles back on
    const playWatcher = window.setInterval(() => {
      if (isDisposed) return;
      if (isPlayingRef.current && !reducedMotionRef.current && !renderBusy && frameId === 0) {
        lastTime = performance.now();
        tick();
      }
    }, 250);

    const handleResize = () => {
      if (!container || isDisposed) return;
      const nw = container.clientWidth || 800;
      const nh = container.clientHeight || 560;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      projectHotspots(nw, nh);
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      window.clearInterval(playWatcher);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      hullGeo.dispose();
      gripGeo.dispose();
      baseMedallionGeo.dispose();
      coreGeo.dispose();
      lidGeo.dispose();
      pGeo.dispose();
      hullMaterial.dispose();
      collarMaterial.dispose();
      innerGlassMaterial.dispose();
      sealMaterial.dispose();
      valveAccentMaterial.dispose();
      pMat.dispose();
      brushedTex.dispose();
      particleTex.dispose();
      shadowTex.dispose();
      renderer.dispose();
    };
  }, []);

  // Trigger continuous loop restart when user clicks Play
  useEffect(() => {
    if (isPlaying && !reducedMotion) {
      requestRenderRef.current();
    }
  }, [isPlaying, reducedMotion]);

  const activeHotspot = HOTSPOTS.find((h) => h.id === activeHotspotId) ?? HOTSPOTS[0];
  const currentFinish = FINISH_OPTIONS[finishId];

  return (
    <div
      ref={containerRef}
      data-testid="showcase-3d-stage"
      data-playing={isPlaying ? 'true' : 'false'}
      data-finish={finishId}
      className="relative w-full h-[540px] sm:h-[600px] lg:h-[640px] rounded-2xl border border-white/10 bg-[#07070b] overflow-hidden"
    >
      {/* Dedicated WebGL Mount Container (isolated from React HUD siblings) */}
      <div
        ref={canvasMountRef}
        data-testid="capsule-3d-canvas"
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Fallback if WebGL unavailable */}
      {webglError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#08080c] p-6 text-center">
          <img
            src={currentFinish.image}
            alt={`Valence capsule in ${currentFinish.name}`}
            className="h-64 w-auto object-contain mb-4"
            referrerPolicy="no-referrer"
          />
          <p className="text-sm text-white/75">
            Interactive 3D preview paused — showing high-resolution studio render.
          </p>
        </div>
      )}

      {/* Minimal Top-Left Active Component Readout (zero obstruction of center) */}
      <div className="pointer-events-none absolute top-5 left-5 right-5 flex items-start justify-between gap-4 z-10">
        <div
          className="pointer-events-auto max-w-xs rounded-xl border border-white/12 px-4 py-3"
          style={{ backgroundColor: 'rgba(12, 12, 18, 0.88)' }}
        >
          <div className="flex items-center gap-2 text-xs font-mono text-[#51F4E8]">
            <span>{activeHotspot.indexLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{activeHotspot.metric}</span>
          </div>
          <h3 className="mt-1 font-display text-base font-semibold text-white">
            {activeHotspot.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-white/70">{activeHotspot.summary}</p>
        </div>

        <button
          type="button"
          onClick={onDiscoverProduct}
          className="pointer-events-auto hidden sm:inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:border-[#51F4E8]/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          style={{ backgroundColor: 'rgba(16, 16, 24, 0.9)' }}
        >
          Discover Product
        </button>
      </div>

      {/* Projected Interactive 3D Hotspot Pins */}
      {!webglError &&
        hotspotPositions.map((pos) => {
          const spec = HOTSPOTS.find((h) => h.id === pos.id);
          if (!spec || !pos.visible) return null;
          const isSelected = spec.id === activeHotspotId;
          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => focusHotspot(spec.id)}
              aria-label={`Inspect ${spec.title}`}
              style={{
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
                backgroundColor: isSelected ? spec.accentHex : 'rgba(12, 12, 18, 0.9)',
                borderColor: spec.accentHex,
              }}
              className={`absolute top-0 left-0 z-10 flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-mono font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isSelected ? 'text-[#050505]' : 'text-white hover:bg-white/10'
              }`}
            >
              <span>{spec.indexLabel}</span>
              <span className="hidden md:inline">{spec.shortLabel}</span>
            </button>
          );
        })}

      {/* Unified Collapsible Bottom Control Dock (Zero Center Occlusion, No backdrop-blur) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex flex-col items-center px-3">
        <button
          type="button"
          onClick={() => setDockCollapsed((v) => !v)}
          aria-expanded={!dockCollapsed}
          aria-label={dockCollapsed ? 'Show 3D Controls' : 'Hide 3D Controls'}
          className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-[11px] font-medium text-white/85 hover:text-white cursor-pointer"
          style={{ backgroundColor: 'rgba(12, 12, 18, 0.92)' }}
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div
            className="pointer-events-auto flex w-full max-w-[820px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/12 px-4 py-2.5"
            style={{ backgroundColor: 'rgba(12, 12, 18, 0.92)' }}
          >
            {/* Play/Pause & Reset */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Pause 3D rotation' : 'Play 3D rotation'}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-medium text-white hover:border-[#51F4E8]/60 transition-colors cursor-pointer whitespace-nowrap"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-[#51F4E8]" aria-hidden="true" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-[#51F4E8]" aria-hidden="true" />
                    <span>Play</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setExploded(0.28);
                  cameraPresetRef.current = { active: true, yaw: 0.4, pitch: 0.22, zoom: 4.5 };
                  requestRenderRef.current();
                }}
                aria-label="Reset 3D camera view"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/80 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Exploded View Slider */}
            <label className="flex items-center gap-2.5 text-xs text-white/80">
              <span className="whitespace-nowrap font-medium">Explode</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(exploded * 100)}
                onChange={(e) => setExploded(clampExplodedAmount(Number(e.target.value) / 100))}
                aria-label="Exploded view separation"
                className="w-24 sm:w-28 accent-[#B44CFF] cursor-pointer"
              />
              <span className="w-8 text-right font-mono text-[11px] tabular-nums text-white/60">
                {Math.round(exploded * 100)}%
              </span>
            </label>

            {/* Hotspot Focus Tabs */}
            <div className="flex items-center gap-1" role="group" aria-label="Component focus">
              {HOTSPOTS.map((hs) => {
                const active = hs.id === activeHotspotId;
                return (
                  <button
                    key={hs.id}
                    type="button"
                    onClick={() => focusHotspot(hs.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#B44CFF] text-white'
                        : 'text-white/65 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {hs.shortLabel.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {/* Finish Swatches */}
            <div className="flex items-center gap-2" role="group" aria-label="3D finish color">
              {FINISH_LIST.map((f) => {
                const active = f.id === finishId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onChangeFinish(f.id)}
                    aria-label={`Select ${f.name} finish`}
                    aria-pressed={active}
                    className={`h-6 w-6 rounded-full border-2 transition-transform cursor-pointer ${
                      active ? 'scale-110 border-white' : 'border-white/25 hover:scale-105'
                    }`}
                    style={{ backgroundColor: f.hex }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
