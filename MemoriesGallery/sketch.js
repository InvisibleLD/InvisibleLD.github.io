const stage=document.querySelector('#stage'),orb=document.querySelector('#orb'),ring=orb.querySelector('circle');
const DWELL_MS = 1000;
const REVEAL_RADIUS = 130;
let inputMode = 'unknown';
let desktopInput = false;
let permissionPending = false;
let lastTouchTime = -Infinity;
const needsMotionPermission = typeof window.DeviceOrientationEvent?.requestPermission === 'function';
function updateInputHint() {
  document.querySelector('#mode').textContent = inputMode === 'motion' ? 'TILT TO EXPLORE' : inputMode === 'keyboard' ? 'ARROW KEYS' : inputMode === 'mouse' ? 'MOUSE TO EXPLORE' : 'SUMMER / CHINA';
  document.body.classList.toggle('playing', inputMode !== 'unknown');
  if (scene === 'gallery') {
    document.querySelector('#hint').textContent = 'Reveal memories - move to the left or right edge to explore';
  } else {
    document.querySelector('#hint').textContent = inputMode === 'motion' ? 'Tilt to move - hold for 1 second to select' : inputMode === 'keyboard' ? 'Use arrow keys - hold for 1 second to select' : inputMode === 'mouse' ? 'Move your mouse - hold for 1 second to select' : needsMotionPermission ? 'Tap Enter Gallery to enable motion, or use your mouse / arrow keys' : 'Tilt your phone, move your mouse, or use arrow keys';
  }
}
function showNotice(message) {
  const notice = document.querySelector('#notice');
  notice.textContent = message;
  notice.hidden = !message;
}
const places={jiangxi:{name:'Jiangxi',en:'Jiangxi',cities:['Nanchang','Shangrao','Wuyuan','Pingxiang','Jingdezhen'],x:65,y:68},anhui:{name:'Anhui',en:'Anhui',cities:['Huangshan'],x:73,y:49},shaanxi:{name:'Shaanxi',en:'Shaanxi',cities:['Weinan','Shangluo'],x:48,y:43},guangdong:{name:'Guangdong',en:'Guangdong',cities:['Shenzhen','Guangzhou'],x:60,y:88}};
// Photo filenames are configured separately in photos.js.
const PROVINCE_POINTS = {
  jiangxi: { x: 430, y: 316 },
  anhui: { x: 439, y: 272 },
  shaanxi: { x: 347, y: 235 },
  guangdong: { x: 409, y: 362 }
};

// Coordinates use the supplied 479 x 480 Jiangxi reference image.
// Wuyuan is a county within Shangrao, shown as a separate travel stop.
const JIANGXI_STOPS = {
  nanchang: { name: 'Nanchang', x: 239, y: 130 },
  shangrao: { name: 'Shangrao', x: 342, y: 151 },
  wuyuan: { name: 'Wuyuan', x: 367, y: 100 },
  pingxiang: { name: 'Pingxiang', x: 90, y: 216 },
  jingdezhen: { name: 'Jingdezhen', x: 321, y: 79 }
};
const JIANGXI_LABELS = [
  { name:'Jiujiang', x:199, y:94 },
  { name:'Nanchang', x:239, y:147 },
  { name:'Jingdezhen', x:321, y:96 },
  { name:'Shangrao', x:337, y:136 },
  { name:'Yichun', x:166, y:174 },
  { name:'Xinyu', x:157, y:210 },
  { name:'Pingxiang', x:91, y:234 },
  { name:"Ji'an", x:155, y:277 },
  { name:'Fuzhou', x:266, y:235 },
  { name:'Yingtan', x:312, y:180 },
  { name:'Ganzhou', x:186, y:374 }
];
function cityPhotos(cityKey) {
  const stop = JIANGXI_STOPS[cityKey];
  const group = window.PHOTO_LIBRARY.jiangxi.find(group => group.city === stop.name);
  return group ? group.files.map(file => ({url: 'photos/' + group.folder + '/' + file, name: group.city})) : [];
}
function activateTarget(target) {
  if (target.dataset.city) {
    render('gallery', 'jiangxi', target.dataset.city);
  } else if (target.dataset.place === 'jiangxi') {
    render('jiangxi');
  } else if (target.dataset.place) {
    render('gallery', target.dataset.place);
  } else {
    render(target.dataset.go);
  }
}

