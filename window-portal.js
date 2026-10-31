/* =====================================================
   Marcos Garcia — "Look Through the Window"
   A head-tracked 3D window (off-axis projection).
   - Webcam head tracking via MediaPipe (opt-in, on-device)
   - Falls back to mouse on desktop, tilt on phones
   ===================================================== */

// three.js and MediaPipe are served from this site (vendor/), not a CDN, so no outside code ever runs with camera access.
import * as THREE from "./vendor/three/three.module.js";

const VISION_URL = new URL("./vendor/mediapipe", import.meta.url).href;
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

const wrap = document.getElementById("portal-canvas-wrap");
const btn = document.getElementById("portal-track-btn");
const statusEl = document.getElementById("portal-status");
const hintEl = document.getElementById("portal-hint");

if (wrap) init();

function init() {
  /* ---------- renderer ---------- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (e) {
    wrap.classList.add("no-webgl");
    if (btn) btn.hidden = true;
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x05070d, 1);
  wrap.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05070d, 2.2, 7.5);

  const camera = new THREE.PerspectiveCamera();
  camera.matrixAutoUpdate = true;

  /* The screen (the window opening) is the plane z = 0.
     Its height is 1 unit; its width follows the canvas aspect. */
  const SCREEN_H = 1;
  const DEPTH = 3.2;
  let screenW = 16 / 9;

  const room = new THREE.Group();
  scene.add(room);

  const loader = new THREE.TextureLoader();
  const loadTex = (src) => {
    const t = loader.load(src);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };

  /* ---------- the room: gold grid walls fading into the dark ---------- */
  const gridMat = new THREE.LineBasicMaterial({ color: 0xc9a227, transparent: true, opacity: 0.38 });
  let grid = null;

  function buildGrid() {
    if (grid) { room.remove(grid); grid.geometry.dispose(); }
    const w = screenW / 2, h = SCREEN_H / 2;
    const pts = [];
    const steps = 10;
    // depth rings
    for (let i = 0; i <= steps; i++) {
      const z = -DEPTH * (i / steps);
      pts.push(-w, -h, z, w, -h, z,  w, -h, z, w, h, z,  w, h, z, -w, h, z,  -w, h, z, -w, -h, z);
    }
    // lines running into depth
    const across = 8;
    for (let i = 0; i <= across; i++) {
      const x = -w + (2 * w * i) / across;
      pts.push(x, -h, 0, x, -h, -DEPTH,  x, h, 0, x, h, -DEPTH);
    }
    const down = 5;
    for (let i = 1; i < down; i++) {
      const y = -h + (2 * h * i) / down;
      pts.push(-w, y, 0, -w, y, -DEPTH,  w, y, 0, w, y, -DEPTH);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    grid = new THREE.LineSegments(geo, gridMat);
    room.add(grid);
  }

  /* dark wall panels behind the grid so the room reads as solid */
  const wallMat = new THREE.MeshBasicMaterial({ color: 0x0a0e18, side: THREE.BackSide });
  let walls = null;
  function buildWalls() {
    if (walls) { room.remove(walls); walls.geometry.dispose(); }
    const geo = new THREE.BoxGeometry(screenW * 1.001, SCREEN_H * 1.001, DEPTH);
    walls = new THREE.Mesh(geo, wallMat);
    walls.position.z = -DEPTH / 2 - 0.001;
    room.add(walls);
  }

  /* ---------- back wall: deep nebula ---------- */
  const nebulaCanvas = document.createElement("canvas");
  nebulaCanvas.width = 1024; nebulaCanvas.height = 576;
  {
    const g = nebulaCanvas.getContext("2d");
    g.fillStyle = "#05070d"; g.fillRect(0, 0, 1024, 576);
    const blobs = [
      [300, 220, 360, "rgba(80,120,220,0.35)"],
      [760, 380, 320, "rgba(180,90,220,0.28)"],
      [620, 140, 260, "rgba(70,200,210,0.22)"],
      [180, 460, 240, "rgba(201,162,39,0.16)"],
    ];
    for (const [x, y, r, c] of blobs) {
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, c); grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd; g.fillRect(0, 0, 1024, 576);
    }
    for (let i = 0; i < 900; i++) {
      const a = Math.random() * 0.8 + 0.2;
      g.fillStyle = `rgba(255,250,235,${a})`;
      const s = Math.random() < 0.06 ? 2 : 1;
      g.fillRect(Math.random() * 1024, Math.random() * 576, s, s);
    }
  }
  const nebulaTex = new THREE.CanvasTexture(nebulaCanvas);
  nebulaTex.colorSpace = THREE.SRGBColorSpace;
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: nebulaTex, fog: false })
  );
  backWall.position.z = -DEPTH;
  room.add(backWall);

  /* soft round mask so the cosmic bust melts into the nebula */
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = maskCanvas.height = 256;
  {
    const g = maskCanvas.getContext("2d");
    const grd = g.createRadialGradient(128, 118, 30, 128, 128, 128);
    grd.addColorStop(0, "#fff"); grd.addColorStop(0.62, "#fff"); grd.addColorStop(1, "#000");
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  }
  const softMask = new THREE.CanvasTexture(maskCanvas);

  /* ---------- the art ---------- */
  const art = new THREE.Group();
  room.add(art);

  // Cosmic Marcus bust — deep in the room
  const bustH = 0.95;
  const bust = new THREE.Mesh(
    new THREE.PlaneGeometry(bustH * (1122 / 1402), bustH),
    new THREE.MeshBasicMaterial({ map: loadTex("marcus-cosmic-bust.webp"), alphaMap: softMask, transparent: true, fog: false })
  );
  bust.position.set(0, 0, -DEPTH + 0.35);
  art.add(bust);

  // Gold orbit ring around the bust (echoes the site logo)
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.004, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0xd9b54a, transparent: true, opacity: 0.85 })
  );
  orbit.position.copy(bust.position).add(new THREE.Vector3(0, 0.02, 0.25));
  orbit.rotation.set(1.2, 0.25, -0.4);
  art.add(orbit);
  const electron = new THREE.Mesh(
    new THREE.SphereGeometry(0.014, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x8fe6d2 })
  );
  orbit.add(electron);

  function framedBook(src, aspect, height, crop) {
    const group = new THREE.Group();
    const tex = loadTex(src);
    if (crop) {
      tex.repeat.set(crop.ru, crop.rv);
      tex.offset.set(crop.u, crop.v);
    }
    const w = height * aspect;
    const frame = new THREE.Mesh(
      new THREE.PlaneGeometry(w + 0.03, height + 0.03),
      new THREE.MeshBasicMaterial({ color: 0xc9a227 })
    );
    frame.position.z = -0.003;
    const backing = new THREE.Mesh(
      new THREE.PlaneGeometry(w + 0.07, height + 0.07),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 })
    );
    backing.position.set(0.02, -0.025, -0.03);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w, height), new THREE.MeshBasicMaterial({ map: tex }));
    group.add(backing, frame, face);
    return group;
  }

  // Featured book — closest to the glass
  const weird = framedBook("book-cover.jpg", 565 / 976, 0.56, {
    u: 170 / 952, ru: 565 / 952, v: 1 - 1108 / 1269, rv: 976 / 1269,
  });
  art.add(weird);

  // Book in development — mid-depth
  const mysteries = framedBook("universe-grand-mysteries-cover.webp", 1114 / 1412, 0.5);
  art.add(mysteries);

  // A line of Marcus floating just behind the glass
  const quoteCanvas = document.createElement("canvas");
  quoteCanvas.width = 2000; quoteCanvas.height = 160;
  const quoteTex = new THREE.CanvasTexture(quoteCanvas);
  quoteTex.colorSpace = THREE.SRGBColorSpace;
  function drawQuote() {
    const g = quoteCanvas.getContext("2d");
    g.clearRect(0, 0, 2000, 160);
    g.textAlign = "center";
    g.fillStyle = "rgba(245,240,228,0.92)";
    g.font = 'italic 500 58px "Cormorant Garamond", Georgia, serif';
    g.fillText("“The universe is change; our life is what our thoughts make it.”", 1000, 80);
    g.fillStyle = "rgba(201,162,39,0.95)";
    g.font = '700 22px "Space Mono", monospace';
    g.fillText("—  MARCUS AURELIUS, MEDITATIONS IV.3", 1000, 138);
    quoteTex.needsUpdate = true;
  }
  drawQuote();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawQuote);
  const quote = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.08),
    new THREE.MeshBasicMaterial({ map: quoteTex, transparent: true, depthWrite: false })
  );
  art.add(quote);

  /* ---------- star dust that fills the room (and spills out of it) ---------- */
  const dotCanvas = document.createElement("canvas");
  dotCanvas.width = dotCanvas.height = 64;
  {
    const g = dotCanvas.getContext("2d");
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.25, "rgba(255,245,220,0.8)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  }
  const DUST = 700;
  const dustPos = new Float32Array(DUST * 3);
  const dustSeed = new Float32Array(DUST);
  const dustColors = new Float32Array(DUST * 3);
  const palette = [new THREE.Color(0xfff6e0), new THREE.Color(0x9fdcff), new THREE.Color(0xe7c46a), new THREE.Color(0x8fe6d2)];
  for (let i = 0; i < DUST; i++) {
    dustSeed[i] = Math.random();
    const c = palette[Math.random() < 0.7 ? 0 : 1 + Math.floor(Math.random() * 3)];
    dustColors.set([c.r, c.g, c.b], i * 3);
  }
  function placeDust() {
    for (let i = 0; i < DUST; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * screenW * 0.98;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * SCREEN_H * 0.98;
      // a few motes float in front of the glass for the "pop-out" effect
      dustPos[i * 3 + 2] = Math.random() < 0.08 ? Math.random() * 0.35 : -Math.random() * DEPTH;
    }
    dustGeo.attributes.position.needsUpdate = true;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      size: 0.022, map: new THREE.CanvasTexture(dotCanvas), vertexColors: true,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    })
  );
  scene.add(dust);

  /* ---------- layout depends on canvas aspect ---------- */
  function layout() {
    const rect = wrap.getBoundingClientRect();
    const w = Math.max(rect.width, 1), h = Math.max(rect.height, 1);
    renderer.setSize(w, h, false);
    screenW = (w / h) * SCREEN_H;
    const portrait = screenW < 1;

    buildWalls();
    buildGrid();
    backWall.scale.set(screenW, SCREEN_H, 1);
    placeDust();

    if (portrait) {
      weird.position.set(-screenW * 0.2, -0.17, -0.55);
      weird.scale.setScalar(0.62);
      mysteries.position.set(screenW * 0.22, 0.14, -1.5);
      mysteries.scale.setScalar(0.6);
      quote.scale.setScalar(screenW * 0.92);
      quote.position.set(0, 0.4, -0.25);
    } else {
      weird.position.set(-screenW * 0.29, -0.06, -0.7);
      weird.scale.setScalar(1);
      mysteries.position.set(screenW * 0.29, 0.02, -1.65);
      mysteries.scale.setScalar(1);
      quote.scale.setScalar(Math.min(screenW * 0.62, 1.15));
      quote.position.set(0, -0.4, -0.2);
    }
    weird.rotation.y = 0.28;
    mysteries.rotation.y = -0.3;
  }

  /* ---------- the viewer's eye position (the whole trick) ---------- */
  const BASE_Z = 1.7;            // how far the eye sits from the glass, in screen-heights
  const eye = new THREE.Vector3(0, 0, BASE_Z);
  const target = new THREE.Vector3(0, 0, BASE_Z);
  let mode = "idle";             // idle | mouse | tilt | camera
  let lastInput = 0;

  function applyOffAxis() {
    // Off-axis frustum through the screen rectangle, seen from the eye.
    const near = 0.05, far = 30;
    const n = near / eye.z;
    const left = (-screenW / 2 - eye.x) * n;
    const right = (screenW / 2 - eye.x) * n;
    const top = (SCREEN_H / 2 - eye.y) * n;
    const bottom = (-SCREEN_H / 2 - eye.y) * n;
    camera.position.copy(eye);
    camera.quaternion.identity();
    camera.updateMatrixWorld();
    camera.projectionMatrix.makePerspective(left, right, top, bottom, near, far);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  }

  /* mouse / touch */
  wrap.addEventListener("pointermove", (e) => {
    if (mode === "camera") return;
    const r = wrap.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    target.set(nx * screenW * 1.4, -ny * SCREEN_H * 1.2, BASE_Z);
    mode = "mouse"; lastInput = performance.now();
    fadeHint();
  });

  /* phone tilt */
  let tiltBase = null;
  function onTilt(e) {
    if (mode === "camera" || e.beta == null) return;
    if (!tiltBase) tiltBase = { b: e.beta, g: e.gamma };
    const gx = THREE.MathUtils.clamp((e.gamma - tiltBase.g) / 25, -1, 1);
    const by = THREE.MathUtils.clamp((e.beta - tiltBase.b) / 25, -1, 1);
    target.set(-gx * screenW * 0.7, by * SCREEN_H * 0.6, BASE_Z);
    mode = "tilt"; lastInput = performance.now();
  }
  const isTouch = matchMedia("(pointer: coarse)").matches;
  if (isTouch && hintEl) hintEl.textContent = "Tilt your phone";
  if (isTouch && "DeviceOrientationEvent" in window && typeof DeviceOrientationEvent.requestPermission !== "function") {
    window.addEventListener("deviceorientation", onTilt);
  }
  function requestTilt() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then((s) => { if (s === "granted") window.addEventListener("deviceorientation", onTilt); })
        .catch(() => {});
    }
  }
  wrap.addEventListener("click", requestTilt, { once: true });

  function fadeHint() { if (hintEl) hintEl.style.opacity = "0"; }

  /* ---------- webcam head tracking (opt-in) ---------- */
  let video = null, detector = null, tracking = false, lastVideoTime = -1;
  let refFaceW = null;

  async function startTracking() {
    setStatus("Starting camera…");
    try {
      video = document.createElement("video");
      video.playsInline = true; video.muted = true;
      video.srcObject = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false,
      });
      await video.play();

      if (!detector) {
        setStatus("Loading face tracker…");
        const vision = await import(`${VISION_URL}/vision_bundle.mjs`);
        const fileset = await vision.FilesetResolver.forVisionTasks(`${VISION_URL}/wasm`);
        detector = await vision.FaceDetector.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL, delegate: "GPU" },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.5,
        });
      }
      tracking = true; refFaceW = null;
      mode = "camera";
      btn.setAttribute("aria-pressed", "true");
      btn.querySelector(".portal-label").textContent = "Head tracking on";
      setStatus("Move your head. Lean in. Look around the room.");
      fadeHint();
    } catch (err) {
      console.warn("[portal] camera/tracker unavailable:", err);
      stopTracking();
      setStatus(isTouch ? "Camera unavailable. Tilt your phone instead." : "Camera unavailable. Move your mouse over the window instead.");
    }
  }

  function stopTracking() {
    tracking = false;
    if (video && video.srcObject) video.srcObject.getTracks().forEach((t) => t.stop());
    video = null;
    if (mode === "camera") mode = "idle";
    if (btn) {
      btn.setAttribute("aria-pressed", "false");
      btn.querySelector(".portal-label").textContent = "Turn on head tracking";
    }
  }

  function trackFace() {
    if (!tracking || !video || !detector || video.readyState < 2) return;
    if (video.currentTime === lastVideoTime) return;
    lastVideoTime = video.currentTime;
    const res = detector.detectForVideo(video, performance.now());
    const d = res.detections && res.detections[0];
    if (!d) return;
    const vw = video.videoWidth, vh = video.videoHeight;
    const kp = d.keypoints;
    let cx, cy;
    if (kp && kp.length >= 2) {           // midpoint between the eyes
      cx = (kp[0].x + kp[1].x) / 2; cy = (kp[0].y + kp[1].y) / 2;
    } else {
      const b = d.boundingBox;
      cx = (b.originX + b.width / 2) / vw; cy = (b.originY + b.height / 3) / vh;
    }
    const faceW = d.boundingBox.width / vw;
    if (!refFaceW) refFaceW = faceW;
    // camera image is mirrored relative to the viewer
    const x = (0.5 - cx) * screenW * 2.4;
    const y = (0.5 - cy) * SCREEN_H * 2.0;
    const z = THREE.MathUtils.clamp(BASE_Z * (refFaceW / faceW), 0.7, 3.4);
    target.set(x, y, z);
    lastInput = performance.now();
  }

  if (btn) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      btn.hidden = true;
    } else {
      btn.addEventListener("click", () => (tracking ? (stopTracking(), setStatus("Head tracking off.")) : startTracking()));
    }
  }
  function setStatus(t) { if (statusEl) statusEl.textContent = t; }

  /* ---------- loop (only while visible) ---------- */
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let visible = false, raf = 0;
  const clock = new THREE.Clock();

  function frame() {
    raf = requestAnimationFrame(frame);
    const t = clock.getElapsedTime();
    trackFace();

    // gentle idle drift so the depth is obvious before anyone interacts
    if (mode !== "camera" && performance.now() - lastInput > 2500 && !reduceMotion) {
      target.set(Math.sin(t * 0.35) * screenW * 0.32, Math.sin(t * 0.23) * SCREEN_H * 0.18, BASE_Z);
    }
    const ease = mode === "camera" ? 0.35 : 0.08;
    eye.lerp(target, ease);
    applyOffAxis();

    if (!reduceMotion) {
      weird.position.y += Math.sin(t * 0.9) * 0.0004;
      mysteries.position.y += Math.cos(t * 0.7) * 0.0003;
      orbit.rotation.z = t * 0.25;
      electron.position.set(Math.cos(t * 1.4) * 0.42, Math.sin(t * 1.4) * 0.42, 0);
      for (let i = 0; i < DUST; i++) {
        const k = i * 3 + 1;
        dustPos[k] += 0.00025 + dustSeed[i] * 0.0004;
        if (dustPos[k] > SCREEN_H / 2) dustPos[k] = -SCREEN_H / 2;
      }
      dustGeo.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !raf) { clock.start(); frame(); }
    if (!visible && raf) {
      cancelAnimationFrame(raf); raf = 0;
      if (tracking) { stopTracking(); setStatus("Head tracking paused. Turn it back on any time."); }
    }
  }, { threshold: 0.05 }).observe(wrap);

  new ResizeObserver(layout).observe(wrap);
  layout();
  applyOffAxis();
  renderer.render(scene, camera);
}
