var myPlayer;
var myTimer;
const asteroids = [];
const speed = 3;
const asteroidTime = 1000;
const asteroidNum = 5;
let milliseconds = 0;
let seconds = 0;
let minutes = 0;
let currentBestTime;

function startGame() {
    getCurrentBestTime();
    myGameArea.start();
}

function getCurrentBestTime() {
    if(localStorage.getItem('bestTime')) {
        const time = localStorage.getItem('bestTime').split(":")
        let m = time[0] < 10 ? "0" + time[0] : time[0];
        let s = time[1] < 10 ? "0" + time[1] : time[1];
        let ms = time[2] < 10 ? "00" + time[2] : time[2] < 100 ? "0" + time[2] : time[2];

        currentBestTime = `${m}:${s}:${ms}`
    } else {
        currentBestTime = "00:00:000"
    }
}

function displayTime() {
    milliseconds += 10;
    if(milliseconds == 1000) {
        milliseconds = 0;
        seconds += 1;
        if(seconds == 60) {
            seconds = 0;
            minutes += 1;
        }
    }

    let m = minutes < 10 ? "0" + minutes : minutes;
    let s = seconds < 10 ? "0" + seconds : seconds;
    let ms = milliseconds < 10 ? "00" + milliseconds : milliseconds < 100 ? "0" + milliseconds : milliseconds;

    const ctx = myGameArea.context
    ctx.fillStyle = "red"
    ctx.font = "20px Georgia";
    ctx.fillText(`Najbolje vrijeme: ${currentBestTime}`, myGameArea.canvas.width - 270, 30)
    ctx.fillText(`Vrijeme: ${m}:${s}:${ms}`, myGameArea.canvas.width - 200, 60)
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
        this.interval = setInterval(updateGameArea, 10);
        this.asteroidInterval = setInterval(createAsteroids, asteroidTime)
    },
    stop: function() {
        clearInterval(this.interval);
        clearInterval(this.asteroidInterval);
        if(localStorage.bestTime) {
            const time = localStorage.getItem('bestTime').split(":")
            if(time[0] < minutes) {
                localStorage.setItem('bestTime', `${minutes}:${seconds}:${milliseconds}`)
            } else if(time[0] == minutes) {
                if(time[1] < seconds) {
                    localStorage.setItem('bestTime', `${minutes}:${seconds}:${milliseconds}`)
                } else if(time[1] == seconds) {
                    if(time[2] < milliseconds) {
                        localStorage.setItem('bestTime', `${minutes}:${seconds}:${milliseconds}`) 
                    }
                }
            }
        } else {
            localStorage.setItem('bestTime', `${minutes}:${seconds}:${milliseconds}`)
        }
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
        ctx.shadowBlur = 20;
        ctx.shadowColor = "white";
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - width / 2, this.y - height / 2, this.width, this.height);
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

    this.collision = function() {
        let astLeft = (this.x + this.width) < (myPlayer.x - myPlayer.width / 2);
        let astRight = this.x > (myPlayer.x + myPlayer.width / 2);
        let astAbove = (this.y + this.height) < (myPlayer.y - myPlayer.width / 2);
        let astBelow = this.y > (myPlayer.y + myPlayer.height / 2);

        return !(astLeft || astRight || astAbove || astBelow);
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
    }
    for (ast of asteroids) {
        if(ast.x > 50 + myGameArea.canvas.width || ast.x < -50 || ast.y > 50 + myGameArea.canvas.height || ast.y < -50) {
            const index = asteroids.indexOf(ast)
            asteroids.splice(index, 1)
        }
    }
    displayTime();
    for(ast of asteroids) {
        if(ast.collision()) {
            myGameArea.stop();
            return;
        }
    }
}

function createAsteroids() {
    for(let i = 0; i < asteroidNum; i++) {
        let asteroidX;
        const rand = Math.random();
        if(rand <= 0.25) {
            asteroidX = 10 * Math.random() + myGameArea.canvas.width;
            asteroidY = Math.random() * myGameArea.canvas.height;
        } else if(rand > 0.25 && rand <= 0.5){
            asteroidX = -10 * Math.random();
            asteroidY = Math.random() * myGameArea.canvas.height;
        } else if(rand > 0.5 && rand <= 0.75) {
            asteroidY = -10 * Math.random();
            asteroidX = Math.random() * myGameArea.canvas.width;
        } else {
            asteroidY = 10 * Math.random() + myGameArea.canvas.height;
            asteroidX = Math.random() * myGameArea.canvas.width;
        }
        const newAsteroid = new asteroid(60, 60, asteroidX, asteroidY, 5)
        asteroids.push(newAsteroid)
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