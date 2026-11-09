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
  const DEPTH = 0.8;            // how far back the farthest picture layer sits
  const BASE_Z = 1.7;            // how far the eye sits from the glass, in screen-heights
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

  /* ---------- the picture: "The Arrival" from ANUNNAKI, cut into depth layers ----------
     Each layer is a cut-out of the same painting placed at its own distance
     behind the glass. They are sized so that, from straight ahead, they line
     up into the original picture; move and the near layers slide past the far ones. */
  const PIC_CENTER_Y = 0.42;     // which height of the painting sits in the middle of the window
  const MAX_EYE_X = 0.27;        // how far the eye may roam, as a share of the window width
  const MAX_EYE_Y = 0.2;
  const layers = [
    { src: "window/arrival-back.webp?v=2",  depth: 0.80, opaque: true },   // sky, giant planet, beam
    { src: "window/arrival-ship.webp?v=2",  depth: 0.58, float: 0.010 },   // the mothership
    { src: "window/arrival-city.webp?v=2",  depth: 0.42 },                 // the city and river
    { src: "window/arrival-front.webp?v=2", depth: 0.17 },                 // the watchers and the wall
  ].map((L, i) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: loadTex(L.src), transparent: !L.opaque, depthWrite: !!L.opaque, fog: false,
      })
    );
    mesh.position.z = -L.depth;
    mesh.renderOrder = i;
    room.add(mesh);
    return Object.assign(L, { mesh });
  });

  function placeLayers() {
    // apparent size (on the glass, seen from straight ahead) that still covers the
    // window when the eye roams to its limit and looks past the farthest layer
    const far = layers[0].depth;
    const shiftX = MAX_EYE_X * screenW * far / (BASE_Z + far);
    const shiftY = MAX_EYE_Y * SCREEN_H * far / (BASE_Z + far);
    // the painting is square; it sits off-centre by PIC_CENTER_Y, so the short side must still
    // reach past the top and bottom of the window when the eye looks up or down
    const edge = Math.min(PIC_CENTER_Y, 1 - PIC_CENTER_Y);
    const A = Math.max(screenW + 2 * shiftX, (SCREEN_H / 2 + shiftY) / edge) * 1.03;
    for (const L of layers) {
      const k = (BASE_Z + L.depth) / BASE_Z;            // bigger the farther back it sits
      L.mesh.scale.set(A * k, A * k, 1);
      L.baseY = -(0.5 - PIC_CENTER_Y) * A * k;
      L.mesh.position.y = L.baseY;
    }
  }

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

    placeLayers();
    placeDust();
  }

  /* ---------- the viewer's eye position (the whole trick) ---------- */
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
    target.x = THREE.MathUtils.clamp(target.x, -MAX_EYE_X * screenW, MAX_EYE_X * screenW);
    target.y = THREE.MathUtils.clamp(target.y, -MAX_EYE_Y * SCREEN_H, MAX_EYE_Y * SCREEN_H);
    target.z = Math.max(target.z, BASE_Z * 0.85);
    eye.lerp(target, ease);
    applyOffAxis();

    if (!reduceMotion) {
      for (const L of layers) if (L.float) L.mesh.position.y = L.baseY + Math.sin(t * 0.6) * L.float;   // the ship hovers
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
