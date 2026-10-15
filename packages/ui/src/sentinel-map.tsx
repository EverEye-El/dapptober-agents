'use client';
import {useEffect,useRef,useState} from 'react';
import type {SentinelState} from '@dapptober/types';
import type * as THREE from 'three';
import {fleetNodes,focalYaw,type FleetNode} from './sentinel-map-model';
const tones={idle:'#bc8250',ready:'#f7b96d',review:'#ffd594',blocked:'#fa6843',executed:'#b4c590',revoked:'#714835'};
export function SentinelMap({fleet,selected,onSelect,mode,stale}:{stale:boolean;fleet:SentinelState;selected:string;onSelect:(id:string)=>void;mode:'demo'|'real'}){
 const focus=useRef<((id:string)=>void)|null>(null);
 const host=useRef<HTMLDivElement>(null),update=useRef<((nodes:FleetNode[],selected:string,epoch:string)=>void)|null>(null),pick=useRef(onSelect);
 const [available,setAvailable]=useState(false),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false),[failed,setFailed]=useState(false);
 const pause=useRef(false),data=useRef({nodes:fleetNodes(fleet,Date.now()/1000+fleet.clock),selected,epoch:fleet.epoch});
 const nodes=fleetNodes(fleet,Date.now()/1000+fleet.clock);data.current={nodes,selected,epoch:fleet.epoch};pick.current=onSelect;pause.current=paused||reduced;
 useEffect(()=>{update.current?.(nodes,selected,fleet.epoch);});
 useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(mq.matches);change();mq.addEventListener('change',change);return()=>mq.removeEventListener('change',change);},[]);
 useEffect(()=>{
  const element=host.current;if(!element)return;
  let disposed=false,renderer:THREE.WebGLRenderer|undefined,scene:THREE.Scene|undefined,frame=0,observer:ResizeObserver|undefined,visibility:IntersectionObserver|undefined;
  let teardown=()=>{};
  void import('three').then(T=>{
   if(disposed)return;
   try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{setFailed(true);return;}
   const r=renderer;r.setPixelRatio(Math.min(devicePixelRatio,1.5));r.setClearColor('#100d0a',0);r.domElement.setAttribute('aria-hidden','true');element.appendChild(r.domElement);
   scene=new T.Scene();const world=scene;const camera=new T.PerspectiveCamera(40,1,.1,80);camera.position.set(0,8.8,12.8);camera.lookAt(0,0,0);
   const rig=new T.Group();world.add(rig);world.add(new T.AmbientLight('#efb480',1.6));const light=new T.PointLight('#f0a15f',45,18);light.position.set(0,3,0);world.add(light);
   const disposeObject=(obj:THREE.Object3D)=>obj.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();if(m.material){for(const material of Array.isArray(m.material)?m.material:[m.material]){const mat=material as THREE.MeshBasicMaterial;if(mat.map)mat.map.dispose();material.dispose();}}});
   const metal=(color:string)=>new T.MeshStandardMaterial({color,metalness:.65,roughness:.35,emissive:color,emissiveIntensity:.2});
   const line=(points:THREE.Vector3[],color:string,opacity=1)=>new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color,transparent:true,opacity}));
   const circle=(radius:number,y:number,color:string,opacity=.4)=>{const pts=Array.from({length:97},(_,i)=>new T.Vector3(Math.cos(i/96*Math.PI*2)*radius,y,Math.sin(i/96*Math.PI*2)*radius));return line(pts,color,opacity);};
   const grid=new T.GridHelper(18,36,'#6e4426','#302116');grid.position.y=-.7;rig.add(grid);
   const core=new T.Group();rig.add(core);const body=new T.Mesh(new T.IcosahedronGeometry(.85,0),metal('#de9958'));body.position.y=.55;core.add(body);
   const wire=new T.LineSegments(new T.EdgesGeometry(body.geometry),new T.LineBasicMaterial({color:'#ffd5a4'}));wire.position.copy(body.position);core.add(wire);
   for(let i=0;i<3;i++){const ring=new T.Mesh(new T.TorusGeometry(1.3+i*.2,.012,6,80),new T.MeshBasicMaterial({color:'#b97640',transparent:true,opacity:.6-i*.12}));ring.rotation.x=Math.PI/2+i*.35;ring.rotation.z=i*.5;core.add(ring);}
   const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;const glowCtx=glowCanvas.getContext('2d');if(glowCtx){const gradient=glowCtx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(245,143,66,.7)');gradient.addColorStop(.3,'rgba(210,104,33,.25)');gradient.addColorStop(1,'rgba(210,104,33,0)');glowCtx.fillStyle=gradient;glowCtx.fillRect(0,0,128,128);const glow=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(glowCanvas),transparent:true,blending:T.AdditiveBlending,depthWrite:false}));glow.position.y=.55;glow.scale.set(4,4,1);core.add(glow);}
   rig.add(circle(4.2,-.62,'#b77843'),circle(4.5,-.62,'#754629'),circle(2.4,-.62,'#754629',.22));
   const scan=line([new T.Vector3(0,-.6,0),new T.Vector3(4.5,-.6,0)],'#c7894b',.24);rig.add(scan);
   const fleetGroup=new T.Group();rig.add(fleetGroup);
   let satellites:{node:FleetNode;group:THREE.Group;body:THREE.Mesh;ring:THREE.Line;link:THREE.Line;path:THREE.QuadraticBezierCurve3;pulse:THREE.Mesh;phase:number}[]=[],lastKey='',lastFocus='';
   let yaw=0,targetYaw=0;
   const focusAgent=(id:string)=>{const index=satellites.findIndex(s=>s.node.id===id);if(index<0)return;targetYaw=focalYaw(index,satellites.length,yaw);if(pause.current)yaw=targetYaw;};focus.current=focusAgent;
   const rebuild=(next:FleetNode[],chosen:string,epoch:string)=>{
    const key=JSON.stringify([next,chosen,epoch]);if(key===lastKey)return;lastKey=key;
    disposeObject(fleetGroup);fleetGroup.clear();satellites=[];
    // All agents remain in the accessible list; cap GPU detail for large fleets.
    next.slice(0,24).forEach((node,i)=>{
     const angle=i/Math.max(next.slice(0,24).length,1)*Math.PI*2-Math.PI/2;
     const position=new T.Vector3(Math.cos(angle)*3.8,.15,Math.sin(angle)*3.8);
     const group=new T.Group();group.position.copy(position);fleetGroup.add(group);
     const mesh=new T.Mesh(new T.OctahedronGeometry(.32,0),metal(tones[node.status]));mesh.userData.agent=node.id;mesh.position.y=.4;group.add(mesh);
     const edges=new T.LineSegments(new T.EdgesGeometry(mesh.geometry),new T.LineBasicMaterial({color:node.id===chosen?'#ffe0b6':tones[node.status]}));edges.position.copy(mesh.position);group.add(edges);
     const boundary=circle(.63,0,tones[node.status],node.id===chosen?1:.5);group.add(boundary);
     const budget=new T.Mesh(new T.TorusGeometry(.72,.026,5,48,Math.PI*2*Math.max(.015,node.used)),new T.MeshBasicMaterial({color:tones[node.status]}));budget.rotation.x=Math.PI/2;group.add(budget);
     const path=new T.QuadraticBezierCurve3(new T.Vector3(0,.55,0),position.clone().multiplyScalar(.5).add(new T.Vector3(0,1.8,0)),position.clone().add(new T.Vector3(0,.4,0)));
     const link=line(path.getPoints(40),tones[node.status],node.active?.5:.12);fleetGroup.add(link);
     const pulse=new T.Mesh(new T.SphereGeometry(.065,8,6),new T.MeshBasicMaterial({color:tones[node.status]}));fleetGroup.add(pulse);pulse.visible=false;
     const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=100;const ctx=labelCanvas.getContext('2d');if(ctx){ctx.font='24px monospace';ctx.textAlign='center';ctx.fillStyle=node.id===chosen?'#ffe0b6':'#c39a76';ctx.fillText(node.name.slice(0,25),256,35);ctx.font='18px monospace';ctx.fillStyle=tones[node.status];ctx.fillText(node.status.toUpperCase(),256,70);const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(labelCanvas),transparent:true,depthTest:false}));sprite.position.set(0,-.1,.55);sprite.scale.set(2.1,.42,1);group.add(sprite);}
     satellites.push({node,group,body:mesh,ring:boundary,link,path,pulse,phase:i*.31});
    });
    const focusKey=JSON.stringify([chosen,next.slice(0,24).map(n=>n.id)]);if(focusKey!==lastFocus){lastFocus=focusKey;focusAgent(chosen);}
    (body.material as THREE.MeshStandardMaterial).color.set(next.some(n=>n.status==='revoked')&&next.every(n=>!n.active)?'#9e3e26':'#de9958');
   };
   update.current=rebuild;rebuild(data.current.nodes,data.current.selected,data.current.epoch);
   let inView=true,previous=0,elapsed=0,dragging=false,moved=false,lastX=0;
   const ray=new T.Raycaster(),pointer=new T.Vector2();
   const down=(e:PointerEvent)=>{dragging=true;moved=false;lastX=e.clientX;element.setPointerCapture(e.pointerId);};
   const move=(e:PointerEvent)=>{if(dragging){const delta=e.clientX-lastX;if(Math.abs(delta)>2)moved=true;yaw+=delta*.005;targetYaw=yaw;lastX=e.clientX;}};
   const up=(e:PointerEvent)=>{dragging=false;if(moved)return;const rect=element.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(satellites.map(s=>s.body))[0];if(hit){const id=String(hit.object.userData.agent);focusAgent(id);pick.current(id);}};
   const lost=(e:Event)=>{e.preventDefault();setFailed(true);setAvailable(false);cancelAnimationFrame(frame);};
   element.addEventListener('pointerdown',down);element.addEventListener('pointermove',move);element.addEventListener('pointerup',up);r.domElement.addEventListener('webglcontextlost',lost);
   const resize=()=>{const w=element.clientWidth,h=element.clientHeight;if(!w||!h)return;r.setSize(w,h);camera.aspect=w/h;camera.position.set(0,w/h<1.2?12:8.8,w/h<1.2?17:12.8);camera.lookAt(0,0,0);camera.updateProjectionMatrix();};
   observer=new ResizeObserver(resize);observer.observe(element);resize();visibility=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;},{threshold:.05});visibility.observe(element);
   const animate=(time:number)=>{if(disposed)return;frame=requestAnimationFrame(animate);if(time-previous<33)return;const delta=Math.min((time-previous)/1000,.1);previous=time;if(!inView||document.hidden)return;if(!pause.current)elapsed+=delta;
    if(!dragging){yaw=pause.current?targetYaw:yaw+(targetYaw-yaw)*(1-Math.exp(-delta*5));if(Math.abs(targetYaw-yaw)<.001)yaw=targetYaw;}rig.rotation.y=yaw;body.rotation.y=elapsed*.14;wire.rotation.copy(body.rotation);scan.rotation.y=-elapsed*.18;
    for(const sat of satellites){sat.body.rotation.y=elapsed*.3;const active=sat.node.active;const animateEvent=active&&['ready','review','executed','blocked'].includes(sat.node.status);sat.pulse.visible=animateEvent;const progress=(elapsed*.3+sat.phase)%1;sat.pulse.position.copy(sat.path.getPoint(sat.node.status==='blocked'?Math.min(progress,.45):progress));sat.ring.scale.setScalar(sat.node.status==='review'?1+Math.sin(elapsed*2)*.06:1);}
    r.render(world,camera);
   };frame=requestAnimationFrame(animate);setAvailable(true);
   teardown=()=>{element.removeEventListener('pointerdown',down);element.removeEventListener('pointermove',move);element.removeEventListener('pointerup',up);r.domElement.removeEventListener('webglcontextlost',lost);disposeObject(world);r.dispose();r.domElement.remove();};
  }).catch(()=>{if(!disposed)setFailed(true);});
  return()=>{disposed=true;update.current=null;focus.current=null;cancelAnimationFrame(frame);observer?.disconnect();visibility?.disconnect();teardown();};
 },[]);
 const chosen=nodes.find(n=>n.id===selected)??nodes[0];
 return <section className={'sentinel-twin '+(fleet.stopped?'lockdown':'')} aria-label="Fleet digital twin" id="twin"><div className="twin-heading"><div><span>AUTHORITY TOPOLOGY / 3D</span><h2>The fleet, inside its boundaries.</h2></div><button className="outline" onClick={()=>setPaused(v=>!v)} disabled={reduced||!available}>{reduced?'Reduced motion':paused?'Resume motion':'Pause motion'}</button></div><div className="twin-stage"><div ref={host} className="twin-canvas" aria-hidden="true"/><div className="twin-source">{stale?'REFRESH UNAVAILABLE / LAST KNOWN STATE':mode==='demo'?'SANDBOX STATE':'RECORDED REQUEST STATE'}<b>{fleet.stopped?'GLOBAL REVOCATION':'GUARDIAN CORE'}</b></div><div className="twin-reticle">+<span>PERIMETER / EPOCH {fleet.epoch}</span></div>{(!available||failed)&&<div className="twin-fallback">{failed?'3D unavailable · fleet controls remain below':'Initializing fleet projection…'}</div>}<div className="twin-readout"><span>SELECTED SESSION</span><b>{chosen?.name??'No enrolled agents'}</b><strong style={{color:chosen?tones[chosen.status]:tones.idle}}>{chosen?.status.toUpperCase()??'AWAITING ENROLLMENT'}</strong><small>{chosen?`${Math.round(chosen.used*100)}% of daily budget used`:'Enroll agents to populate the perimeter'}</small></div><span className="twin-gesture">DRAG TO ORBIT · SELECT AN AGENT</span></div><div className="twin-agents" aria-label="Select a fleet agent">{nodes.map(n=><button key={n.id} className={n.id===selected?'chosen':''} aria-pressed={n.id===selected} onClick={()=>{focus.current?.(n.id);onSelect(n.id);}}><i style={{background:tones[n.status]}}/>{n.name}<span>{n.status}</span></button>)}</div><div className="twin-legend"><span><i style={{background:tones.ready}}/>READY</span><span><i style={{background:tones.review}}/>HUMAN REVIEW</span><span><i style={{background:tones.blocked}}/>BLOCKED</span><span><i style={{background:tones.executed}}/>EXECUTED</span><span><i style={{background:tones.revoked}}/>REVOKED</span></div><p className="twin-note">Motion visualizes the latest recorded request per agent; pulses replay its state, not transaction throughput. Refreshes every 10 seconds while visible. Only enrolled Sentinel compartments are shown.{nodes.length>24?' 3D detail shows the first 24 agents; every agent is selectable below.':''}</p></section>;
}
