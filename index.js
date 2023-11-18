let myPlayer;   
let myTimer;    

const asteroids = [];       // Svi asteroidi koji trenutno postoje
const speed = 3;            // Brzina igrača
const asteroidTime = 1000;  // Vrijeme učestalosti stvaranja asteroida
const asteroidNum = 5;      // Broj asteroida koji se stvaraju u jednom intervalu
const maxAsteroids = 30;    // Maksimalni broj asteroida

let milliseconds = 0;       // Varijable za pohranu trenutnog vremena te najboljeg vremena
let seconds = 0;
let minutes = 0;
let currentBestTime;

const keys = {      // Pohranjuje informaciju koja je tipka pritisnuta
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

// Funkcija koja započinje igru - dohvaća se trenutno najbolje vrijeme ako postoji te se započinje igra
function startGame() {
    getCurrentBestTime();
    myGameArea.start();
}

// Funkcija dohvaća iz local storage podatak o trenutno najboljem vremenu te ga pohranjuje lokalno u odgovarajućem obliku
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

// Preko myGameArea upravlja se igrom
var myGameArea = {
    canvas: document.createElement("canvas"), 
    start: function() {    // Stvara igrača te intervale za ažuriranje igre i stvaranje asteroida
        this.canvas.id = "myGameCanvas";
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        myPlayer = new player(30, 30, this.canvas.width / 2, this.canvas.height / 2) 
        myPlayer.draw();
        this.interval = setInterval(updateGameArea, 10);
        this.asteroidInterval = setInterval(createAsteroids, asteroidTime)
    },
    stop: function() {      // Zaustavlja igru te pohranjuje potencijalno novo najbolje vrijeme
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
    clear: function() {     // Briše sve elemente sa canvasa, koristi se kod svakog ažuriranja
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Funkcija koja prikazuje trenutačno vrijeme u gornjem desnom kutu
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

// Predstavlja igrača
function player(width, height, x, y) {
    this.width = width; 
    this.height = height;
    this.x = x;
    this.y = y;

    // Crtanje igrača ovisno o koordinatama x i y (koordinatama se prilikom crtanja oduzima polovica visine i širine kako bi x i y zapravo predstavljali sredinu igrača)
    this.draw = function() {
        ctx = myGameArea.context;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "white";
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - width / 2, this.y - height / 2, this.width, this.height);
    }

    // Kretanje igrača ovisno o pritisnutoj tipci (mijenjaju se koordinate te se igrač ponovno crta)
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

// Predstavlja asteroid slučajno generirane visine i širine
function asteroid(maxHeight, maxWidth, x, y, maxSpeed) {
    this.height = maxHeight * Math.random() + 10
    this.width = maxWidth * Math.random() + 10
    this.x = x
    this.y = y

    // Dva if bloka koji osiguravaju da se svaki stvoreni asteroid uvijek pojavljuje na ekranu
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

    // Crta asteroid ovisno o koordinatama x i y (isto kao i za igrača)
    this.draw = function() {
        ctx = myGameArea.context;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "white";
        ctx.fillStyle = "gray";
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    // Kretanje asteroida (svaki asteroid ima konstantnu brzinu za x i y koordinate)
    this.update = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.draw();
    }

    // Funkcija za detekciju kolizije - asteroid i igrač su se sudarili ako se asteroid ne nalazi na ni jednoj strani igrača
    this.collision = function() {
        let astLeft = (this.x + this.width / 2) < (myPlayer.x - myPlayer.width / 2);
        let astRight = (this.x - this.width / 2) > (myPlayer.x + myPlayer.width / 2);
        let astAbove = (this.y + this.height / 2) < (myPlayer.y - myPlayer.width / 2);
        let astBelow = (this.y - this.height / 2) > (myPlayer.y + myPlayer.height / 2);

        return !(astLeft || astRight || astAbove || astBelow);
    }
}

// Funkcija za ažuriranje igre - obriše se cijeli canvas te ažuriraju igrač, asteroidi i vrijeme (jer je interval za ažuriranje 1ms)
function updateGameArea() {
    myGameArea.clear();
    myPlayer.update();
    for (ast of asteroids) {
        ast.update();
    }
    displayTime();
    checkForCollision();
    removeAsteroids();
}

// Funkcija koja provjerava je li došlo do kolizije između igrača i asteroida
function checkForCollision() {
    for(ast of asteroids) {
        if(ast.collision()) {
            myGameArea.stop();
            return;
        }
    }
}

// Funkcija koja uklanja asteroide koji su otišli previše izvan ekrana te se više neće pojaviti na canvasu
function removeAsteroids() {
    for (ast of asteroids) {
        if(ast.x > 150 + myGameArea.canvas.width || ast.x < -150 || ast.y > 150 + myGameArea.canvas.height || ast.y < -150) {
            const index = asteroids.indexOf(ast)
            asteroids.splice(index, 1)
        }
    }
}

// Funkcija za stvaranje asteroida, stvara asteroidNum asteroida te za svakog od njih generira slučajan x i y tako da je asteroid izvan ekrana
function createAsteroids() {
    if(asteroids.length <= maxAsteroids) {
        for(let i = 0; i < asteroidNum; i++) {
            let asteroidX;
            const rand = Math.random();
            if(rand <= 0.25) {
                asteroidX = 100 * Math.random() + myGameArea.canvas.width;
                asteroidY = Math.random() * myGameArea.canvas.height;
            } else if(rand > 0.25 && rand <= 0.5){
                asteroidX = -100 * Math.random();
                asteroidY = Math.random() * myGameArea.canvas.height;
            } else if(rand > 0.5 && rand <= 0.75) {
                asteroidY = -100 * Math.random();
                asteroidX = Math.random() * myGameArea.canvas.width;
            } else {
                asteroidY = 100 * Math.random() + myGameArea.canvas.height;
                asteroidX = Math.random() * myGameArea.canvas.width;
            }
            const newAsteroid = new asteroid(60, 60, asteroidX, asteroidY, 2)
            asteroids.push(newAsteroid)
        }
    }
}

// Dodavanje funkcionalnosti kretanja kada se pritisne tipka na tipkovnici (strelice)
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

// Prekidanje funkcionalnosti kretanja kada se pusti tipka na tipkovnici
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