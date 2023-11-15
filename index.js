var myPlayer;
const asteroids = [];
const speed = 3;

function startGame() {
    myGameArea.start()
}

var myGameArea = {
    canvas: document.createElement("canvas"), 
    start: function() {
        this.canvas.id = "myGameCanvas";
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        myPlayer = new player(30, 30, this.canvas.width / 2, this.canvas.height / 2)
        myPlayer.draw();
        this.interval = setInterval(updateGameArea, 20);
        window.setInterval(() => {
            let asteroidX;
            const rand = Math.random();
            if(rand <= 0.25) {
                asteroidX = 10 * Math.random() + this.canvas.width;
                asteroidY = Math.random() * this.canvas.height;
            } else if(rand > 0.25 && rand <= 0.5){
                asteroidX = -10 * Math.random();
                asteroidY = Math.random() * this.canvas.height;
            } else if(rand > 0.5 && rand <= 0.75) {
                asteroidY = -10 * Math.random();
                asteroidX = Math.random() * this.canvas.width;
            } else {
                asteroidY = 10 * Math.random() + this.canvas.height;
                asteroidX = Math.random() * this.canvas.width;
            }
            const newAsteroid = new asteroid(60, 60, asteroidX, asteroidY, 5)
            asteroids.push(newAsteroid)
        }, 300)
    },
    stop: function() {
        clearInterval(this.interval);
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function player(width, height, x, y) {
    this.width = width; 
    this.height = height;
    this.x = x;
    this.y = y;

    this.draw = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "white";
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - width / 2, this.y - height / 2, this.width, this.height);
        ctx.restore();
    }

    this.update = function() {
        if(keys.ArrowDown.pressed) {
            this.y += speed;
        } else if(keys.ArrowLeft.pressed) {
            this.x -= speed;
        } else if(keys.ArrowRight.pressed) {
            this.x += speed;
        } else if(keys.ArrowUp.pressed) {
            this.y -= speed;
        }
        this.draw();

    }
}

function asteroid(maxHeight, maxWidth, x, y, maxSpeed) {
    this.height = maxHeight * Math.random() + 10
    this.width = maxWidth * Math.random() + 10
    this.x = x
    this.y = y
    if(this.x > myGameArea.canvas.width) {
        this.speedX = -maxSpeed * Math.random()
    } else if (this.x < 0) {
        this.speedX = maxSpeed * Math.random()
    } else {
        if(Math.random() > 0.5) {
            this.speedX = maxSpeed * Math.random()
        } else {
            this.speedX = -maxSpeed * Math.random()
        }
    }

    if(this.y > myGameArea.canvas.height) {
        this.speedY = -maxSpeed * Math.random()
    } else if (this.y < 0) {
        this.speedY = maxSpeed * Math.random()
    } else {
        if(Math.random() > 0.5) {
            this.speedY = maxSpeed * Math.random()
        } else {
            this.speedY = -maxSpeed * Math.random()
        }
    }

    this.draw = function() {
        ctx = myGameArea.context;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "white";
        ctx.fillStyle = "gray";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    this.update = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.draw();
    }
}

const keys = {
    ArrowUp: {
        pressed: false
    },
    ArrowDown: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
}

function updateGameArea() {
    myGameArea.clear();
    myPlayer.update();
    for (ast of asteroids) {
        ast.update();
        if(ast.x > 10 + myGameArea.canvas.width || ast.x < -10 || ast.y > 10 + myGameArea.canvas.height || ast.y < -10) {
            const index = asteroids.indexOf(ast)
            asteroids.splice(index, 1)
        }
    }

}

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowDown':
            keys.ArrowDown.pressed = true;
            break;
        case 'ArrowUp':
            keys.ArrowUp.pressed = true;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break;
    }   
});

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowDown':
            keys.ArrowDown.pressed = false;
            break;
        case 'ArrowUp':
            keys.ArrowUp.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
    }   
});