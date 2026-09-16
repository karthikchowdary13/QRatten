'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function CampusMapSection() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Intersection Observer for Entrance Animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
      
      // We start with a neutral group to tilt
      const sceneTiltGroup = new THREE.Group();
      scene.add(sceneTiltGroup);

      const camera = new THREE.PerspectiveCamera(45, 500 / 460, 0.1, 1000);
      camera.position.set(0, 8, 10);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(500, 460);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      sceneTiltGroup.add(ambientLight);

      const light1 = new THREE.DirectionalLight(0x6366F1, 0.8);
      light1.position.set(5, 10, 5);
      sceneTiltGroup.add(light1);

      const light2 = new THREE.PointLight(0x38BDF8, 0.5);
      light2.position.set(-5, 8, -5);
      sceneTiltGroup.add(light2);

      // Ground Plane
      const planeGeo = new THREE.PlaneGeometry(18, 18);
      const planeMat = new THREE.MeshBasicMaterial({ color: 0xEEF2FF, transparent: true, opacity: 0.6 });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -Math.PI / 2;
      sceneTiltGroup.add(plane);

      // Grid Helper
      const gridHelper = new THREE.GridHelper(18, 18, 0x6366F1, 0x6366F1);
      (gridHelper.material as any).transparent = true;
      (gridHelper.material as any).opacity = 0.15;
      sceneTiltGroup.add(gridHelper);

      // Buildings Data
      const buildingsData = [
        { name: "Main Block", size: [2.2, 1.2, 2], pos: [0, 0.6, 0] },
        { name: "Science", size: [1.4, 0.8, 1.4], pos: [-3.5, 0.4, -2] },
        { name: "Arts", size: [1.4, 0.8, 1.4], pos: [3.5, 0.4, -2] },
        { name: "Library", size: [1.6, 0.6, 1.2], pos: [-3.5, 0.3, 2] },
        { name: "Admin", size: [1.2, 1.0, 1.2], pos: [3.5, 0.5, 2] },
        { name: "Labs", size: [1.0, 0.7, 1.8], pos: [0, 0.35, -4] },
        { name: "Hostel A", size: [0.9, 0.6, 0.9], pos: [-5.5, 0.3, 0] },
        { name: "Hostel B", size: [0.9, 0.6, 0.9], pos: [5.5, 0.3, 0] }
      ];

      const buildings: any[] = [];
      const nodes: any[] = [];

      buildingsData.forEach((data, index) => {
        // Main Mesh
        const geo = new THREE.BoxGeometry(data.size[0], data.size[1], data.size[2]);
        const mat = new THREE.MeshPhongMaterial({ color: 0xC7D2FE, transparent: true, opacity: 0.85, shininess: 60 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);
        sceneTiltGroup.add(mesh);

        // Wireframe
        const wireMat = new THREE.MeshBasicMaterial({ color: 0x6366F1, wireframe: true, transparent: true, opacity: 0.3 });
        const wireMesh = new THREE.Mesh(geo, wireMat);
        wireMesh.position.copy(mesh.position);
        sceneTiltGroup.add(wireMesh);

        // Glowing Node
        const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const nodeMat = new THREE.MeshBasicMaterial({ color: 0x6366F1, transparent: true });
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        const roofY = data.pos[1] + data.size[1] / 2;
        node.position.set(data.pos[0], roofY, data.pos[2]);
        sceneTiltGroup.add(node);

        // Label
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, 256, 64);
        ctx.font = '500 24px Inter, sans-serif'; // Scale up text for crispness
        ctx.fillStyle = '#4F46E5';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.name, 128, 32);
        
        const tex = new THREE.CanvasTexture(canvas);
        const labelGeo = new THREE.PlaneGeometry(1.2, 0.3);
        const labelMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false });
        const label = new THREE.Mesh(labelGeo, labelMat);
        label.position.set(data.pos[0], roofY + 0.5, data.pos[2]);
        label.rotation.x = -Math.PI / 4; // Angle to face camera roughly
        sceneTiltGroup.add(label);

        buildings.push({ mesh, wireMesh, index });
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
        sceneTiltGroup.add(line);
        lines.push({ mesh: line, lineIndex });

        // Packet
        const packetGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const packetMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true });
        const packet = new THREE.Mesh(packetGeo, packetMat);
        sceneTiltGroup.add(packet);
        packets.push({ mesh: packet, startPos: p1, endPos: p2, packetIndex: lineIndex });
      });

      // Floating QR Planes
      const qrPlanes: any[] = [];
      [0, 1, 2, 5].forEach((i) => { // Main, Science, Arts, Labs
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#000000';
        for(let x = 4; x < 60; x+=12) {
          for(let y = 4; y < 60; y+=12) {
            if(Math.random() > 0.5) ctx.fillRect(x, y, 12, 12);
          }
        }
        // Corner markers
        ctx.fillRect(4, 4, 16, 16); ctx.fillStyle = '#ffffff'; ctx.fillRect(8, 8, 8, 8); ctx.fillStyle = '#000000'; ctx.fillRect(10, 10, 4, 4);
        ctx.fillRect(44, 4, 16, 16); ctx.fillStyle = '#ffffff'; ctx.fillRect(48, 8, 8, 8); ctx.fillStyle = '#000000'; ctx.fillRect(50, 10, 4, 4);
        ctx.fillRect(4, 44, 16, 16); ctx.fillStyle = '#ffffff'; ctx.fillRect(8, 48, 8, 8); ctx.fillStyle = '#000000'; ctx.fillRect(10, 50, 4, 4);

        const tex = new THREE.CanvasTexture(canvas);
        const qrGeo = new THREE.PlaneGeometry(0.5, 0.5);
        const qrMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
        const qrPlane = new THREE.Mesh(qrGeo, qrMat);
        
        qrPlane.position.copy(nodes[i].pos);
        sceneTiltGroup.add(qrPlane);
        qrPlanes.push({ mesh: qrPlane, index: i, baseY: nodes[i].pos.y });
      });

      // Cursor Tracking
      let targetTiltX = 0;
      let targetTiltY = 0;
      let normalizedMouseX = 0;
      let normalizedMouseY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if(!rect) return;
        normalizedMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        normalizedMouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      };
      
      if(mountRef.current) {
        mountRef.current.addEventListener('mousemove', handleMouseMove);
      }

      // Render Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const time = Date.now();

        // Buildings Pulse
        buildings.forEach(b => {
          const pulse = 0.75 + Math.sin(time * 0.002 + b.index * 0.8) * 0.25;
          b.mesh.material.opacity = pulse * 0.85;
          b.wireMesh.material.opacity = pulse * 0.35;
        });

        // Nodes Pulse
        nodes.forEach(n => {
          n.mesh.material.opacity = 0.6 + Math.sin(time * 0.003 + n.index * 1.2) * 0.4;
          const s = 0.8 + Math.sin(time * 0.003 + n.index * 1.2) * 0.3;
          n.mesh.scale.setScalar(s);
        });

        // Lines Pulse
        lines.forEach(l => {
          l.mesh.material.opacity = 0.15 + Math.sin(time * 0.002 + l.lineIndex * 0.6) * 0.15;
        });

        // Packets Travel
        packets.forEach(p => {
          const t = (time * 0.0008 + p.packetIndex * 0.3) % 1;
          p.mesh.position.lerpVectors(p.startPos, p.endPos, t);
          p.mesh.material.opacity = Math.sin(t * Math.PI) * 0.9;
        });

        // QR Planes
        qrPlanes.forEach(qr => {
          qr.mesh.position.y = qr.baseY + 0.8 + Math.sin(time * 0.002 + qr.index) * 0.15;
          qr.mesh.rotation.y += 0.005;
          qr.mesh.material.opacity = 0.5 + Math.sin(time * 0.002 + qr.index) * 0.3;
        });

        // Scene Tilt
        targetTiltX += (normalizedMouseY * 0.4 - targetTiltX) * 0.05;
        targetTiltY += (normalizedMouseX * 0.5 - targetTiltY) * 0.05;
        
        sceneTiltGroup.rotation.x = targetTiltX;
        sceneTiltGroup.rotation.y = targetTiltY;

        renderer.render(scene, camera);
      };

      animate();

      cleanup = () => {
        if(mountRef.current) mountRef.current.removeEventListener('mousemove', handleMouseMove);
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
    <section ref={sectionRef} style={{ background: '#F8F9FF', padding: '100px 0', width: '100%', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px' }}>
        
        {/* Left Column (45%) */}
        <div style={{ 
            flex: '1 1 45%',
            minWidth: '300px',
            transform: isVisible ? 'translateX(0)' : 'translateX(-40px)',
            opacity: isVisible ? 1 : 0,
            transition: 'transform 0.8s ease-out, opacity 0.8s ease-out'
        }}>
          <span style={{ 
              display: 'block', 
              fontSize: '11px', 
              letterSpacing: '0.15em', 
              color: '#6366F1', 
              fontWeight: 600, 
              marginBottom: '16px',
              textTransform: 'uppercase'
          }}>
            MULTI-INSTITUTION MANAGEMENT
          </span>
          <h2 style={{ 
              fontSize: 'clamp(32px, 5vw, 48px)', 
              fontWeight: 700, 
              color: '#0F172A', 
              lineHeight: 1.1, 
              letterSpacing: '-0.02em',
              marginBottom: '24px'
          }}>
            Every Department.<br />
            Every Session.<br />
            One Platform.
          </h2>
          <p style={{ 
              fontSize: '18px', 
              lineHeight: 1.6, 
              color: '#475569', 
              marginBottom: '32px'
          }}>
            QRatten connects every building, department, and classroom across your entire institution. Monitor attendance flow in real time from a single unified dashboard.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {['12+ Departments per Institution', 'Real-Time Data Flow', 'Zero Manual Entry'].map((stat, i) => (
              <div key={i} style={{
                  border: '1px solid rgba(99,102,241,0.15)',
                  background: 'rgba(255,255,255,0.8)',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1E293B'
              }}>
                {stat}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (55%) */}
        <div style={{ 
            flex: '1 1 50%',
            display: 'flex',
            justifyContent: 'center',
            transform: isVisible ? 'translateX(0)' : 'translateX(40px)',
            opacity: isVisible ? 1 : 0,
            transition: 'transform 0.8s ease-out 0.1s, opacity 0.8s ease-out 0.1s'
        }}>
          <div style={{
              boxShadow: '0 24px 80px rgba(99, 102, 241, 0.12), 0 8px 32px rgba(99, 102, 241, 0.08)',
              borderRadius: '24px',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              padding: '16px',
              width: '532px', // 500px canvas + 32px padding
              maxWidth: '100%',
              overflow: 'hidden'
          }}>
            <div ref={mountRef} style={{ width: '100%', height: '460px', position: 'relative' }}>
                {/* Canvas will be injected here */}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
