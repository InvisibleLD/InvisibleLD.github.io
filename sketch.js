let x = 0;
let y = 0;

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('pointer-events', 'none');
}

function draw() {
    clear(); // make canvas transparent
    fill(255, 255, 255, 150);
    ellipse(x, y, 20, 20);
    x += 2;
    y += 3;

    if (x > width) x = 0;
    if (y > height) y = 0;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}