const albums = Object.fromEntries(Object.keys(places).map(key => [key,
  (window.PHOTO_LIBRARY?.[key] || []).flatMap(group => group.files.map(file => ({
    url: 'photos/' + group.folder + '/' + file,
    name: group.city
  })))
]));
let scene='intro',x=innerWidth/2,y=innerHeight/2,ax=x,ay=y,sensor=false,neutral=null,tilt={x:0,y:0},hover=null,held=0,last=0,pan=0,mask=null,mc=null,veil=null,vc=null;const keys=new Set();const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function demo(i){const colors=['#344e43','#5e7165','#3b505d','#665f4a'];return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700"><defs><linearGradient id="a" x2="0" y2="1"><stop stop-color="${colors[i%4]}"/><stop offset="1" stop-color="#111f25"/></linearGradient></defs><path fill="url(#a)" d="M0 0h700v700H0z"/><circle cx="470" cy="180" r="60" fill="#e1d8aa" opacity=".5"/><path fill="#203932" d="M0 520 180 180 350 460 510 280 700 530V700H0"/><path fill="#102c29" d="m0 650 180-250 190 180 180-140 150 220v40H0"/><text x="35" y="650" fill="#b6c3af" font-size="17" letter-spacing="4">DEMO / SAMPLE LANDSCAPE</text></svg>`)}
function title(n,h,p){return `<div class="title"><span class="eyebrow">${n}</span><h2>${h}</h2><p>${p}</p></div>`}
function render(next,k,cityKey){scene=next;hover=null;held=0;pan=0;mask=null;vc=null;document.querySelector('#step').textContent=({intro:'01',world:'02',china:'03',jiangxi:'04',gallery:'05'})[scene]+' — 05';document.querySelector('#hint').textContent=scene==='gallery'?'Reveal memories - move to the left or right edge to explore':(sensor ? 'Tilt to move - hold for 1 second to select' : 'Use arrow keys - hold for 1 second to select');
if(scene==='intro')stage.innerHTML=`<section class="intro"><span class="eyebrow">A SUMMER TO SAVOUR</span><h1>memories<br><em>gallery</em></h1><p>Through local flavours, mountain paths, and moments by the water—<br>a collection of my summer travels across China.</p><button class="target enter" type="button" data-go="world">ENTER GALLERY</button></section>`;
if(scene==='world')stage.innerHTML=title('01 / THE WORLD','Every journey starts somewhere.','Find the light in Asia. Hold for 1 second.')+`<div class="globe"><svg viewBox="0 0 600 600"><g fill="none" stroke="#78947d" opacity=".35"><ellipse cx="300" cy="300" rx="150" ry="299"/><ellipse cx="300" cy="300" rx="260" ry="299"/><path d="M0 300h600M30 180h540M30 420h540"/></g><g fill="#77917a" opacity=".6"><path d="m80 160 75-50 85 25 30 60-65 35-15 70-50-30-20-65zM180 330l80 20 20 65-50 120-25-80zM280 175l60-50 80 10 90 60 30 90-70 30-40-60-60 30-40-40zM290 280l70 20 30 70-55 100-35-70zM450 420l70-20 40 55-60 20z"/></g><g class="continent-labels" text-anchor="middle"><text x="157" y="184"><tspan x="157">NORTH</tspan><tspan x="157" dy="20">AMERICA</tspan></text><text x="228" y="398"><tspan x="228">SOUTH</tspan><tspan x="228" dy="20">AMERICA</tspan></text><text x="313" y="166">EUROPE</text><text x="334" y="350">AFRICA</text><text x="497" y="451">AUSTRALIA</text><text x="300" y="561">ANTARCTICA</text></g></svg><div class="target asia" data-go="china" aria-label="Asia"><i class="map-light"></i><span>ASIA</span></div></div>`;
if(scene==='china')stage.innerHTML=title('02 / CHINA','A summer, traced in light.','Rest your light on a glowing point for 1 second.')+`<div class="china-layout"><div class="province-map"><img src="assets/china-provinces.png" alt="Grayscale map of China with English province labels" draggable="false">${Object.entries(PROVINCE_POINTS).map(([key,point])=>`<div class="target province-point${key==='jiangxi'?' jiangxi-point':''}" data-place="${key}" style="left:${point.x/597*100}%;top:${point.y/442*100}%" aria-label="${places[key].name}"><i></i></div>`).join('')}</div></div>`;
if(scene==='jiangxi')stage.innerHTML=title('03 / JIANGXI','Five places. A thousand memories.','Find a light. Stay for 1 second to enter.')+`<div class="target exit" data-go="china">RETURN TO CHINA - HOLD FOR 1 SECOND</div><div class="jiangxi-layout"><div class="jiangxi-map"><img src="assets/jiangxi-cities.png" alt="Grayscale city map of Jiangxi" draggable="false">${JIANGXI_LABELS.map(label=>`<span class="map-city-label" style="left:${label.x/479*100}%;top:${label.y/480*100}%">${label.name}</span>`).join('')}<span class="map-city-label wuyuan-label" style="left:${367/479*100}%;top:${84/480*100}%">Wuyuan</span>${Object.entries(JIANGXI_STOPS).map(([key,stop])=>`<div class="target province-point city-point" data-city="${key}" style="left:${stop.x/479*100}%;top:${stop.y/480*100}%" aria-label="${stop.name}"><i></i></div>`).join('')}</div></div>`;
if(scene==='gallery'){let p=places[k],selectedCity=cityKey?JIANGXI_STOPS[cityKey]:null,photos=selectedCity?cityPhotos(cityKey):albums[k],items=photos.length?photos:Array.from({length:8},(_,i)=>({url:demo(i),name:(selectedCity?selectedCity.name:p.cities[i%p.cities.length])+' - Sample'}));stage.innerHTML=`<div class="wall"><div class="wall-inner">${items.map(()=>'<figure class="photo"><img loading="lazy" decoding="async" draggable="false"><figcaption></figcaption></figure>').join('')}<canvas class="veil"></canvas></div></div><div class="target exit" data-go="china">RETURN TO CHINA - HOLD FOR 1 SECOND</div><div class="gallery-title"><span class="eyebrow">SUMMER ARCHIVE / ${p.en.toUpperCase()}</span><h2>${selectedCity?selectedCity.name:p.name}, in fragments.</h2><p>${selectedCity?selectedCity.name:p.cities.join(' / ')} · ${items.length} FRAMES${photos.length?'':' · DEMO'}</p></div>`;stage.querySelectorAll('.photo').forEach((el,i)=>{el.querySelector('img').onerror=function(){this.onerror=null;this.src=demo(i);el.querySelector('figcaption').textContent=items[i].name+' - Photo not found';};el.querySelector('img').src=items[i].url;el.querySelector('img').alt=items[i].name;el.querySelector('figcaption').textContent=items[i].name});requestAnimationFrame(sizeMask)}updateInputHint();stage.animate([{opacity:0,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:750,easing:'ease-out'});}
function sizeMask(){if(scene!=='gallery')return;let wall=stage.querySelector('.wall-inner'),old=mask;veil=wall.querySelector('canvas');mask=document.createElement('canvas');mask.width=wall.scrollWidth;mask.height=innerHeight;mc=mask.getContext('2d');mc.fillStyle='#050809';mc.fillRect(0,0,mask.width,mask.height);if(old){mc.clearRect(0,0,mask.width,mask.height);mc.drawImage(old,0,0,old.width,old.height,0,0,mask.width,mask.height);}veil.width=mask.width;veil.height=mask.height;veil.style.width=mask.width+'px';veil.style.height=mask.height+'px';vc=veil.getContext('2d');}
function erase(px,py){
  const mx=px+pan;
  mc.globalCompositeOperation='destination-out';
  const gradient=mc.createRadialGradient(mx,py,24,mx,py,REVEAL_RADIUS);
  gradient.addColorStop(0,'rgba(0,0,0,1)');
  gradient.addColorStop(.65,'rgba(0,0,0,.95)');
  gradient.addColorStop(1,'rgba(0,0,0,0)');
  mc.fillStyle=gradient;
  mc.fillRect(mx-REVEAL_RADIUS,py-REVEAL_RADIUS,REVEAL_RADIUS*2,REVEAL_RADIUS*2);
  mc.globalCompositeOperation='source-over';
}
function frame(t){let dt=Math.min(t-last||16,50);last=t;if(!document.hidden&&!permissionPending){if(sensor&&neutral){ax+=tilt.x*dt*.028;ay+=tilt.y*dt*.028}if(keys.has('ArrowLeft'))ax-=dt*.4;if(keys.has('ArrowRight'))ax+=dt*.4;if(keys.has('ArrowUp'))ay-=dt*.4;if(keys.has('ArrowDown'))ay+=dt*.4;ax=clamp(ax,8,innerWidth-8);ay=clamp(ay,8,innerHeight-8);x+=(ax-x)*Math.min(1,dt/70);y+=(ay-y)*Math.min(1,dt/70);orb.style.left=x+'px';orb.style.top=y+'px';let target=[...stage.querySelectorAll('.target')].find(el=>{if (typeof SVGGeometryElement !== 'undefined' && el instanceof SVGGeometryElement) {
  const transform = el.getScreenCTM();
  return transform && el.isPointInFill(new DOMPoint(x, y).matrixTransform(transform.inverse()));
}let r=el.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom});if(target!==hover){hover?.classList.remove('active');hover=target;held=0;hover?.classList.add('active')}if(hover && !(scene==='intro' && inputMode==='unknown' && needsMotionPermission)){held+=dt;if(held>=DWELL_MS){activateTarget(hover)}}ring.style.strokeDashoffset=176*(1-held/DWELL_MS);if(scene==='gallery'&&vc){let wall=stage.querySelector('.wall-inner');if(y>90){if(x<innerWidth*.16)pan-=dt*.18;if(x>innerWidth*.84)pan+=dt*.18}pan=clamp(pan,0,Math.max(0,mask.width-innerWidth));wall.style.transform=`translateX(${-pan}px)`;if(y>86)erase(x,y);vc.clearRect(0,0,veil.width,veil.height);vc.drawImage(mask,0,0)}}requestAnimationFrame(frame)}
function orientation(event) {
  // API availability alone does not prove that a device has a working sensor.
  if (desktopInput || !Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
  const angle = (window.screen.orientation?.angle ?? window.orientation ?? 0) * Math.PI / 180;
  const tx = event.gamma * Math.cos(angle) + event.beta * Math.sin(angle);
  const ty = event.beta * Math.cos(angle) - event.gamma * Math.sin(angle);
  if (!neutral) neutral = { x: tx, y: ty };
  const dead = value => Math.abs(value) < 2 ? 0 : clamp(value, -25, 25);
  tilt = { x: dead(tx - neutral.x), y: dead(ty - neutral.y) };
  sensor = true;
  if (inputMode !== 'motion') {
    inputMode = 'motion';
    held = 0;
    updateInputHint();
    showNotice('');
  }
}

window.addEventListener('deviceorientation', orientation);
window.addEventListener('pointermove', event => {
  // Ignore touch-generated pointer movement so tilting remains in control on phones.
  if (event.pointerType !== 'mouse') return;
  desktopInput = true;
  sensor = false;
  tilt = { x: 0, y: 0 };
  ax = event.clientX;
  ay = event.clientY;
  if (inputMode !== 'mouse') {
    inputMode = 'mouse';
    held = 0;
    updateInputHint();
    showNotice('');
  }
});
window.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch') lastTouchTime = performance.now();
});
window.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  desktopInput = true;
  sensor = false;
  if (inputMode !== 'keyboard') {
    inputMode = 'keyboard';
    held = 0;
    updateInputHint();
    showNotice('');
  }
  keys.add(event.key);
});
window.addEventListener('keyup', event => keys.delete(event.key));
function resetInput() {
  keys.clear();
  held = 0;
  hover?.classList.remove('active');
  hover = null;
  neutral = null;
  tilt = { x: 0, y: 0 };
}
window.addEventListener('blur', resetInput);
document.addEventListener('visibilitychange', resetInput);
window.addEventListener('resize', () => {
  resetInput();
  ax = innerWidth / 2;
  ay = innerHeight / 2;
  sizeMask();
});

