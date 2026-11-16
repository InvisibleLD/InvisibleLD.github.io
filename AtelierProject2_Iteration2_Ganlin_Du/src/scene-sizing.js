// Shared dimensions keep the envelope, furnishings and camera in agreement.
export const SCENE_SIZING = {
  ROOFTOP: {shape:'dome',halfWidth:5,halfDepth:5,height:4.9,floorY:.12,fill:.86},
  WINTER: {shape:'dome',halfWidth:4.4,halfDepth:4.4,height:6.3,floorY:.12,fill:.86},
  PARK: {shape:'tent',halfWidth:4.6,halfDepth:4.5,height:6,floorY:.14,fill:.88},
  HIGHWAY: {shape:'vehicle',halfWidth:3.35,halfDepth:4.8,height:4.3,floorY:1.12,fill:.9}
};

export function fitsEnvelope(point,type,margin=.15) {
  const s=SCENE_SIZING[type],x=Math.abs(point[0]),y=point[1],z=Math.abs(point[2]);
  const w=s.halfWidth-margin,d=s.halfDepth-margin,h=s.height-margin;
  if(y<-.001||x>w||z>d||y>h)return false;
  if(s.shape==='tent')return y<=h*(1-x/w)+.001;
  if(s.shape==='dome')return (x/w)**2+(z/d)**2+(y/h)**2<=1.001;
  // The vehicle has a rounded rectangle cross-section and a flat cabin floor.
  const vertical=(y-h*.42)/(h*.58);
  return (x/w)**4+vertical**4<=1.001;
}

export function fitInteriorScale(points,type) {
  if(!points.length)return 1;
  const sizing=SCENE_SIZING[type];
  const extents=points.reduce((out,p)=>[Math.max(out[0],Math.abs(p[0])),Math.max(out[1],p[1]),Math.max(out[2],Math.abs(p[2]))],[0,0,0]);
  let low=0,high=Math.min(sizing.halfWidth/Math.max(.001,extents[0]),sizing.height/Math.max(.001,extents[1]),sizing.halfDepth/Math.max(.001,extents[2]));
  for(let i=0;i<22;i++){
    const candidate=(low+high)/2;
    if(points.every(p=>fitsEnvelope(p.map(v=>v*candidate),type)))low=candidate;else high=candidate;
  }
  return low*sizing.fill;
}
