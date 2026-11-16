import * as THREE from 'three';

// Reference-image colors. Keep glass roughness, transmission and IOR intact.
export const PANEL_COLORS = [0x125e50, 0x126f66, 0x16758a, 0x205f91, 0x19564c, 0x338d87];
export function tintPanelMaterial(material, index) {
  const copy=material.clone();
  copy.color.setHex(PANEL_COLORS[((index%PANEL_COLORS.length)+PANEL_COLORS.length)%PANEL_COLORS.length]);
  copy.name='Reference glass '+index;
  return copy;
}

export function applyPanelPalette(mesh) {
  const geometry=mesh.geometry.clone();
  const positions=geometry.getAttribute('position'),indices=geometry.index;
  const parents=Array.from({length:positions.count},(_,i)=>i);
  const find=i=>{while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i]}return i};
  const join=(a,b)=>{parents[find(a)]=find(b)};
  const welded=new Map();
  for(let i=0;i<positions.count;i++){
    const key=[positions.getX(i),positions.getY(i),positions.getZ(i)].map(v=>Math.round(v*10000)).join(',');
    if(welded.has(key))join(i,welded.get(key));else welded.set(key,i);
  }
  for(let i=0;i<(indices?indices.count:positions.count);i+=3){
    const a=indices?indices.getX(i):i,b=indices?indices.getX(i+1):i+1,c=indices?indices.getX(i+2):i+2;
    join(a,b);join(b,c);
  }
  const components=new Map(),colors=new Float32Array(positions.count*3);
  for(let i=0;i<positions.count;i++){
    const key=find(i);if(!components.has(key))components.set(key,components.size);
    const color=new THREE.Color(PANEL_COLORS[(components.get(key)*5+2)%PANEL_COLORS.length]);
    colors.set(color.toArray(),i*3);
  }
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  mesh.geometry=geometry;
  const convert=material=>{const copy=material.clone();copy.color.setHex(0xffffff);copy.vertexColors=true;copy.name='Reference glass palette';return copy};
  mesh.material=Array.isArray(mesh.material)?mesh.material.map(convert):convert(mesh.material);
  mesh.userData.palettePanelCount=components.size;
  return components.size;
}
