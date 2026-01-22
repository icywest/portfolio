import * as THREE from "three";

/* ---------------- helpers ---------------- */

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

/* ---------------- shape generators ---------------- */

// 𖦹 Fibonacci spiral - clean golden ratio spiral
function makeSpiral(COUNT) {
  const out = new Float32Array(COUNT * 3);
  const golden = Math.PI * (3 - Math.sqrt(5)); // Golden angle
  const spread = 0.032;
  
  for (let i = 0; i < COUNT; i++) {
    const angle = i * golden;
    const radius = Math.sqrt(i) * spread;
    
    out[i * 3 + 0] = Math.cos(angle) * radius;
    out[i * 3 + 1] = Math.sin(angle) * radius;
    out[i * 3 + 2] = 0;
  }
  return out;
}

// ☆ Star - clean 5-pointed star
function makeStar(COUNT) {
  const out = new Float32Array(COUNT * 3);
  const points = 5;
  const outerRadius = 0.9;
  const innerRadius = 0.36;
  
  // Create star path
  const starPath = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPath.push([
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    ]);
  }
  
  // Fill star uniformly
  for (let i = 0; i < COUNT; i++) {
    const t = i / COUNT;
    const ringLevel = Math.floor(t * 20); // 20 concentric rings
    const ringT = (t * 20) % 1;
    const scale = 1 - ringLevel / 20 * 0.95; // Scale down toward center
    
    const angle = ringT * Math.PI * 2;
    const baseIdx = Math.floor(ringT * starPath.length);
    const nextIdx = (baseIdx + 1) % starPath.length;
    const blend = (ringT * starPath.length) % 1;
    
    // Interpolate between star vertices
    const x = starPath[baseIdx][0] * (1 - blend) + starPath[nextIdx][0] * blend;
    const y = starPath[baseIdx][1] * (1 - blend) + starPath[nextIdx][1] * blend;
    
    out[i * 3 + 0] = x * scale;
    out[i * 3 + 1] = y * scale;
    out[i * 3 + 2] = 0;
  }
  
  return out;
}

// •ᴗ• Happy face - clean and simple
function makeHappy(COUNT) {
  const out = new Float32Array(COUNT * 3);
  let idx = 0;
  
  // Allocate points for each feature
  const outlineCount = Math.floor(COUNT * 0.3);
  const eyeCount = Math.floor(COUNT * 0.15);
  const smileCount = Math.floor(COUNT * 0.25);
  
  // Face outline (circle)
  const faceRadius = 0.85;
  for (let i = 0; i < outlineCount && idx < COUNT; i++) {
    const angle = (i / outlineCount) * Math.PI * 2;
    out[idx * 3 + 0] = Math.cos(angle) * faceRadius;
    out[idx * 3 + 1] = Math.sin(angle) * faceRadius;
    out[idx * 3 + 2] = 0;
    idx++;
  }
  
  // Left eye (filled dot)
  const eyeRadius = 0.06;
  const eyeX = 0.25;
  const eyeY = 0.18;
  for (let ring = 0; ring < 3; ring++) {
    const r = eyeRadius * (1 - ring * 0.33);
    const pointsInRing = Math.floor(eyeCount / 3);
    for (let i = 0; i < pointsInRing && idx < COUNT; i++) {
      const angle = (i / pointsInRing) * Math.PI * 2;
      out[idx * 3 + 0] = Math.cos(angle) * r - eyeX;
      out[idx * 3 + 1] = Math.sin(angle) * r + eyeY;
      out[idx * 3 + 2] = 0;
      idx++;
    }
  }
  
  // Right eye (filled dot)
  for (let ring = 0; ring < 3; ring++) {
    const r = eyeRadius * (1 - ring * 0.33);
    const pointsInRing = Math.floor(eyeCount / 3);
    for (let i = 0; i < pointsInRing && idx < COUNT; i++) {
      const angle = (i / pointsInRing) * Math.PI * 2;
      out[idx * 3 + 0] = Math.cos(angle) * r + eyeX;
      out[idx * 3 + 1] = Math.sin(angle) * r + eyeY;
      out[idx * 3 + 2] = 0;
      idx++;
    }
  }
  
  // Smile (clean arc)
  const smileRadius = 0.45;
  const startAngle = Math.PI * 1.15; // ~207°
  const endAngle = Math.PI * 1.85;   // ~333°
  
  for (let layer = 0; layer < 2; layer++) {
    const r = smileRadius - layer * 0.02;
    const pointsInLayer = Math.floor(smileCount / 2);
    for (let i = 0; i < pointsInLayer && idx < COUNT; i++) {
      const t = i / (pointsInLayer - 1);
      const angle = startAngle + (endAngle - startAngle) * t;
      out[idx * 3 + 0] = Math.cos(angle) * r;
      out[idx * 3 + 1] = Math.sin(angle) * r - 0.1;
      out[idx * 3 + 2] = 0;
      idx++;
    }
  }
  
  // Fill remaining points inside face
  while (idx < COUNT) {
    const angle = (idx / COUNT) * Math.PI * 2;
    const r = faceRadius * 0.6 * Math.sqrt(idx / COUNT);
    out[idx * 3 + 0] = Math.cos(angle) * r;
    out[idx * 3 + 1] = Math.sin(angle) * r;
    out[idx * 3 + 2] = 0;
    idx++;
  }
  
  return out;
}

