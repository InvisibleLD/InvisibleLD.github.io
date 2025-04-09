let sizeSlider, colorSelect;
let characterSize = 100;
let characterColor = 'red';

function setup() {
  // Create canvas inside a div
  let canvas = createCanvas(400, 300);
  canvas.parent("canvas-holder");

  // Slider setup
  sizeSlider = createSlider(50, 200, 100);
  sizeSlider.parent("slider-area");

  // Dropdown setup
  colorSelect = createSelect();
  colorSelect.option('red');
  colorSelect.option('green');
  colorSelect.option('blue');
  colorSelect.option('purple');
  colorSelect.option('orange');
  colorSelect.parent("dropdown-area");

  // Callback on mouse press
  canvas.mousePressed(changeColor);
}

function draw() {
  background(220);

  // Get values from GUI elements
  characterSize = sizeSlider.value();  // 1st .value()
  fill(colorSelect.value());           // 2nd .value()
  noStroke();
  ellipse(width / 2, height / 2, characterSize);
}

// Callback: changes color when canvas clicked
function changeColor() {
  colorSelect.selected(random(['red', 'green', 'blue', 'purple', 'orange']));
}

// Callback: press spacebar to reset size
function keyPressed() {
  if (key === ' ') {
    sizeSlider.value(100);
  }
}