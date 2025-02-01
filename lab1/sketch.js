

function setup() { 
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    background(90, 90, 90);

    fill(50, 200, 250);
    stroke(200, 150, 50);

    for (var x = 50; x < width; x += 50) {
        for (var y = 50; y < height; y += 50) {
            ellipse(x, y, 30, 30);
        }
    }

    fill(250, 200, 0);
    stroke(250, 250, 250); 

    if (mouseX < width / 2) {
        rect(mouseX, mouseY, 100, 100);
    } else {
        rect(mouseX, mouseY, 50, 50);
    }
}