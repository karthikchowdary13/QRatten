'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Rig {
    g: THREE.Group; speed: number; off: number;
    ll: THREE.Group; rl: THREE.Group; la: THREE.Group; ra: THREE.Group;
}

const VERT = `varying vec3 vP; void main(){ vP=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const FRAG = `varying vec3 vP; uniform vec3 uT,uH,uB;
void main(){ float h=normalize(vP).y; vec3 c=h>0.0?mix(uH,uT,pow(h,0.55)):mix(uH,uB,clamp(-h*2.0,0.0,1.0)); gl_FragColor=vec4(c,1.0); }`;

export default function ThreeBackground() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current; if (!el) return;
        const dk = !document.documentElement.classList.contains('light');

        // Palette
        const C = {
            // White background, black/charcoal everything
            skyT:  new THREE.Color('#ffffff'),
            skyH:  new THREE.Color('#f0f0f0'),
            skyB:  new THREE.Color('#e8e8e8'),
            fog:   new THREE.Color('#f5f5f5'),
            gnd:   0xebebeb,
            plaza: 0xe0e0e0,
            path:  0xd4d4d4,
            wMain: 0x1a1a1a,
            wDark: 0x0d0d0d,
            wAcc:  0x2c2c2c,
            col:   0x383838,
            roof:  0x111111,
            win:   0xc8d8e8,
            winL:  0xddeeff,
            door:  0x050505,
            gate:  0x1a1a1a,
            gAcc:  0x2e2e2e,
            step:  0x282828,
            tF1:   0x1c2e1c,
            tF2:   0x141e14,
            tTr:   0x1a1008,
            lamp:  0x1a1a1a,
            glow:  0xfff8e0,
            skin:  0xd4a870,
            pant:  0x1a1a1a,
            shoe:  0x080808,
        };

        // Scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(C.fog, 0.014);

        // Sky dome
        const sky = new THREE.Mesh(
            new THREE.SphereGeometry(90, 32, 16),
            new THREE.ShaderMaterial({
                uniforms: { uT:{value:C.skyT}, uH:{value:C.skyH}, uB:{value:C.skyB} },
                vertexShader: VERT, fragmentShader: FRAG, side: THREE.BackSide,
            })
        );
        scene.add(sky);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        el.appendChild(renderer.domElement);

        // Camera
        const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
        cam.position.set(0, 6.5, 22);
        cam.lookAt(0, 1.5, 0);

        const resize = () => {
            const w = el.clientWidth || window.innerWidth;
            const h = el.clientHeight || window.innerHeight;
            renderer.setSize(w, h); cam.aspect = w/h; cam.updateProjectionMatrix();
        };
        resize();

        // Helpers
        const M  = (hex: number) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.82, metalness: 0.05 });
        const BX = (w:number,h:number,d:number,hex:number,cast=true) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), M(hex));
            m.castShadow = cast; m.receiveShadow = true; return m;
        };
        const add = (m: THREE.Object3D, x=0,y=0,z=0) => { m.position.set(x,y,z); scene.add(m); return m; };

        // Ground
        const gnd = new THREE.Mesh(new THREE.PlaneGeometry(120,120), M(C.gnd));
        gnd.rotation.x = -Math.PI/2; gnd.position.y = -2; gnd.receiveShadow=true; scene.add(gnd);

        const plz = new THREE.Mesh(new THREE.PlaneGeometry(34,22), M(C.plaza));
        plz.rotation.x=-Math.PI/2; plz.position.set(0,-1.985,-1); plz.receiveShadow=true; scene.add(plz);

        const pth = new THREE.Mesh(new THREE.PlaneGeometry(4.2,42), M(C.path));
        pth.rotation.x=-Math.PI/2; pth.position.set(0,-1.975,9); pth.receiveShadow=true; scene.add(pth);
        [-2.2,2.2].forEach(x=>{
            const e=new THREE.Mesh(new THREE.PlaneGeometry(0.18,42),M(C.step));
            e.rotation.x=-Math.PI/2; e.position.set(x,-1.97,9); e.receiveShadow=true; scene.add(e);
        });

        // ── BUILDING ────────────────────────────────────────────

        // Central body (protrudes forward)
        add(BX(14,10,6,C.wMain), 0,3,-8);
        // Tower atop center
        add(BX(7,3.5,5.5,C.wAcc), 0,9.75,-8);
        add(BX(8,0.45,6.5,C.roof), 0,11.7,-8);
        add(BX(8.6,0.28,7,C.wDark), 0,11.98,-8);
        // Central roof band
        add(BX(14.6,0.5,6.6,C.roof), 0,8.3,-8);
        add(BX(15.2,0.28,7.2,C.wDark), 0,8.62,-8);
        // Floor separator band
        add(BX(14.2,0.38,6.1,C.wDark), 0,0.8,-8);

        // Wings
        [-1,1].forEach(s=>{
            const wx = s*12.5;
            add(BX(8,8,5,C.wMain), wx,2,-9.5);
            add(BX(8.6,0.45,5.6,C.roof), wx,6.25,-9.5);
            add(BX(9.2,0.28,6.2,C.wDark), wx,6.57,-9.5);
            add(BX(8.2,0.35,5.1,C.wDark), wx,0.5,-9.5);
        });

        // Entrance portico (deep columns)
        const colM = M(C.col);
        [-3.5,-1.75,0,1.75,3.5].forEach(x=>{
            const c=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,6.5,10),colM);
            c.castShadow=true; add(c, x,1.25,-5.3);
            const cap=BX(0.58,0.25,0.58,C.roof); add(cap, x,4.6,-5.3);
        });
        // Entablature
        add(BX(11,0.45,0.7,C.roof), 0,4.85,-5.3);
        add(BX(11.5,0.28,0.8,C.wDark), 0,5.15,-5.3);

        // Steps
        [0,1,2].forEach(i=>{
            add(BX(11-i*0.5,0.28,0.85,C.step), 0,-2+i*0.28,-5.5+i*0.38);
        });

        // Door
        add(BX(1.6,2.8,0.15,C.door), 0,-0.6,-5.0);

        // Windows — central (2 rows, skip door col)
        [-2.5,-1.25,1.25,2.5].forEach(x=>{
            [0,1].forEach(r=>{
                const lit = r===1&&Math.abs(x)<2;
                const wm = new THREE.MeshBasicMaterial({color: lit?C.winL:C.win});
                const w=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.5,0.12),wm);
                w.position.set(x, r*2.8-0.4,-5.05); scene.add(w);
                // Frame
                add(BX(1.55,1.72,0.1,C.wDark), x,r*2.8-0.4,-5.12);
            });
        });
        // Windows — tower
        [-1.5,0,1.5].forEach(x=>{
            const wm=new THREE.MeshBasicMaterial({color:C.winL});
            const w=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.6,0.12),wm);
            w.position.set(x,9.6,-5.3); scene.add(w);
        });
        // Wings windows
        [-1,1].forEach(s=>{
            [-1.5,0,1.5].forEach(x=>{
                [0,1].forEach(r=>{
                    const wm=new THREE.MeshBasicMaterial({color:C.win});
                    const w=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.3,0.12),wm);
                    w.position.set(s*12.5+x,r*2.5-0.6,-7.0); scene.add(w);
                    add(BX(1.3,1.52,0.1,C.wDark),s*12.5+x,r*2.5-0.6,-7.08);
                });
            });
        });

        // Name board
        add(BX(6,0.7,0.22,C.roof), 0,5.55,-5.05);

        // Flag pole
        const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.07,7,8),M(C.lamp));
        add(pole, 0,1.5,-4.8);
        // Flag (colored plane)
        const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.4,0.9),
            new THREE.MeshBasicMaterial({color:0xe83030,side:THREE.DoubleSide}));
        flag.position.set(0.75,5,-4.8); scene.add(flag);

        // ── GATE ──────────────────────────────────────────────
        [-2.3,2.3].forEach(x=>{
            add(BX(0.55,5.2,0.55,C.gate), x,0.6,-2.5);
            add(BX(0.78,0.4,0.78,C.gAcc), x,3.3,-2.5);
            const g=new THREE.Mesh(new THREE.SphereGeometry(0.17,8,8),
                new THREE.MeshBasicMaterial({color:C.glow}));
            g.position.set(x,3.58,-2.5); scene.add(g);
        });
        add(BX(5.15,0.42,0.55,C.gate), 0,3.08,-2.5);
        add(BX(4.6,0.62,0.3,C.gAcc), 0,3.08,-2.22);
        // Fence bars
        [-4,-3,-1,1,3,4].forEach(i=>{
            add(BX(0.09,2.9,0.09,C.gate), i*0.52,-0.55,-2.5);
        });

        // ── LAMP POSTS ────────────────────────────────────────
        const lamps: THREE.Vector2[] = [
            new THREE.Vector2(-3.6,14), new THREE.Vector2(3.6,14),
            new THREE.Vector2(-3.6,8),  new THREE.Vector2(3.6,8),
            new THREE.Vector2(-3.6,2),  new THREE.Vector2(3.6,2),
        ];
        lamps.forEach(({x,y:z})=>{
            const post=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.1,4.8,7),M(C.lamp));
            post.castShadow=true; add(post,x,0.4,z);
            const sx = x<0?0.6:-0.6;
            add(BX(0.6,0.07,0.07,C.lamp), x+sx/2,2.65,z);
            const gb=new THREE.Mesh(new THREE.SphereGeometry(0.15,7,7),
                new THREE.MeshBasicMaterial({color:C.glow}));
            gb.position.set(x+sx,2.65,z); scene.add(gb);
        });

        // ── TREES ─────────────────────────────────────────────
        const addTree=(x:number,z:number,s:number=1)=>{
            const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.1*s,0.16*s,1.5*s,7),M(C.tTr));
            tr.castShadow=true; add(tr,x,-1.25+0.75*s,z);
            [0,0.7,1.3].forEach((yo,i)=>{
                const cone=new THREE.Mesh(
                    new THREE.ConeGeometry((0.95-i*0.22)*s,(1.35-i*0.1)*s,7),
                    M(i%2===0?C.tF1:C.tF2));
                cone.castShadow=true; add(cone,x,-0.45+(yo+0.75)*s,z);
            });
        };
        [13,8,3].forEach(z=>{addTree(-4.8,z,1.05);addTree(4.8,z,1.0);});
        addTree(-9,-5,1.3); addTree(-13,-2,1.1); addTree(-11,-7,1.4);
        addTree(9,-5,1.2);  addTree(13,-2,1.0);  addTree(11,-7,1.3);
        addTree(-20,4,1.6); addTree(20,4,1.5);

        // ── STUDENTS ──────────────────────────────────────────
        const shirts=[0x1a1a1a,0x222222,0x111111,0x2a2a2a,0x181818,0x202020];
        const bags  =[0x0d0d0d,0x1a1a1a,0x111111,0x222222];
        const rigs:Rig[]=[];

        const mkLeg=(root:THREE.Group,sx:number)=>{
            const piv=new THREE.Group(); piv.position.set(sx*0.1,0.32,0); root.add(piv);
            const th=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.34,0.15),M(C.pant));
            th.position.y=-0.17; th.castShadow=true; piv.add(th);
            const sh=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.28,0.13),M(C.pant));
            sh.position.y=-0.43; sh.castShadow=true; piv.add(sh);
            const sk=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.1,0.22),M(C.shoe));
            sk.position.set(0,-0.6,0.04); piv.add(sk);
            return piv;
        };
        const mkArm=(root:THREE.Group,sx:number,sc:number)=>{
            const piv=new THREE.Group(); piv.position.set(sx*0.25,0.98,0); root.add(piv);
            const ua=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.3,0.13),M(sc));
            ua.position.y=-0.15; ua.castShadow=true; piv.add(ua);
            const la=new THREE.Mesh(new THREE.BoxGeometry(0.11,0.26,0.12),M(C.skin));
            la.position.y=-0.38; la.castShadow=true; piv.add(la);
            return piv;
        };

        for(let i=0;i<7;i++){
            const sc=shirts[i%shirts.length]; const bc=bags[i%bags.length];
            const root=new THREE.Group();
            // Head
            const hd=new THREE.Mesh(new THREE.SphereGeometry(0.175,10,10),M(C.skin));
            hd.position.y=1.34; hd.castShadow=true; root.add(hd);
            // Hair
            const hr=new THREE.Mesh(new THREE.SphereGeometry(0.18,10,6),M(0x0d0d0d));
            hr.position.set(0,1.42,-0.02); hr.scale.set(1,0.6,1); root.add(hr);
            // Torso
            const to=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.54,0.24),M(sc));
            to.position.y=0.78; to.castShadow=true; root.add(to);
            // Waist
            const wa=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.18,0.23),M(C.pant));
            wa.position.y=0.41; root.add(wa);
            // Backpack
            const bp=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.36,0.16),M(bc));
            bp.position.set(0,0.78,-0.21); bp.castShadow=true; root.add(bp);
            // Books
            const bk=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.05,0.28),M(0x1a1a1a));
            bk.position.set(-0.31,0.58,0.06); bk.rotation.z=0.15; root.add(bk);

            const ll=mkLeg(root,-1), rl=mkLeg(root,1);
            const la=mkArm(root,-1,sc), ra=mkArm(root,1,sc);

            root.position.set((Math.random()-0.5)*2.6, -2, 18+i*5+Math.random()*4);
            root.rotation.y=Math.PI;
            scene.add(root);
            rigs.push({g:root, speed:0.015+Math.random()*0.009, off:i*(Math.PI/3.5), ll,rl,la,ra});
        }

        // ── PARTICLES ─────────────────────────────────────────
        const N=60;
        const pPos=new Float32Array(N*3);
        for(let i=0;i<N;i++){
            pPos[i*3]  =(Math.random()-0.5)*40;
            pPos[i*3+1]= Math.random()*10-1;
            pPos[i*3+2]=(Math.random()-0.5)*40;
        }
        const pGeo=new THREE.BufferGeometry();
        pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
        const pMat=new THREE.PointsMaterial({
            color: 0xaaaaaa, size: 0.06, transparent: true, opacity: 0.35,
        });
        const particles=new THREE.Points(pGeo,pMat); scene.add(particles);

        // ── LIGHTING (white scene — soft neutral)
        scene.add(new THREE.AmbientLight(0xffffff, 0.85));

        const sun = new THREE.DirectionalLight(0xffffff, 1.6);
        sun.position.set(14,20,14); sun.castShadow=true;
        sun.shadow.camera.left=-30; sun.shadow.camera.right=30;
        sun.shadow.camera.top=30;  sun.shadow.camera.bottom=-30;
        sun.shadow.mapSize.set(2048,2048); sun.shadow.bias=-0.001;
        scene.add(sun);

        const fill = new THREE.DirectionalLight(0xf0f0ff, 0.5);
        fill.position.set(-12,8,8); scene.add(fill);

        scene.add(new THREE.HemisphereLight(0xffffff, 0xdddddd, 0.6));

        // Subtle window glow
        [[-5,1,-7],[5,1,-7],[0,2,-5.5]].forEach(([x,y,z])=>{
            const pl=new THREE.PointLight(0xc8d8ff, 0.4, 10);
            pl.position.set(x,y,z); scene.add(pl);
        });

        // ── ANIMATION ─────────────────────────────────────────
        let animId:number; let t=0; let last=performance.now();
        const pArr=pPos;

        const tick=(now:number)=>{
            animId=requestAnimationFrame(tick);
            const dt=Math.min((now-last)/1000,0.05); last=now; t+=dt;

            // Students walk
            rigs.forEach(r=>{
                r.g.position.z-=r.speed;
                if(r.g.position.z<-6){ r.g.position.z=22+Math.random()*6; r.g.position.x=(Math.random()-0.5)*2.6; }
                const ph=t*4.5+r.off, sw=0.44;
                r.ll.rotation.x=Math.sin(ph)*sw;
                r.rl.rotation.x=Math.sin(ph+Math.PI)*sw;
                r.la.rotation.x=Math.sin(ph+Math.PI)*0.28;
                r.ra.rotation.x=Math.sin(ph)*0.28;
                r.g.position.y=-2+Math.abs(Math.sin(ph))*0.045;
            });

            // Float particles
            for(let i=0;i<N;i++){
                pArr[i*3+1]+=0.008;
                if(pArr[i*3+1]>10) pArr[i*3+1]=-1;
            }
            pGeo.attributes.position.needsUpdate=true;

            // Flag wave
            flag.rotation.y=Math.sin(t*1.5)*0.25;

            // Cinematic camera
            cam.position.y=6.5+Math.sin(t*0.12)*0.12;
            cam.position.x=Math.sin(t*0.07)*0.2;

            renderer.render(scene,cam);
        };
        animId=requestAnimationFrame(tick);

        // Resize
        const ro=new ResizeObserver(resize); ro.observe(el);

        return ()=>{
            cancelAnimationFrame(animId); ro.disconnect();
            if(el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
            renderer.dispose(); pGeo.dispose();
        };
    },[]);

    return <div ref={ref} className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true"/>;
}
