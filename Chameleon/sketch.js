let video;
let camWidth = 320;
let camHeight = 240;
let captureReady = false;

let mic;
let volumeHistory = [];
let maxVolumeHistory = 50;

let chameleon = {
  x: 0,
  y: 0,
  size: 140,
  detectedColor: { r: 100, g: 200, b: 100 },
  currentColor: { r: 100, g: 200, b: 100 },
  colorTransition: {
    active: false,
    start: 0,
    duration: 2000,
    from: { r: 100, g: 200, b: 100 },
    to: { r: 100, g: 200, b: 100 }
  },
  transparency: 255,
  eyeMove: 0,
  isTransparent: false,
  transparentTimer: 0
};

let isCalibrating = true;
let calibrationTimer = 180;

let detectionArea = { x: 0, y: 0, size: 90 };

let motionBtn = null;

const BASE_INTERVAL = 5000;
const BASE_DURATION = 2000;

let detectInterval = BASE_INTERVAL;
let lastDetectTime = 0;
let detectionActive = true;

const phases = [
  { type: "speed", mult: 0.25 },
  { type: "speed", mult: 0.5 },
  { type: "speed", mult: 1 },
  { type: "speed", mult: 2 },
  { type: "stopTransparent" }
];
let phaseIndex = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  chameleon.x = width / 2;
  chameleon.y = height / 2;
  detectionArea.x = width / 2;
  detectionArea.y = height / 2 + 120;
  startCameraWithFallback();
  mic = new p5.AudioIn();
  mic.start();
  textAlign(CENTER, CENTER);
  setupMotionPermissionButton();
  applyPhase(phaseIndex);
}

async function startCameraWithFallback() {
  try {
    const backConstraints = { video: { width: { ideal: camWidth }, height: { ideal: camHeight }, facingMode: { exact: "environment" } }, audio: false };
    video = createCapture(backConstraints, () => { captureReady = true; });
  } catch (e) {
    try {
      const backSoftConstraints = { video: { width: { ideal: camWidth }, height: { ideal: camHeight }, facingMode: "environment" }, audio: false };
      video = createCapture(backSoftConstraints, () => { captureReady = true; });
    } catch (e2) {
      video = createCapture(VIDEO, () => { captureReady = true; });
    }
  }
  if (video) {
    video.size(camWidth, camHeight);
    video.elt.setAttribute("playsinline", "");
    video.hide();
  }
}

function setupMotionPermissionButton() {
  const needsPermission = typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function";
  if (needsPermission) {
    motionBtn = createButton("Enable Shake Detection (Tap to Allow)");
    motionBtn.style("position", "fixed");
    motionBtn.style("left", "12px");
    motionBtn.style("top", "12px");
    motionBtn.style("z-index", "9999");
    motionBtn.mousePressed(async () => {
      try {
        const s = await DeviceMotionEvent.requestPermission();
        if (s === "granted") {
          motionBtn.remove();
          motionBtn = null;
        } else {
          motionBtn.html("Not granted, tap to retry");
        }
      } catch (e) {
        motionBtn.html("Request failed, tap to retry");
      }
    });
  }
}

function draw() {
  drawBackground();
  if (isCalibrating) {
    drawCalibrationScreen();
    calibrationTimer--;
    if (calibrationTimer <= 0) isCalibrating = false;
    return;
  }
  drawDetectionArea();
  handleAutoDetect();
  updateColor();
  drawChameleon();
  drawUI();
  if (chameleon.isTransparent) {
    chameleon.transparentTimer--;
    if (chameleon.transparentTimer <= 0) {
      chameleon.isTransparent = false;
      chameleon.transparency = 255;
    }
  }
  chameleon.eyeMove = sin(frameCount * 0.05) * 3;
}

function handleAutoDetect() {
  if (!captureReady || !detectionActive) return;
  if (detectInterval === 0) return;
  if (millis() - lastDetectTime >= detectInterval) {
    detectColorFromCamera();
    lastDetectTime = millis();
  }
}

