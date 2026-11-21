import * as THREE from 'three';

export function createScene(canvas, cfg) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); // economiza GPU; suba só se precisar
  renderer.setSize(innerWidth, innerHeight, false);
  setBackground(renderer, cfg.background);

  const scene = new THREE.Scene();
  const cam = cfg.camera;
  const camera = new THREE.PerspectiveCamera(cam.fov, innerWidth / innerHeight, 0.1, 20);

  const applyCamera = () => {
    camera.position.set(0, cam.targetY, cam.distance);
    camera.lookAt(0, cam.targetY, 0);
  };
  applyCamera();

  const sun = new THREE.DirectionalLight(0xffffff, Math.PI);
  sun.position.set(1, 1, 1);
  scene.add(sun, new THREE.AmbientLight(0xffffff, 0.6));

  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });

  // Zoom do enquadramento pela roda do mouse (busto: ~0.7 a 2.0 m).
  addEventListener('wheel', (ev) => {
    cam.distance = Math.min(3, Math.max(0.5, cam.distance + Math.sign(ev.deltaY) * 0.05));
    applyCamera();
    localStorage.setItem('vtuber3d:camera', JSON.stringify(cam));
  }, { passive: true });

  // Zoom por pinça (celular)
  let pinch = null;
  const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  addEventListener('touchmove', (ev) => {
    if (ev.touches.length !== 2) { pinch = null; return; }
    const d = dist(ev.touches);
    if (pinch) { cam.distance = Math.min(3, Math.max(0.5, cam.distance * (pinch / d))); applyCamera(); }
    pinch = d;
  }, { passive: true });
  addEventListener('touchend', () => { pinch = null; });

  return { renderer, scene, camera };
}

export function setBackground(renderer, bg) {
  if (bg === 'transparent') renderer.setClearColor(0x000000, 0);
  else renderer.setClearColor(new THREE.Color(bg), 1);
}