stage.addEventListener('click', async event => {
  const entry = event.target.closest('.enter');
  if (!entry || scene !== 'intro' || permissionPending) return;
  const touchEntry = event.pointerType === 'touch' || performance.now() - lastTouchTime < 1000 || (!desktopInput && (needsMotionPermission || window.matchMedia('(pointer: coarse)').matches));
  if (!touchEntry) {
    desktopInput = true;
    sensor = false;
    inputMode = 'mouse';
    render('world');
    return;
  }
  permissionPending = true;
  try {
    if (!window.isSecureContext) throw Error('Motion control requires HTTPS. Open the secure website on your phone.');
    if (!window.DeviceOrientationEvent) throw Error('Motion sensors are unavailable in this browser. Try Safari or Chrome on your phone.');
    if (needsMotionPermission) {
      const permission = await window.DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') throw Error('Motion access was not granted. Allow motion in your browser settings, then tap Enter Gallery again.');
    }
    desktopInput = false;
    neutral = null;
    window.removeEventListener('deviceorientation', orientation);
    window.addEventListener('deviceorientation', orientation);
    showNotice('');
    render('world');
    setTimeout(() => {
      if (!desktopInput && !sensor) showNotice('No motion data received. Check motion permissions and reload this page.');
    }, 3500);
  } catch (error) {
    showNotice(error.message);
  } finally {
    permissionPending = false;
  }
});

render('intro');
requestAnimationFrame(frame);

