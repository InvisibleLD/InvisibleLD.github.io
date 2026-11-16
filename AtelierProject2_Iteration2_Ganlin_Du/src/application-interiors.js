import * as THREE from 'three';
import { SCENE_SIZING, fitInteriorScale } from './scene-sizing.js';

// Reuse the exact LIVING scene for every application; only its overall scale changes.
export function buildApplicationInterior(group, type, sourceLivingRoom) {
  if(!sourceLivingRoom)return;
  const model=sourceLivingRoom.clone(true);
  model.visible=true;
  model.traverse(object=>{
    if(!object.isMesh)return;
    object.geometry=object.geometry.clone();
    object.material=Array.isArray(object.material)?object.material.map(m=>m.clone()):object.material.clone();
  });
  const bounds=new THREE.Box3().setFromObject(model);
  const size=bounds.getSize(new THREE.Vector3());
  if(Math.min(size.x,size.y,size.z)<=0)return;
  const originalCenter=bounds.getCenter(new THREE.Vector3());
  const samples=[];
  model.updateMatrixWorld(true);
  model.traverse(object=>{
    if(!object.isMesh)return;
    const vertices=object.geometry.getAttribute('position'),step=Math.max(1,Math.floor(vertices.count/1800));
    for(let i=0;i<vertices.count;i+=step){
      const point=new THREE.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(object.matrixWorld);
      samples.push([point.x-originalCenter.x,point.y-bounds.min.y,point.z-originalCenter.z]);
    }
  });
  const scale=fitInteriorScale(samples,type);
  model.scale.multiplyScalar(scale);
  const fitted=new THREE.Box3().setFromObject(model);
  const center=fitted.getCenter(new THREE.Vector3());
  const floorY=SCENE_SIZING[type].floorY;
  model.position.add(new THREE.Vector3(-center.x,floorY-fitted.min.y,-center.z));
  model.name='Shared LIVING interior';
  group.add(model);
  group.updateMatrixWorld(true);
  const finalBounds=new THREE.Box3().setFromObject(model);
  group.userData.interiorBounds={center:finalBounds.getCenter(new THREE.Vector3()).toArray(),size:finalBounds.getSize(new THREE.Vector3()).toArray(),scale};
  const light=new THREE.PointLight(0xffedda,6,10);
  light.position.set(0,floorY+SCENE_SIZING[type].height*.6,0);group.add(light);
}
