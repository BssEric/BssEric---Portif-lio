    // ===== Ano no footer =====
    document.getElementById('year').textContent = new Date().getFullYear();

    // ===== Texto digitando/alternando =====
    const roles = ["Desenvolvedor Web", "Front-End", "UI Design"];
    const typedEl = document.getElementById('typed');
    let roleIndex = 0, charIndex = 0, deleting = false;

    function typeLoop() {
      const current = roles[roleIndex];
      if (!deleting) {
        typedEl.textContent = current.slice(0, ++charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(typeLoop, 1200); // pausa após escrever
          return;
        }
      } else {
        typedEl.textContent = current.slice(0, --charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      const delay = deleting ? 40 : 80; // velocidade
      setTimeout(typeLoop, delay);
    }
    typeLoop();

    // ===== Three.js – Robô 3D que segue o cursor =====
    const canvas = document.getElementById('scene');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    const visual = document.querySelector('.visual');

    function resizeRenderer() {
      const { clientWidth, clientHeight } = visual;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.2, 4.6);

    // Luzes
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(3, 5, 4);
    scene.add(dir);

    // Materiais
    const matMetal = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: .8, roughness: .2 });
    const matBody  = new THREE.MeshStandardMaterial({ color: 0x7c3aed, metalness: .6, roughness: .35, emissive: 0x3a1c87, emissiveIntensity: 0.2 });
    const matEye   = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x007a86, emissiveIntensity: 0.6 });

    // Grupo do robô
    const robot = new THREE.Group();
    scene.add(robot);

    // Corpo
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.65, 0.7, 12, 32), matBody);
    torso.position.y = 0.8;
    robot.add(torso);

    // Cabeça
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 32), matMetal);
    head.position.y = 1.7;
    robot.add(head);

    // Olhos
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), matEye);
    eyeL.position.set(-0.15, 1.75, 0.36);
    const eyeR = eyeL.clone(); eyeR.position.x = 0.15;
    robot.add(eyeL, eyeR);

    // Antena
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 16), matMetal);
    antenna.position.set(0, 2.2, 0);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), matEye);
    tip.position.set(0, 2.5, 0);
    robot.add(antenna, tip);

    // Braços
    const armGeom = new THREE.CapsuleGeometry(0.12, 0.5, 8, 16);
    const armL = new THREE.Mesh(armGeom, matMetal);
    armL.position.set(-0.9, 1.0, 0);
    armL.rotation.z = 0.4;
    const armR = armL.clone(); armR.position.x = 0.9; armR.rotation.z = -0.4;
    robot.add(armL, armR);

    // Pernas
    const legGeom = new THREE.CapsuleGeometry(0.16, 0.6, 8, 16);
    const legL = new THREE.Mesh(legGeom, matMetal); legL.position.set(-0.28, 0.1, 0);
    const legR = legL.clone(); legR.position.x = 0.28;
    robot.add(legL, legR);

    // Base/Chão sutil (sombra)
    const ground = new THREE.Mesh(new THREE.CircleGeometry(3.2, 48), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    ground.position.y = -0.01; ground.rotation.x = -Math.PI/2; ground.material.transparent = true; ground.material.opacity = 0.22;
    robot.add(ground);

    // Partículas leves
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 150;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i*3+0] = (Math.random()-0.5) * 6;
      positions[i*3+1] = Math.random() * 3;
      positions[i*3+2] = (Math.random()-0.5) * 6;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({ size: 0.02, color: 0x7c3aed }));
    scene.add(stars);

    // Resize
    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    // Interação do cursor
    let targetRotX = 0, targetRotY = 0;
    visual.addEventListener('mousemove', (e) => {
      const rect = visual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;  // 0..1
      const y = (e.clientY - rect.top) / rect.height; // 0..1
      targetRotY = (x - 0.5) * 0.8; // esquerda/direita
      targetRotX = (0.5 - y) * 0.5; // cima/baixo
    });

    // Animação
    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.01;
      // flutuar
      robot.position.y = Math.sin(t) * 0.05;
      // seguir suavemente o cursor
      robot.rotation.y += (targetRotY - robot.rotation.y) * 0.08;
      robot.rotation.x += (targetRotX - robot.rotation.x) * 0.08;

      // olhar dos olhos levemente para o cursor (fake parallax)
      eyeL.position.z = 0.36 + Math.sin(t*2) * 0.02 + targetRotY * 0.08;
      eyeR.position.z = 0.36 + Math.sin(t*2 + 0.6) * 0.02 + targetRotY * 0.08;

      // girar partículas
      stars.rotation.y += 0.0015;
      renderer.render(scene, camera);
    }
    animate();

    // ===== Form (demo sem backend) =====
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = form.nome.value.trim();
      const email = form.email.value.trim();
      const mensagem = form.mensagem.value.trim();
      const mailto = `mailto:ericbotelho18@gmail.com?subject=Novo contato de ${encodeURIComponent(nome)}&body=${encodeURIComponent(mensagem + '\n\nEmail: ' + email)}`;
      statusEl.textContent = 'Abrindo seu cliente de email...';
      window.location.href = mailto;
      setTimeout(() => statusEl.textContent = 'Caso não tenha aberto, você pode enviar manualmente para: ericbotelho18@gmail.com', 1200);
    });