// ♡ Heart - clean parametric heart
function makeHeart(COUNT) {
  const out = new Float32Array(COUNT * 3);
  const scale = 0.055;
  
  // Create clean heart shape with layers
  for (let i = 0; i < COUNT; i++) {
    const layerIdx = Math.floor((i / COUNT) * 15); // 15 layers
    const layerT = (i / COUNT * 15) % 1;
    const layerScale = 1 - layerIdx / 15 * 0.9;
    
    const t = layerT * Math.PI * 2;
    
    // Parametric heart equation
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    
    out[i * 3 + 0] = x * scale * layerScale;
    out[i * 3 + 1] = y * scale * layerScale - 0.2;
    out[i * 3 + 2] = 0;
  }
  
  return out;
}

// ❀ Flower - clean rose curve
function makeFlower(COUNT) {
  const out = new Float32Array(COUNT * 3);
  const petals = 6;
  const radius = 0.85;
  
  for (let i = 0; i < COUNT; i++) {
    const layerIdx = Math.floor((i / COUNT) * 12); // 12 layers
    const layerT = (i / COUNT * 12) % 1;
    const layerScale = 1 - layerIdx / 12 * 0.85;
    
    const theta = layerT * Math.PI * 2;
    
    // Rose curve equation
    const r = Math.abs(Math.cos(petals * theta / 2)) * radius * layerScale;
    
    out[i * 3 + 0] = Math.cos(theta) * r;
    out[i * 3 + 1] = Math.sin(theta) * r;
    out[i * 3 + 2] = 0;
  }
  
  // Add center dot
  const centerStart = Math.floor(COUNT * 0.9);
  for (let i = centerStart; i < COUNT; i++) {
    const t = (i - centerStart) / (COUNT - centerStart);
    const angle = t * Math.PI * 2;
    const r = 0.12 * Math.sqrt(t);
    out[i * 3 + 0] = Math.cos(angle) * r;
    out[i * 3 + 1] = Math.sin(angle) * r;
    out[i * 3 + 2] = 0;
  }
  
  return out;
}

/* ---------------- main animation ---------------- */

export function startFibonacci(canvas, opts = {}) {
  const COUNT = opts.count ?? 1800;
  const DOT_SIZE = opts.dotSize ?? 0.08;
  const HOLD_SECONDS = opts.holdSeconds ?? 2.8;
  const MORPH_SECONDS = opts.morphSeconds ?? 2.0;
  
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  
  // Three.js setup
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(DPR);
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 40);
  camera.position.z = 3;
  
  // Geometry
  const positions = new Float32Array(COUNT * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  
  // Pure white material
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: DOT_SIZE,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  
  const cloud = new THREE.Points(geometry, material);
  scene.add(cloud);
  
  // Shape definitions
  const shapes = [
    { name: "spiral", data: makeSpiral(COUNT) },
    { name: "star", data: makeStar(COUNT) },
    { name: "happy", data: makeHappy(COUNT) },
    { name: "heart", data: makeHeart(COUNT) },
    { name: "flower", data: makeFlower(COUNT) },
  ];
  
  // Initialize with spiral
  positions.set(shapes[0].data);
  geometry.attributes.position.needsUpdate = true;
  
  // Handle resizing
  function resize() {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);
  
  // Animation state
  let fromIdx = 0;
  let toIdx = 1;
  let phase = "hold";
  let holdT = 0;
  let morphT = 0;
  let last = performance.now();
  
  function animate(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    
    // Gentle rotation
    cloud.rotation.z += 0.0015;
    cloud.rotation.x = Math.sin(now * 0.0003) * 0.1;
    cloud.rotation.y = Math.cos(now * 0.0002) * 0.08;
    
    if (phase === "hold") {
      holdT += dt;
      if (holdT >= HOLD_SECONDS) {
        holdT = 0;
        phase = "morph";
        morphT = 0;
        toIdx = (fromIdx + 1) % shapes.length;
      }
    } else {
      morphT += dt;
      const progress = clamp01(morphT / MORPH_SECONDS);
      const ease = easeInOutCubic(progress);
      
      const from = shapes[fromIdx].data;
      const to = shapes[toIdx].data;
      
      // Morph positions
      for (let i = 0; i < COUNT * 3; i++) {
        positions[i] = from[i] + (to[i] - from[i]) * ease;
      }
      
      geometry.attributes.position.needsUpdate = true;
      
      if (progress >= 1) {
        phase = "hold";
        fromIdx = toIdx;
      }
    }
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  
  requestAnimationFrame(animate);
  
  // Cleanup
  return () => {
    window.removeEventListener("resize", resize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}