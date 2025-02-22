var redBrick = {
    x: 100,
    y: 100,
    w: 150,
    h: 100,
    xSpeed: 5,
    ySpeed: 3,
    colour: 'red',

    draw: function() {
        fill(this.colour);
        rect(this.x, this.y, this.w, this.h);
    },

    move: function() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;

        let hitWall = false;

        // Bounce off walls
        if (this.x <= 0 || this.x + this.w >= width) {
            this.xSpeed *= -1;
            hitWall = true;
        }
        if (this.y <= 0 || this.y + this.h >= height) {
            this.ySpeed *= -1;
            hitWall = true;
        }

        // Change color when hitting a wall
        if (hitWall) {
            this.colour = color(random(255), random(255), random(255));
        }
    }
};

function setup() {
    createCanvas(1080, 720);
}

function draw() {
    background(20);

    redBrick.draw();
    redBrick.move();
}