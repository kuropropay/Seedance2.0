// script.js - initializes a simple Three.js scene with a rotating geometry
// and basic user interaction (pointer rotate). Works on static hosting (GitHub Pages).

(function(){
  // Update year
  try{document.getElementById('year').textContent = new Date().getFullYear()}catch(e){}

  // Three.js scene
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  // Create renderer using existing canvas for better control
  const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07080a, 0.06);

  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 0.8, 3);

  // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, 0.9);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5,10,5);
  scene.add(dir);

  // Add a reflective-ish torus knot + soft rim material
  const geometry = new THREE.TorusKnotGeometry(0.6, 0.18, 128, 24);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x7c5cff,
    metalness: 0.6,
    roughness: 0.2,
    emissive: 0x080018,
    emissiveIntensity: 0.2
  });
  const knot = new THREE.Mesh(geometry, mat);
  knot.rotation.x = 0.6;
  scene.add(knot);

  // Add subtle particles
  const particles = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(300*3), 3)),
    new THREE.PointsMaterial({color:0xffffff, size: 0.008, transparent: true, opacity: 0.06})
  );
  const pos = particles.geometry.attributes.position.array;
  for(let i=0;i<pos.length;i+=3){
    pos[i] = (Math.random()-0.5)*8;
    pos[i+1] = (Math.random()-0.5)*4;
    pos[i+2] = (Math.random()-0.5)*6;
  }
  scene.add(particles);

  // Responsive resize
  function resizeRenderer() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())){
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  // Simple pointer interaction to rotate object
  let isDown = false; let lastX=0, lastY=0; let rotY=0, rotX=0;
  canvas.addEventListener('pointerdown', (e)=>{ isDown=true; lastX=e.clientX; lastY=e.clientY; canvas.setPointerCapture(e.pointerId); });
  window.addEventListener('pointerup', (e)=>{ isDown=false; try{canvas.releasePointerCapture(e.pointerId)}catch(e){} });
  window.addEventListener('pointermove', (e)=>{ if(!isDown) return; const dx = (e.clientX - lastX)/200; const dy = (e.clientY - lastY)/200; rotY += dx; rotX += dy; lastX = e.clientX; lastY = e.clientY; });

  // Animation loop
  const clock = new THREE.Clock();
  function animate(){
    resizeRenderer();
    const t = clock.getElapsedTime();
    knot.rotation.y = t*0.4 + rotY;
    knot.rotation.x = 0.6 + Math.sin(t*0.5)*0.08 + rotX;
    // gentle particle movement
    particles.rotation.y = t*0.02;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Basic demo wiring for buttons (no API call here)
  const demoBtn = document.getElementById('demo');
  if (demoBtn){
    demoBtn.addEventListener('click', ()=>{
      const preview = document.getElementById('preview');
      if(preview) preview.innerHTML = `<video controls src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" style="max-width:100%"></video>`;
      const resultCard = document.getElementById('resultCard'); if(resultCard) resultCard.style.display='block';
    });
  }

  // Save / clear API key buttons
  const saveKey = document.getElementById('saveKey');
  const clearKey = document.getElementById('clearKey');
  if (saveKey){
    saveKey.addEventListener('click', ()=>{
      const ep = document.getElementById('apiEndpoint').value.trim();
      const k = document.getElementById('apiKey').value.trim();
      if(ep) localStorage.setItem('kg_endpoint', ep); if(k) localStorage.setItem('kg_api_key', k);
      alert('Đã lưu (local).');
    });
  }
  if (clearKey){
    clearKey.addEventListener('click', ()=>{ localStorage.removeItem('kg_endpoint'); localStorage.removeItem('kg_api_key'); document.getElementById('apiEndpoint').value=''; document.getElementById('apiKey').value=''; alert('Đã xóa.'); });
  }

})();
