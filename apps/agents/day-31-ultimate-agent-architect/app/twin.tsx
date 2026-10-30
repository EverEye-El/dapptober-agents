'use client';
import {useEffect,useRef} from 'react';
import * as THREE from 'three';

// Procedural geometry keeps the machine independent of external model/CDN availability.
export default function Twin({count,active,motion=true}:{count:number;active:string;motion?:boolean}){
 const host=useRef<HTMLDivElement>(null),settings=useRef({count,active,motion});
 settings.current={count,active,motion};
 useEffect(()=>{
  const el=host.current!;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{el.textContent='3D unavailable · blueprint remains fully usable';return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;el.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,80);
  camera.position.set(3.9,2.8,7.6);camera.lookAt(0,.5,0);
  scene.add(new THREE.HemisphereLight(0xffd3a6,0x17100d,2.8));
  const key=new THREE.DirectionalLight(0xffbc7e,5);key.position.set(2,6,5);scene.add(key);
  const rim=new THREE.PointLight(0xff732c,65,18);rim.position.set(-3,2,-3);scene.add(rim);
  const faceLight=new THREE.PointLight(0xffd5aa,18,10);faceLight.position.set(0,1,5);scene.add(faceLight);
  const metal=new THREE.MeshStandardMaterial({color:0x51483f,metalness:.75,roughness:.38});
  const dark=new THREE.MeshStandardMaterial({color:0x252220,metalness:.7,roughness:.4});
  const trim=new THREE.MeshStandardMaterial({color:0xd59a64,metalness:.7,roughness:.26});
  const lens=new THREE.MeshBasicMaterial({color:0xff2818,toneMapped:false});
  const machine=new THREE.Group();machine.position.y=.8;scene.add(machine);
  const sphere=(parent:THREE.Object3D,x:number,y:number,z:number,r:number,material:THREE.Material,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,48,32),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;};
  const torus=(parent:THREE.Object3D,x:number,y:number,z:number,r:number,tube:number,material:THREE.Material)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,tube,12,64),material);m.position.set(x,y,z);parent.add(m);return m;};
  sphere(machine,0,.3,0,1,dark,1.04,.72,1.28);
  for(let i=0;i<8;i++){const plate=new THREE.Mesh(new THREE.SphereGeometry(1.025,24,24,i*Math.PI/4+.035,Math.PI/4-.07,.08,1.38),metal);plate.position.y=.3;plate.scale.set(1.04,.72,1.28);machine.add(plate);}
  sphere(machine,0,.2,.77,.8,dark,1,.72,.6);
  // Layered cranial plates and a vented rear engine rather than a humanoid body.
  for(let i=0;i<7;i++){const plate=torus(machine,0,.26,-.7+i*.14,.62+i*.025,.035,trim);plate.scale.set(1,.74,1);}
  for(const side of [-1,1]){sphere(machine,side*.91,.18,-.1,.34,dark,.55,.85,1.3);for(let j=0;j<5;j++){const fin=torus(machine,side*.98,.18,-.4+j*.13,.22,.025,trim);fin.rotation.y=Math.PI/2;}}
  // Nine inset optical assemblies, each with a machined bezel and emissive glass.
  const eyes:THREE.Mesh[]=[];
  for(const [x,y,r] of [[0,.48,.18],[-.37,.32,.14],[.37,.32,.14],[-.59,.06,.11],[.59,.06,.11],[-.26,-.03,.13],[.26,-.03,.13],[-.18,-.3,.085],[.18,-.3,.085]]){
   const z=1.3-Math.abs(x)*.17;sphere(machine,x,y,z,r*1.28,dark,1,1,.3);torus(machine,x,y,z+.04,r,.026,trim);eyes.push(sphere(machine,x,y,z+.065,r*.8,lens,1,1,.34));
  }
  const arms:THREE.Group[]=[];
  const armCount=10,segments=17;
  const jointGeometry=new THREE.SphereGeometry(.065,12,8);
  const ringGeometry=new THREE.TorusGeometry(.095,.018,6,12);
  const direction=new THREE.Vector3(0,1,0);
  for(let i=0;i<armCount;i++){
   const theta=i/armCount*Math.PI*2,arm=new THREE.Group(),points:THREE.Vector3[]=[];
   for(let k=0;k<=segments;k++){const t=k/segments,spread=.72+t*2.4;
    points.push(new THREE.Vector3(Math.cos(theta)*spread, -.05-t*1.8+Math.sin(t*Math.PI*1.6+theta)*.24, -.65-Math.sin(theta)*(.45+t*.7)-t*.6));}
   const curve=new THREE.CatmullRomCurve3(points),tube=new THREE.Mesh(new THREE.TubeGeometry(curve,88,.055,10,false),dark);arm.add(tube);
   for(let k=0;k<segments;k++){
    const t=k/segments,p=curve.getPoint(t),tangent=curve.getTangent(t);
    const joint=new THREE.Mesh(jointGeometry,metal);joint.position.copy(p);joint.scale.setScalar(1.65-t*.8);arm.add(joint);
    const cuff=new THREE.Mesh(ringGeometry,k%4===0?trim:metal);cuff.position.copy(p);cuff.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),tangent);cuff.scale.setScalar(1.2-t*.45);arm.add(cuff);
   }
   const tip=curve.getPoint(1),claw=new THREE.Mesh(new THREE.ConeGeometry(.11,.4,24),trim);claw.position.copy(tip);claw.quaternion.setFromUnitVectors(direction,curve.getTangent(1));arm.add(claw);
   machine.add(arm);arms.push(arm);
  }
  const platform=new THREE.Mesh(new THREE.CylinderGeometry(3.25,3.35,.12,128),dark);platform.position.y=-1.7;scene.add(platform);
  const halo=torus(scene,0,-1.62,0,3.28,.012,trim);halo.rotation.x=Math.PI/2;
  const grid=new THREE.GridHelper(24,48,0x66402a,0x261c15);grid.position.y=-1.8;scene.add(grid);
  const nodes:THREE.Mesh[]=[];
  for(let i=0;i<6;i++){const n=new THREE.Mesh(new THREE.TorusGeometry(.13,.025,12,36),trim);scene.add(n);nodes.push(n);}
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');let angle=-.2,drag=false,last=0,raf=0,lastTime=performance.now(),elapsed=0;
  const down=(e:PointerEvent)=>{drag=true;last=e.clientX;renderer.domElement.setPointerCapture(e.pointerId);};
  const move=(e:PointerEvent)=>{if(drag){angle+=(e.clientX-last)*.008;last=e.clientX;}};
  const up=()=>{drag=false;};
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up);
  const resize=new ResizeObserver(()=>{const {width,height}=el.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.position.z=width/height<1?11:7.6;camera.updateProjectionMatrix();});resize.observe(el);
  function frame(){raf=requestAnimationFrame(frame);const now=performance.now(),dt=Math.min((now-lastTime)/1000,.05);lastTime=now;const s=settings.current,animate=s.motion&&!reduce.matches;if(animate){elapsed+=dt;if(!drag)angle+=dt*.035;}machine.rotation.y=angle;machine.position.y=.8+Math.sin(elapsed*.7)*.065;
   arms.forEach((arm,i)=>{arm.rotation.z=Math.sin(elapsed*.65+i*.8)*.035;arm.rotation.y=Math.cos(elapsed*.5+i)*.025;});
   eyes.forEach((eye,i)=>{const scale=i===Math.abs(s.active.split('').reduce((sum,c)=>sum+c.charCodeAt(0),0))%eyes.length?1.13:1;eye.scale.set(scale,scale,.34);});
   nodes.forEach((n,i)=>{n.visible=i<s.count;const theta=i/6*Math.PI*2+elapsed*.09;n.position.set(Math.cos(theta)*2.5,1.7+Math.sin(theta)*.28,Math.sin(theta)*2.1);n.lookAt(camera.position);});renderer.render(scene,camera);
  }frame();
  return()=>{cancelAnimationFrame(raf);resize.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',up);const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div className="twin-canvas" ref={host} role="img" aria-label={`Copper sentinel digital twin with articulated mechanical tendrils and ${count} composed skills. Drag to rotate.`}/>;
}