function drawBackground() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(240, 245, 255), color(200, 220, 240), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawCalibrationScreen() {
  fill(0, 0, 0, 180);
  noStroke();
  rect(0, 0, width, height);
  fill(255);
  textSize(28);
  text("Chameleon", width / 2, height / 2 - 70);
  textSize(16);
  text("Calibrating...", width / 2, height / 2 - 25);
  let progress = 1 - (calibrationTimer / 180);
  let bw = width * 0.6;
  let bh = 20;
  noFill();
  stroke(255);
  strokeWeight(2);
  rect(width / 2 - bw / 2, height / 2 + 10, bw, bh);
  fill(100, 200, 100);
  noStroke();
  rect(width / 2 - bw / 2, height / 2 + 10, bw * progress, bh);
  textSize(14);
  fill(255);
  text("Please hold steady", width / 2, height / 2 + 60);
}

function drawDetectionArea() {
  if (captureReady && video) {
    image(video, detectionArea.x - detectionArea.size / 2, detectionArea.y - detectionArea.size / 2, detectionArea.size, detectionArea.size);
    noFill();
    stroke(255, 255, 0);
    strokeWeight(3);
    rect(detectionArea.x - detectionArea.size / 2, detectionArea.y - detectionArea.size / 2, detectionArea.size, detectionArea.size);
    stroke(255, 0, 0);
    strokeWeight(2);
    line(detectionArea.x - 10, detectionArea.y, detectionArea.x + 10, detectionArea.y);
    line(detectionArea.x, detectionArea.y - 10, detectionArea.x, detectionArea.y + 10);
    fill(255);
    noStroke();
    textSize(14);
    text("Auto sampling. Click to cycle speed", detectionArea.x, detectionArea.y + detectionArea.size / 2 + 20);
  }
}

function updateColor() {
  let vol = mic.getLevel();
  volumeHistory.push(vol);
  if (volumeHistory.length > maxVolumeHistory) volumeHistory.shift();
  let avgVol = 0;
  for (let v of volumeHistory) avgVol += v;
  avgVol /= maxVolumeHistory;
  let base = { r: chameleon.detectedColor.r, g: chameleon.detectedColor.g, b: chameleon.detectedColor.b };
  if (chameleon.colorTransition.active) {
    const tRaw = (millis() - chameleon.colorTransition.start) / chameleon.colorTransition.duration;
    const t = constrain(tRaw, 0, 1);
    const e = t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 1, 3) / 2;
    base.r = lerp(chameleon.colorTransition.from.r, chameleon.colorTransition.to.r, e);
    base.g = lerp(chameleon.colorTransition.from.g, chameleon.colorTransition.to.g, e);
    base.b = lerp(chameleon.colorTransition.from.b, chameleon.colorTransition.to.b, e);
    if (t >= 1) chameleon.colorTransition.active = false;
  }
  let brightnessFactor = 1.0;
  if (avgVol > 0.02) brightnessFactor = map(avgVol, 0.02, 0.1, 1.0, 0.4, true);
  else brightnessFactor = map(avgVol, 0, 0.02, 1.6, 1.0, true);
  chameleon.currentColor.r = constrain(base.r * brightnessFactor, 0, 255);
  chameleon.currentColor.g = constrain(base.g * brightnessFactor, 0, 255);
  chameleon.currentColor.b = constrain(base.b * brightnessFactor, 0, 255);
  if (chameleon.isTransparent) chameleon.transparency = map(chameleon.transparentTimer, 120, 0, 255, 0);
  else chameleon.transparency = 255;
}

