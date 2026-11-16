import { applyPanelPalette, tintPanelMaterial } from './panel-materials.js';
import { buildApplicationInterior } from './application-interiors.js';
import { SCENE_SIZING } from './scene-sizing.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Concept geometry: shared cells are rearranged, not replaced by unrelated models.
export function createAdaptiveSystem({scene, domeRoot, environment, onApplicationView, getLivingRoom}) {
  const root = new THREE.Group(); scene.add(root); root.visible = false;
  const habitat = new THREE.Group(); root.add(habitat);
  const originalHabitat = new THREE.Group(); habitat.add(originalHabitat);
  let fullDomeLoaded=false, closeView=false;
  const furnishings=new THREE.Group();habitat.add(furnishings);furnishings.visible=false;
  const cutawayPlane=new THREE.Plane(new THREE.Vector3(-.6,0,-.8),0);
  const detail = new THREE.Group(); root.add(detail);
  const fittings = new THREE.Group(); habitat.add(fittings);
  window.addEventListener('adapt-living-ready',()=>{
    disposeGroup(furnishings);
    buildApplicationInterior(furnishings,mode,getLivingRoom?.());
    if(view==='applications')onApplicationView?.(mode,closeView,furnishings.userData.interiorBounds);
  });
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const cells = [], layers = [];
  const up = new THREE.Vector3(0,0,1);
  const mat = (color, extra={}) => new THREE.MeshStandardMaterial({color,roughness:.4,metalness:.25,...extra});
  const palette = {ROOFTOP:0x8ad7d7, WINTER:0xe8e1cf, PARK:0xb1c79c, HIGHWAY:0xb4c6ce};
  let mode = 'ROOFTOP', active = false, view = 'home', explosion = .65, selected = -1, response = 0;
  let transitionTime = 1, lastTime = 0;
  const shape = new THREE.Shape();
  for(let k=0;k<6;k++){const a=k*Math.PI/3+Math.PI/6;const x=Math.cos(a),y=Math.sin(a);k?shape.lineTo(x,y):shape.moveTo(x,y)}
  shape.closePath();
  let cellGeometry = new THREE.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.025,bevelThickness:.025});
  cellGeometry.translate(0,0,-.065);
  const seamMat = new THREE.LineBasicMaterial({color:0x4b777c,transparent:true,opacity:.7});
  const outlineGeometry = new THREE.EdgesGeometry(cellGeometry,35);

  // A regular grid of surface coordinates is retained across all configurations.
  for(let row=0;row<9;row++){
    const t=(row+.45)/9;
    const n=28;
    for(let col=0;col<n;col++){
      const a=(col+(row%2)*.5)/n*Math.PI*2;
      const mesh=new THREE.Mesh(cellGeometry,mat(palette.ROOFTOP,{transparent:true,opacity:.6}));
      mesh.add(new THREE.LineSegments(outlineGeometry,seamMat));
      habitat.add(mesh);
      cells.push({mesh,t,a,fromP:new THREE.Vector3(),toP:new THREE.Vector3(),fromQ:new THREE.Quaternion(),toQ:new THREE.Quaternion(),fromS:new THREE.Vector3(),toS:new THREE.Vector3()});
    }
  }
  function surface(t,a,type){
    const sizing=SCENE_SIZING[type];
    if(type==='PARK'){
      // Triangular cross-section, extended into a compact A-frame shelter.
      const u=a/(Math.PI*2), z=(t-.5)*sizing.halfDepth*2;
      let x,y,n;
      if(u<.5){const f=u*2;x=-sizing.halfWidth+sizing.halfWidth*f;y=.15+sizing.height*f;n=new THREE.Vector3(-sizing.height,sizing.halfWidth,0).normalize()}
      else{const f=(u-.5)*2;x=sizing.halfWidth*f;y=.15+sizing.height*(1-f);n=new THREE.Vector3(sizing.height,sizing.halfWidth,0).normalize()}
      return {p:new THREE.Vector3(x,y,z),n,s:new THREE.Vector3(.46,.61,1)};
    }
    if(type==='HIGHWAY'){
      const b=a-Math.PI, c=Math.cos(b), s=Math.sin(b);
      const x=sizing.halfWidth*Math.sign(c)*Math.pow(Math.abs(c),.55);
      const y=sizing.floorY+sizing.height*.42+sizing.height*.58*Math.sign(s)*Math.pow(Math.abs(s),.55);
      const z=(t-.5)*sizing.halfDepth*2;
      return {p:new THREE.Vector3(x,y,z),n:new THREE.Vector3(c,s,0).normalize(),s:new THREE.Vector3(.56,.6,1)};
    }
    const theta=t*Math.PI*.49;
    const r=sizing.halfWidth;
    const h=sizing.height;
    return {p:new THREE.Vector3(r*Math.sin(theta)*Math.cos(a),h*Math.cos(theta)+.15,r*Math.sin(theta)*Math.sin(a)),n:new THREE.Vector3(Math.sin(theta)*Math.cos(a),Math.cos(theta)*r/h,Math.sin(theta)*Math.sin(a)).normalize(),s:new THREE.Vector3(Math.max(.1,Math.sin(theta))*r*.136,type==='WINTER'?.5:.43,type==='WINTER'?2:1)};
  }
  function mesh(geometry,material,x,y,z,parent=fittings){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
  function disposeGroup(group){group.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())});group.clear()}
  function fit(type){
    disposeGroup(fittings);
    const s=SCENE_SIZING[type],w=s.halfWidth,d=s.halfDepth,h=s.height;
    const dark=mat(0x152d35),warm=mat(0xd2bb8a),light=mat(0x9be4df,{emissive:0x72d6cc,emissiveIntensity:.5});
    if(type==='HIGHWAY'){
      mesh(new THREE.BoxGeometry(w*1.94,h*.94,d*1.94),mat(0x203c3e),0,s.floorY+h*.42,0).userData.cutaway=true;
      mesh(new THREE.BoxGeometry(w*2+.2,.28,d*2+.4),dark,0,s.floorY-.2,0);
      mesh(new THREE.BoxGeometry(w*1.9,.08,d*1.92),mat(0xa99573),0,s.floorY-.05,0);
      for(const x of [-w-.12,w+.12])for(const z of [-d*.68,d*.68]){
        const tire=mesh(new THREE.CylinderGeometry(.9,.9,.45,24),mat(0x111b22),x,.9,z);tire.rotation.z=Math.PI/2;
        const hub=mesh(new THREE.CylinderGeometry(.4,.4,.48,20),mat(0xaac8cb),x,.9,z);hub.rotation.z=Math.PI/2;
      }
      const wind=mesh(new THREE.BoxGeometry(w*1.55,h*.44,.12),mat(0x224d61,{roughness:.12}),0,s.floorY+h*.57,d+.05);wind.rotation.x=-.1;wind.userData.cutaway=true;
      for(const x of [-w*.68,w*.68])mesh(new THREE.BoxGeometry(.55,.2,.12),light,x,s.floorY+.38,d+.18);
      mesh(new THREE.BoxGeometry(w*1.9,.45,.3),dark,0,s.floorY-.05,d+.2);
    }else if(type==='PARK'){
      mesh(new THREE.BoxGeometry(w*2+.4,.18,d*2+.4),warm,0,.02,0);
      const triangle=new THREE.Shape();triangle.moveTo(-w+.08,.15);triangle.lineTo(0,h+.05);triangle.lineTo(w-.08,.15);triangle.closePath();
      const lining=new THREE.ExtrudeGeometry(triangle,{depth:d*2-.15,bevelEnabled:false});lining.translate(0,0,-d+.075);
      mesh(lining,mat(0x627e69),0,0,0).userData.cutaway=true;
      const entrance=new THREE.Shape();entrance.moveTo(-w*.52,.15);entrance.lineTo(0,h*.75);entrance.lineTo(w*.52,.15);entrance.closePath();
      mesh(new THREE.ShapeGeometry(entrance),mat(0x183c3c,{side:THREE.DoubleSide}),0,0,d+.02).userData.cutaway=true;
      const ridge=mesh(new THREE.CylinderGeometry(.055,.055,d*2+.3,8),dark,0,h+.15,0);ridge.rotation.x=Math.PI/2;
    }else{
      const lining=mesh(new THREE.SphereGeometry(w*.975,64,32,0,Math.PI*2,0,Math.PI/2),mat(type==='WINTER'?0x8c9892:0x46767f,{transparent:type!=='WINTER',opacity:type==='WINTER'?1:.32,side:THREE.DoubleSide}),0,.15,0);
      lining.scale.y=h/w;lining.userData.cutaway=true;
      mesh(new THREE.CylinderGeometry(w+.05,w+.05,.25,80),dark,0,-.04,0);
      mesh(new THREE.CylinderGeometry(w*.97,w*.97,.06,80),mat(0xa99b86),0,.08,0);
      mesh(new THREE.BoxGeometry(1.25,2.4,.2),mat(0x23414b),0,1.25,d*.94).userData.cutaway=true;
      mesh(new THREE.BoxGeometry(.9,1.35,.22),mat(0xe8c689,{emissive:0x9d6b24,emissiveIntensity:.5}),0,1.55,d*.94+.12).userData.cutaway=true;
    }
  }
  function setMode(type,instant=false){
    mode=type;transitionTime=instant?1:0;
    for(const cell of cells){
      const s=surface(cell.t,cell.a,type);
      cell.fromP.copy(cell.mesh.position);cell.fromQ.copy(cell.mesh.quaternion);cell.fromS.copy(cell.mesh.scale);
      cell.toP.copy(s.p);cell.toQ.setFromUnitVectors(up,s.n);cell.toS.copy(s.s);
      // Environment changes shape, never the source material's color or transmission.
      if(!cell.mesh.userData.sourceMaterial){cell.mesh.material.color.setHex(palette[type]);cell.mesh.material.opacity=type==='ROOFTOP'?.6:type==='PARK'?.86:1}
      if(instant){cell.mesh.position.copy(s.p);cell.mesh.quaternion.copy(cell.toQ);cell.mesh.scale.copy(s.s)}
    }
    fit(type);fittings.visible=instant;
    disposeGroup(furnishings);buildApplicationInterior(furnishings,type,getLivingRoom?.());
  }
  setMode('ROOFTOP',true);

  // Five individually selectable construction layers, outside to inside.
  detail.position.set(0,2.3,0);detail.rotation.set(-.1,-.2,0);detail.scale.setScalar(1.2);
  const specs=[
    {name:'RESPONSIVE OUTER SKIN',label:'01 / OUTER SKIN',color:0x91d8db,description:'A faceted, raised weather skin replaces the single flat sheet. In winter it closes into a deeper cap; in warm conditions the cap lifts to expose the cavity.'},
    {name:'SEALED AIR CAVITY',label:'02 / AIR CAVITY',color:0x75bcc8,description:'A visible separation between skins creates a proposed still-air buffer. Winter mode closes the perimeter; warm mode opens it for ventilation.'},
    {name:'INSULATING CASSETTE',label:'03 / INSULATION',color:0xdec690,description:'An opaque honeycomb cassette is proposed for cold conditions. It illustrates a replaceable insulation layer; its performance requires material and thermal testing.'},
    {name:'INNER GLAZING',label:'04 / INNER GLAZING',color:0x94c9d8,description:'An inner transparent layer preserves the interior boundary when the outer skin moves. Daylight and insulated cassettes can be distributed across different cells.'},
    {name:'STRUCTURAL FRAME',label:'05 / STRUCTURAL FRAME',color:0x437680,description:'A hexagonal perimeter frame connects adjacent cells. Seals and thermally separated joints are proposed at the edges, rather than assuming glass alone provides insulation.'}
  ];
  function hexPlate(depth,color,opacity=1){const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.035,bevelThickness:.02,bevelSegments:2,steps:1});g.translate(0,0,-depth/2);return new THREE.Mesh(g,mat(color,{transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:opacity===1}))}
  for(let i=0;i<5;i++){
    const g=new THREE.Group();g.userData.layer=i;detail.add(g);
    if(i===0){
      const positions=[],indices=[];
      positions.push(0,0,.5);
      for(let j=0;j<6;j++){let a=j*Math.PI/3+Math.PI/6;positions.push(Math.cos(a),Math.sin(a),0)}
      for(let j=0;j<6;j++)indices.push(0,j+1,(j+1)%6+1);
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
      const cap=new THREE.Mesh(geo,mat(specs[i].color,{transparent:true,opacity:.78,side:THREE.DoubleSide}));g.add(cap);g.userData.cap=cap;
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xc2ffff})));
    }else if(i===1||i===4){
      const outer=new THREE.Shape();for(let k=0;k<6;k++){let a=k*Math.PI/3+Math.PI/6;k?outer.lineTo(Math.cos(a),Math.sin(a)):outer.moveTo(Math.cos(a),Math.sin(a))}outer.closePath();
      const hole=new THREE.Path();for(let k=5;k>=0;k--){let a=k*Math.PI/3+Math.PI/6;k===5?hole.moveTo(Math.cos(a)*.88,Math.sin(a)*.88):hole.lineTo(Math.cos(a)*.88,Math.sin(a)*.88)}hole.closePath();outer.holes.push(hole);
      const frame=new THREE.Mesh(new THREE.ExtrudeGeometry(outer,{depth:i===1?.22:.12,bevelEnabled:false}),mat(specs[i].color,{transparent:i===1,opacity:i===1?.45:1}));g.add(frame);
      if(i===1){const air=hexPlate(.01,specs[i].color,.1);g.add(air)}
    }else{g.add(hexPlate(i===2?.18:.05,specs[i].color,i===3?.3:1));}
    if(i===2){for(let x=-3;x<=3;x++)for(let y=-3;y<=3;y++){const px=x*.23,py=y*.26+(x%2)*.13;if(Math.hypot(px,py)>.77)continue;const honey=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:6},(_,j)=>new THREE.Vector3(px+Math.cos(j*Math.PI/3)*.125,py+Math.sin(j*Math.PI/3)*.125,.11))),new THREE.LineBasicMaterial({color:0x8b774e}));g.add(honey)}}
    g.scale.setScalar(1.8);layers.push(g);
  }
  const panel=document.getElementById('panel');
  const controls=document.createElement('section');controls.id='adaptive-controls';controls.hidden=true;
  controls.innerHTML=`<div class="control-heading"><span id="adaptive-label">CONSTRUCTION</span><span class="live-dot">LIVE MODEL</span></div><div id="layer-controls"><label class="slider-label" for="explode">EXPLODE LAYERS <output id="explode-value">65%</output></label><input id="explode" type="range" min="0" max="100" value="65"><div class="layer-list">${specs.map((s,i)=>`<button data-layer="${i}"><i style="background:#${s.color.toString(16)}"></i><span>${s.label}</span><small>${s.name}</small></button>`).join('')}</div><button id="thermal-toggle" class="thermal-toggle" aria-pressed="false">WINTER RESPONSE</button></div><div id="context-controls"><div id="application-views" class="source-view-toggle"><button class="active" aria-pressed="true">01 / EXTERIOR</button><button aria-pressed="false">02 / INTERIOR</button></div><p id="application-view-status">Wide view. Interior objects are hidden.</p><div id="form-name"></div><p id="form-description"></p><div class="form-tags" id="form-tags"></div><button id="inspect-envelope" class="thermal-toggle">INSPECT ENVELOPE</button></div><p class="concept-note">CONCEPT PROTOTYPE. Thermal performance is not engineering-validated.</p>`;
  document.body.appendChild(controls);
  const viewButtons=[...controls.querySelectorAll('#application-views button')];
  function setApplicationView(isClose){
    closeView=isClose;
    document.body.dataset.applicationView=isClose?'interior':'exterior';
    viewButtons.forEach((button,i)=>{button.classList.toggle('active',!!i===isClose);button.setAttribute('aria-pressed',String(!!i===isClose))});
    controls.querySelector('#application-view-status').textContent=isClose?'Close view. The front envelope opens to reveal the interior.':'Wide view. Interior objects are hidden.';
    onApplicationView?.(mode,isClose,furnishings.userData.interiorBounds);
  }
  viewButtons.forEach((button,i)=>button.onclick=()=>setApplicationView(!!i));
  const formInfo={
    ROOFTOP:['COMMUNITY DOME','A shared rooftop habitat with a furnished living space behind green, blue and teal glass.',['SHARED SPACE','GLASS ENVELOPE','METAL FRAME']],
    WINTER:['THERMAL POD','An enclosed winter shell with insulated lining. The close view reveals the same LIVING furniture and layout used in Experience.',['ENCLOSED FORM','INSULATED LINING','SHARED LIVING INTERIOR']],
    PARK:['PARK SHELTER','A compact A-frame shelter. Its close view reveals the same LIVING furniture and layout, fitted to the shelter.',['A-FRAME','COMPACT SHELTER','SHARED LIVING INTERIOR']],
    HIGHWAY:['MOBILE HABITAT','A four-wheel cabin. Its close view reveals the same LIVING furniture and layout, fitted to the cabin.',['MOBILE CABIN','FOUR WHEELS','SHARED LIVING INTERIOR']]
  };
  function selectLayer(i){selected=i;const s=specs[i];document.getElementById('panel-title').textContent=s.name;document.getElementById('panel-desc').textContent=s.description;panel.hidden=false;controls.querySelectorAll('[data-layer]').forEach((b,j)=>{b.classList.toggle('active',j===i);b.setAttribute('aria-pressed',String(j===i))})}
  function selectFunction(name){
    selectLayer({SOLAR:0,SKYLIGHT:3,VENTILATION:1,INSULATION:2,RAINWATER:0,SHADING:0}[name]??0);
    if(name==='INSULATION')response=1;
    if(name==='VENTILATION')response=0;
    syncThermalButton();
  }
  controls.querySelectorAll('[data-layer]').forEach(b=>b.onclick=()=>selectLayer(+b.dataset.layer));
  controls.querySelector('#explode').oninput=e=>{explosion=+e.target.value/100;document.getElementById('explode-value').textContent=e.target.value+'%'};
  function syncThermalButton(){const button=controls.querySelector('#thermal-toggle');button.setAttribute('aria-pressed',String(!!response));button.textContent=response?'WINTER CLOSED':'WARM OPEN'}
  controls.querySelector('#thermal-toggle').onclick=()=>{response=response?0:1;syncThermalButton()};
  controls.querySelector('#inspect-envelope').onclick=()=>document.querySelector('[data-view="structure"]').click();
  function context(type){
    setMode(type);
    setApplicationView(false);
    document.getElementById('form-name').textContent=formInfo[type][0];document.getElementById('form-description').textContent=formInfo[type][1];document.getElementById('form-tags').replaceChildren(...formInfo[type][2].map(t=>{const el=document.createElement('span');el.textContent=t;return el}));
    response=type==='WINTER'?1:0;syncThermalButton();
  }
  function setView(next){
    if(next!=='applications')delete document.body.dataset.applicationView;
    view=next;active=next==='structure'||next==='applications';root.visible=active;domeRoot.visible=!active;
    habitat.visible=next==='applications';detail.visible=next==='structure';controls.hidden=!active;
    document.getElementById('layer-controls').hidden=next!=='structure';document.getElementById('context-controls').hidden=next!=='applications';
    document.getElementById('adaptive-label').textContent=next==='structure'?'CONSTRUCTION':'ENVIRONMENT ADAPTATION';
    if(next==='structure'){selected=-1;panel.hidden=true;controls.querySelectorAll('[data-layer]').forEach(b=>b.classList.remove('active'))}
    if(next==='applications')context(mode);
  }
  function tick(now){
    const dt=Math.min(.05,(now-lastTime)/1000||.016);lastTime=now;
    detail.scale.setScalar(innerWidth<700?.72:1.2);
    if(!active)return;
    if(view==='applications'){
      transitionTime=matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.min(1,transitionTime+dt/1.5);const k=transitionTime*transitionTime*(3-2*transitionTime);
      for(const c of cells){c.mesh.position.lerpVectors(c.fromP,c.toP,k);c.mesh.quaternion.slerpQuaternions(c.fromQ,c.toQ,k);c.mesh.scale.lerpVectors(c.fromS,c.toS,k)}
      const showOriginal=mode==='ROOFTOP'&&fullDomeLoaded&&transitionTime>=1;
      originalHabitat.visible=showOriginal;
      cells.forEach(c=>{c.mesh.visible=!showOriginal&&(!closeView||c.mesh.position.x*.6+c.mesh.position.z*.8<.2)});
      furnishings.visible=closeView&&transitionTime>=1;
      originalHabitat.traverse(o=>{if(o.isMesh){for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.userData.cutaway!==closeView){m.clippingPlanes=closeView?[cutawayPlane]:null;m.userData.cutaway=closeView;m.needsUpdate=true}}}});
      fittings.traverse(o=>{if(o.userData.cutaway)o.visible=!closeView&&!showOriginal});
      fittings.visible=transitionTime>.8;
    }else{
      layers.forEach((layer,i)=>{
        const target=(2-i)*(.25+explosion*.9);
        layer.position.z=THREE.MathUtils.damp(layer.position.z,target,8,dt);
        layer.position.x=THREE.MathUtils.damp(layer.position.x,(2-i)*explosion*.32,8,dt);
        layer.traverse(m=>{if(m.userData.selectionOutline)m.visible=selected===i});
      });
      layers[0].scale.z=THREE.MathUtils.damp(layers[0].scale.z,response?2.6:1.15,5,dt);
      layers[0].rotation.y=THREE.MathUtils.damp(layers[0].rotation.y,response?0:-.26,5,dt);
    }
  }
  let down=null;
  rendererCanvas().addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
  rendererCanvas().addEventListener('pointerup',e=>{
    if(view!=='structure'||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;
    pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);raycaster.setFromCamera(pointer,window.ADAPT_DEBUG.camera);
    const hits=raycaster.intersectObjects(layers,true);if(hits.length){let obj=hits[0].object;while(obj.parent!==detail)obj=obj.parent;selectLayer(obj.userData.layer)}
  });
  function rendererCanvas(){return document.getElementById('world')}
  // The three supplied Blender parts keep their evaluated Solidify / Array geometry.
  // Two proposed environmental layers supplement this source assembly.
  let sourceLoaded=false;
  async function loadSourceModule(){
    const gltf=await new GLTFLoader().loadAsync('./public/models/single-module.glb');
    gltf.scene.updateMatrixWorld(true);
    const sourceParts=new Map();
    gltf.scene.traverse(object=>{if(object.isMesh)sourceParts.set(object.name,object)});
    const mappings=[['Dome_Frame009',4],['Dome_Frame010',0],['Dome_Frame012',3]];
    let outer=null, paneMaterial=null;
    const cloneMaterial=material=>Array.isArray(material)?material.map(m=>m.clone()):material.clone();
    for(const [name,layerIndex] of mappings){
      const original=sourceParts.get(name)||[...sourceParts.values()].find(m=>m.name.replaceAll('.','')===name);
      if(!original)throw new Error('Missing source part '+name);
      const geometry=original.geometry.clone().applyMatrix4(original.matrixWorld);
      geometry.computeBoundingBox();geometry.translate(...geometry.boundingBox.getCenter(new THREE.Vector3()).negate().toArray());
      geometry.rotateX(Math.PI/2);geometry.rotateY(-.25);geometry.computeBoundingBox();
      const size=geometry.boundingBox.getSize(new THREE.Vector3());geometry.scale(2/Math.max(size.x,size.y),2/Math.max(size.x,size.y),2/Math.max(size.x,size.y));
      const group=layers[layerIndex];disposeGroup(group);
      group.add(new THREE.Mesh(geometry,cloneMaterial(original.material)));
      const selectionOutline=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,35),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.65}));
      selectionOutline.userData.selectionOutline=true;selectionOutline.visible=false;group.add(selectionOutline);
      if(layerIndex===0){
        outer=geometry;paneMaterial=original.material;
      }
    }
    if(outer){
      const old=cellGeometry;cellGeometry=outer.clone();
      // The original part curves around its own midpoint. Seat its inner surface
      // outside the continuous lining, rather than hiding half the cell in it.
      cellGeometry.computeBoundingBox();cellGeometry.translate(0,0,-cellGeometry.boundingBox.min.z+.025);
      for(const cell of cells){
        cell.mesh.geometry=cellGeometry;cell.mesh.material.dispose();cell.mesh.material=tintPanelMaterial(Array.isArray(paneMaterial)?paneMaterial[0]:paneMaterial,cells.indexOf(cell));
        cell.mesh.userData.sourceMaterial=true;cell.mesh.children[0].visible=false;
      }
      old.dispose();outlineGeometry.dispose();
    }
    sourceLoaded=true;
    controls.querySelector('.live-dot').textContent='BLENDER SOURCE';
  }
  loadSourceModule().catch(error=>{console.error('Source module could not load:',error);controls.querySelector('.live-dot').textContent='CONCEPT FALLBACK'});
  new GLTFLoader().loadAsync('./public/models/source-dome.glb').then(gltf=>{
    const model=gltf.scene;
    model.traverse(o=>{if(o.isMesh&&o.name.toLowerCase().includes('panels'))applyPanelPalette(o)});
    const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3());
    model.scale.setScalar(10/Math.max(size.x,size.z));
    const normalized=new THREE.Box3().setFromObject(model),center=normalized.getCenter(new THREE.Vector3());
    model.position.set(-center.x,-normalized.min.y,-center.z);
    originalHabitat.add(model);fullDomeLoaded=true;
  }).catch(error=>console.error('Original complete dome could not load:',error));
  return {setView,context,tick,selectFunction,root,detail,cells,mode:()=>mode,sourceLoaded:()=>sourceLoaded,closeView:()=>closeView,refitView:()=>onApplicationView?.(mode,closeView,furnishings.userData.interiorBounds)};
}
