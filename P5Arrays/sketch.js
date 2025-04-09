// Reference 1: https://p5js.org/reference/p5/push/
// Reference 2: https://p5js.org/examples/classes-and-objects-snowflakes/

let particles = [];
let colorPicker;
let selectedColor = 'red'; // default color

function setup() {
  createCanvas(1920, 1080);
  angleMode(DEGREES);

  //dropdown UI
  colorPicker = createSelect();
  colorPicker.position(30, 30);
  colorPicker.option('red');
  colorPicker.option('green');
  colorPicker.option('blue');
  colorPicker.option('purple');
  colorPicker.option('orange');
  colorPicker.changed(updateSelectedColor);
  colorPicker.style('font-size', '20px');
  colorPicker.style('padding', '6px');

  //particles and push
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  background(30);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].display();
  }
}

function updateSelectedColor() {
  selectedColor = colorPicker.value();
}

class Particle {
  constructor() {
    this.posX = random(width);
    this.posY = random(-100, 0);
    this.size = random(3, 7);
    this.speedY = random(1, 3);
    this.speedX = random(-1, 1);
  }

  update() {
    this.posY += this.speedY;
    this.posX += this.speedX;

    if (this.posY > height) {
      this.posY = random(-100, 0);
      this.posX = random(width);
    }
  }

  display() {
    noStroke();
    fill(selectedColor);
    ellipse(this.posX, this.posY, this.size);
  }
}