function detectColorFromCamera() {
  video.loadPixels();
  const vw = video.width || camWidth;
  const vh = video.height || camHeight;
  let camX = map(detectionArea.x - detectionArea.size / 2, 0, width, 0, vw);
  let camY = map(detectionArea.y - detectionArea.size / 2, 0, height, 0, vh);
  let camSize = map(detectionArea.size, 0, width, 0, vw);
  let r = 0, g = 0, b = 0, count = 0;
  for (let y = camY; y < camY + camSize; y += 2) {
    for (let x = camX; x < camX + camSize; x += 2) {
      if (x >= 0 && x < vw && y >= 0 && y < vh) {
        let idx = (Math.floor(x) + Math.floor(y) * vw) * 4;
        r += video.pixels[idx];
        g += video.pixels[idx + 1];
        b += video.pixels[idx + 2];
        count++;
      }
    }
  }
  if (count > 0) {
    r = r / count;
    g = g / count;
    b = b / count;
    chameleon.colorTransition.active = true;
    chameleon.colorTransition.start = millis();
    chameleon.colorTransition.from = { ...chameleon.currentColor };
    chameleon.colorTransition.to = { r, g, b };
    chameleon.detectedColor = { r, g, b };
    if (detectInterval !== 0) lastDetectTime = millis();
  }
}

function drawChameleon() {
  push();
  translate(chameleon.x, chameleon.y);
  drawChameleonBody();
  pop();
}

function drawChameleonBody() {
  let bodyColor = color(chameleon.currentColor.r, chameleon.currentColor.g, chameleon.currentColor.b, chameleon.transparency);
  noStroke();
  fill(bodyColor);
  ellipse(0, 0, chameleon.size, chameleon.size * 0.6);
  push();
  translate(-chameleon.size * 0.35, -chameleon.size * 0.05);
  fill(bodyColor);
  ellipse(0, 0, chameleon.size * 0.5, chameleon.size * 0.5);
  fill(red(bodyColor) * 0.9, green(bodyColor) * 0.9, blue(bodyColor) * 0.9, alpha(bodyColor));
  triangle(-chameleon.size * 0.18, -chameleon.size * 0.22, -chameleon.size * 0.02, -chameleon.size * 0.36, chameleon.size * 0.1, -chameleon.size * 0.18);
  stroke(0, chameleon.transparency);
  strokeWeight(2);
  line(-chameleon.size * 0.08, chameleon.size * 0.02, chameleon.size * 0.1, chameleon.size * 0.02);
  pop();
  fill(255, chameleon.transparency);
  noStroke();
  ellipse(-chameleon.size * 0.38, -6 + chameleon.eyeMove, 16, 16);
  ellipse(-chameleon.size * 0.38, 6 + chameleon.eyeMove, 16, 16);
  fill(0, chameleon.transparency);
  ellipse(-chameleon.size * 0.40, -6 + chameleon.eyeMove, 7, 7);
  ellipse(-chameleon.size * 0.40, 6 + chameleon.eyeMove, 7, 7);
  noStroke();
  for (let i = -3; i <= 3; i++) {
    let f = map(i, -3, 3, -0.4, 0.4);
    let cx = f * chameleon.size * 0.42;
    let cy = sin(frameCount * 0.02 + i) * 6;
    fill(red(bodyColor) * 0.8, green(bodyColor) * 0.8, blue(bodyColor) * 0.8, chameleon.transparency * 0.85);
    ellipse(cx, cy, chameleon.size * 0.12, chameleon.size * 0.08);
  }
  stroke(0, chameleon.transparency);
  strokeWeight(3);
  line(-10, -chameleon.size / 5, -30, -chameleon.size / 3);
  line(-10, chameleon.size / 5, -30, chameleon.size / 3);
  line(22, -chameleon.size / 5, 42, -chameleon.size / 3);
  line(22, chameleon.size / 5, 42, chameleon.size / 3);
  strokeWeight(2);
  for (let k = -1; k <= 1; k++) {
    line(-30, -chameleon.size / 3, -35 + k * 3, -chameleon.size / 3 + 4);
    line(-30, chameleon.size / 3, -35 + k * 3, chameleon.size / 3 - 4);
    line(42, -chameleon.size / 3, 47 + k * 3, -chameleon.size / 3 + 4);
    line(42, chameleon.size / 3, 47 + k * 3, chameleon.size / 3 - 4);
  }
  noFill();
  stroke(0, chameleon.transparency);
  strokeWeight(3);
  push();
  translate(chameleon.size * 0.45, 0);
  beginShape();
  for (let a = 0; a < 1.6 * TWO_PI; a += 0.25) {
    let r = map(a, 0, 1.6 * TWO_PI, chameleon.size * 0.22, chameleon.size * 0.06);
    vertex(cos(a) * r, sin(a) * r);
  }
  endShape();
  stroke(255, 255, 255, chameleon.transparency * 0.25);
  beginShape();
  for (let a = 0; a < 1.6 * TWO_PI; a += 0.25) {
    let r = map(a, 0, 1.6 * TWO_PI, chameleon.size * 0.22, chameleon.size * 0.06) + 2;
    vertex(cos(a) * r, sin(a) * r);
  }
  endShape();
  pop();
  if (chameleon.isTransparent) drawTransparentEffect();
}

