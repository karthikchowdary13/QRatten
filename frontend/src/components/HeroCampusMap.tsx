'use client';

import React, { useEffect, useRef } from 'react';

export default function HeroCampusMap() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: () => void;
    let animationFrameId: number;

    const loadThreeJS = () => {
      if ((window as any).THREE) {
        initThreeJS();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        initThreeJS();
      };
    };

    const initThreeJS = () => {
      const THREE = (window as any).THREE;
      if (!THREE || !mountRef.current) return;

      const scene = new THREE.Scene();
      
      const camera = new THREE.PerspectiveCamera(45, 560 / 480, 0.1, 100);
      camera.position.set(0, 6, 7);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(560, 480);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const light1 = new THREE.DirectionalLight(0x6366F1, 0.9);
      light1.position.set(5, 10, 5);
      scene.add(light1);

      const light2 = new THREE.PointLight(0x38BDF8, 0.6);
      light2.position.set(-5, 8, -5);
      scene.add(light2);

      // Ground Plane
      const planeGeo = new THREE.PlaneGeometry(24, 24);
      const planeMat = new THREE.MeshBasicMaterial({ color: 0xEEF2FF, transparent: true, opacity: 0.5 });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -Math.PI / 2;
      scene.add(plane);

      // Grid Helper
      const gridHelper = new THREE.GridHelper(24, 24, 0x6366F1, 0x6366F1);
      (gridHelper.material as any).transparent = true;
      (gridHelper.material as any).opacity = 0.1;
      scene.add(gridHelper);

      // Buildings Data
      const buildingsData = [
        { name: "Main Block", size: [3.2, 1.8, 2.8], pos: [0, 0.9, 0] },
        { name: "Science", size: [2, 1.2, 2], pos: [-4, 0.6, -3] },
        { name: "Arts", size: [2, 1.2, 2], pos: [4, 0.6, -3] },
        { name: "Library", size: [2.2, 0.9, 1.6], pos: [-4, 0.45, 3] },
        { name: "Admin", size: [1.8, 1.4, 1.8], pos: [4, 0.7, 3] },
        { name: "Labs", size: [1.6, 1.1, 2.4], pos: [0, 0.55, -5.5] },
        { name: "Hostel A", size: [1.3, 0.9, 1.3], pos: [-6.5, 0.45, 0] },
        { name: "Hostel B", size: [1.3, 0.9, 1.3], pos: [6.5, 0.45, 0] }
      ];

      const buildings: any[] = [];
      const nodes: any[] = [];

      buildingsData.forEach((data, index) => {
        // Main Mesh & Wireframe group
        const buildingGroup = new THREE.Group();
        buildingGroup.position.set(data.pos[0], data.pos[1], data.pos[2]);

        const geo = new THREE.BoxGeometry(data.size[0], data.size[1], data.size[2]);
        const mat = new THREE.MeshPhongMaterial({ color: 0xC7D2FE, transparent: true, opacity: 0.85, shininess: 80 });
        const mesh = new THREE.Mesh(geo, mat);
        buildingGroup.add(mesh);

        const wireMat = new THREE.MeshBasicMaterial({ color: 0x6366F1, wireframe: true, transparent: true, opacity: 0.3 });
        const wireMesh = new THREE.Mesh(geo, wireMat);
        buildingGroup.add(wireMesh);

        scene.add(buildingGroup);

        // Glowing Node
        const nodeGeo = new THREE.SphereGeometry(0.13, 16, 16);
        const nodeMat = new THREE.MeshBasicMaterial({ color: 0x6366F1, transparent: true });
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        const roofY = data.pos[1] + data.size[1] / 2;
        node.position.set(data.pos[0], roofY, data.pos[2]);
        scene.add(node);

        // Label
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, 256, 64);
        ctx.font = '600 28px Inter, sans-serif'; 
        ctx.fillStyle = '#4F46E5';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.name, 128, 32);
        
        const tex = new THREE.CanvasTexture(canvas);
        const labelGeo = new THREE.PlaneGeometry(1.3, 0.32);
        const labelMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false });
        const label = new THREE.Mesh(labelGeo, labelMat);
        label.position.set(data.pos[0], roofY + 0.25, data.pos[2]);
        label.rotation.x = -Math.PI / 4; 
        scene.add(label);

        buildings.push({ mesh, wireMesh, index, roofY });
        nodes.push({ mesh: node, index, pos: new THREE.Vector3(data.pos[0], roofY, data.pos[2]) });
      });

      // Data Connections
      const connectionPairs = [
        [0, 1], // Main -> Science
        [0, 2], // Main -> Arts
        [0, 3], // Main -> Library
        [0, 4], // Main -> Admin
        [0, 5], // Main -> Labs
        [1, 5], // Science -> Labs
        [4, 6], // Admin -> Hostel A
        [4, 7]  // Admin -> Hostel B
      ];

      const lines: any[] = [];
      const packets: any[] = [];

      connectionPairs.forEach((pair, lineIndex) => {
        const p1 = nodes[pair[0]].pos;
        const p2 = nodes[pair[1]].pos;

        // Line
        const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x38BDF8, transparent: true });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
        lines.push({ mesh: line, lineIndex });

        // Packet
        const packetGeo = new THREE.SphereGeometry(0.07, 8, 8);
        const packetMat = new THREE.MeshBasicMaterial({ color: 0x6366F1, transparent: true });
        const packet = new THREE.Mesh(packetGeo, packetMat);
        scene.add(packet);
        packets.push({ mesh: packet, startPos: p1, endPos: p2, packetIndex: lineIndex });
      });

      // Floating QR Planes
      const qrPlanes: any[] = [];
      [0, 1, 2, 5].forEach((i) => { // Main, Science, Arts, Labs
        const canvas = document.createElement('canvas');
        canvas.width = 72;
        canvas.height = 72;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 72, 72);
        ctx.fillStyle = '#000000';
        for(let x = 6; x < 66; x+=10) {
          for(let y = 6; y < 66; y+=10) {
            if(Math.random() > 0.5) ctx.fillRect(x, y, 10, 10);
          }
        }
        // Corner markers
        ctx.fillRect(6, 6, 14, 14); ctx.fillStyle = '#ffffff'; ctx.fillRect(9, 9, 8, 8); ctx.fillStyle = '#000000'; ctx.fillRect(11, 11, 4, 4);
        ctx.fillRect(52, 6, 14, 14); ctx.fillStyle = '#ffffff'; ctx.fillRect(55, 9, 8, 8); ctx.fillStyle = '#000000'; ctx.fillRect(57, 11, 4, 4);
        ctx.fillRect(6, 52, 14, 14); ctx.fillStyle = '#ffffff'; ctx.fillRect(9, 55, 8, 8); ctx.fillStyle = '#000000'; ctx.fillRect(11, 57, 4, 4);

        const tex = new THREE.CanvasTexture(canvas);
        const qrGeo = new THREE.PlaneGeometry(0.55, 0.55);
        const qrMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
        const qrPlane = new THREE.Mesh(qrGeo, qrMat);
        
        qrPlane.position.copy(nodes[i].pos);
        scene.add(qrPlane);
        qrPlanes.push({ mesh: qrPlane, index: i, baseY: nodes[i].pos.y });
      });

      // Cursor Tracking
      let targetRotY = 0;
      let targetRotX = 0;
      let mouseX = 0;
      let mouseY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      
      window.addEventListener('mousemove', handleMouseMove);

      const handleResize = () => {
        if(window.innerWidth < 1024) {
           camera.aspect = window.innerWidth / 300;
           renderer.setSize(window.innerWidth, 300);
        } else {
           camera.aspect = 560 / 480;
           renderer.setSize(560, 480);
        }
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', handleResize);
      handleResize();

      // Render Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const time = Date.now();

        // Buildings Pulse
        buildings.forEach(b => {
          const pulse = 0.7 + Math.sin(time * 0.0018 + b.index * 0.9) * 0.3;
          b.mesh.material.opacity = pulse * 0.85;
          b.wireMesh.material.opacity = pulse * 0.32;
        });

        // Nodes Pulse
        nodes.forEach(n => {
          n.mesh.material.opacity = 0.5 + Math.sin(time * 0.003 + n.index * 1.3) * 0.5;
          const s = 0.7 + Math.sin(time * 0.003 + n.index * 1.3) * 0.35;
          n.mesh.scale.setScalar(s);
        });

        // Lines Pulse
        lines.forEach(l => {
          l.mesh.material.opacity = 0.12 + Math.sin(time * 0.002 + l.lineIndex * 0.7) * 0.13;
        });

        // Packets Travel
        packets.forEach(p => {
          const t = (time * 0.0007 + p.packetIndex * 0.25) % 1;
          p.mesh.position.lerpVectors(p.startPos, p.endPos, t);
          p.mesh.material.opacity = Math.sin(t * Math.PI) * 0.95;
        });

        // QR Planes
        qrPlanes.forEach(qr => {
          qr.mesh.position.y = qr.baseY + 0.9 + Math.sin(time * 0.0022 + qr.index) * 0.18;
          qr.mesh.rotation.y += 0.006;
          qr.mesh.material.opacity = 0.45 + Math.sin(time * 0.002 + qr.index * 0.7) * 0.3;
        });

        // Scene Tilt
        targetRotY += (mouseX * 0.55 - targetRotY) * 0.04;
        targetRotX += (mouseY * 0.3 - targetRotX) * 0.04;
        
        scene.rotation.y = targetRotY;
        scene.rotation.x = -0.55 + targetRotX;

        renderer.render(scene, camera);
      };

      animate();

      cleanup = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (mountRef.current) mountRef.current.innerHTML = '';
      };
    };

    loadThreeJS();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes campus-enter {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
      <div style={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(99, 102, 241, 0.12)',
          boxShadow: '0 24px 80px rgba(99, 102, 241, 0.1), 0 8px 32px rgba(99, 102, 241, 0.07)',
          animation: 'campus-enter 1s ease-out 0.3s both',
          width: '560px',
          height: '480px',
          maxWidth: '100%',
          overflow: 'hidden'
      }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }}></div>
      </div>
    </>
  );
}