function drawTransparentEffect() {
  noFill();
  stroke(255, 255, 255, chameleon.transparency * 0.5);
  strokeWeight(2);
  if (frameCount % 30 < 15) ellipse(0, 0, chameleon.size * 1.2, chameleon.size * 0.7 * 1.2);
  fill(255, 255, 255, chameleon.transparency);
  noStroke();
  textSize(14);
  text("Transparent!", 0, -chameleon.size / 2 - 20);
}

function drawUI() {
  fill(0, 0, 0, 150);
  noStroke();
  rect(10, 10, 300, 180, 10);
  fill(255);
  textSize(14);
  textAlign(LEFT, TOP);
  let modeText = detectionActive ? nf(detectInterval / 1000, 0, 2) + "s interval" : "Stopped";
  let statusText = "Status: " + (chameleon.isTransparent ? "Transparent" : "Normal");
  let phaseName = phaseLabel();
  text(statusText, 20, 20);
  text("Mode: " + modeText, 20, 45);
  text("Phase: " + phaseName, 20, 70);
  text("Sampled:", 20, 95);
  fill(chameleon.detectedColor.r, chameleon.detectedColor.g, chameleon.detectedColor.b);
  rect(120, 95, 30, 15);
  text("Current:", 20, 120);
  fill(chameleon.currentColor.r, chameleon.currentColor.g, chameleon.currentColor.b);
  rect(120, 120, 30, 15);
  text(`R:${Math.round(chameleon.currentColor.r)} G:${Math.round(chameleon.currentColor.g)} B:${Math.round(chameleon.currentColor.b)}`, 20, 145);
  textAlign(CENTER, CENTER);
  fill(0, 0, 0, 120);
  textSize(16);
  text("Click to cycle: 0.25× → 0.5× → 1× → 2× → Transparent/Stop → 0.25×", width / 2, height - 30);
}

function phaseLabel() {
  const p = phases[phaseIndex];
  if (p.type === "speed") return p.mult + "×";
  return "Transparent/Stop";
}

function applyPhase(i) {
  const p = phases[i];
  if (p.type === "speed") {
    detectionActive = true;
    detectInterval = BASE_INTERVAL / p.mult;
    chameleon.colorTransition.duration = BASE_DURATION / p.mult;
    chameleon.isTransparent = false;
    lastDetectTime = millis();
  } else {
    detectionActive = false;
    detectInterval = 0;
    triggerTransparent();
  }
}

function triggerTransparent() {
  chameleon.isTransparent = true;
  chameleon.transparentTimer = 120;
  chameleon.transparency = map(chameleon.transparentTimer, 120, 0, 255, 0);
}

function mousePressed() {
  phaseIndex = (phaseIndex + 1) % phases.length;
  applyPhase(phaseIndex);
  return false;
}

function touchStarted() {
  phaseIndex = (phaseIndex + 1) % phases.length;
  applyPhase(phaseIndex);
  return false;
}

function deviceShaken() {
  triggerTransparent();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  chameleon.x = width / 2;
  chameleon.y = height / 2;
  detectionArea.x = width / 2;
  detectionArea.y = height / 2 + 120;
}