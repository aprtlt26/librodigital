let audioContext;
let flock = [];
let backgroundImage, cityImage, finalImage, fifthImage, fourthImage, sixthImage, panalImage, boidImage;
let panalPositions = [];
let stage = 0;
let backgroundTracks = [];
let narrationTracks = [];
let currentBackgroundSound, currentNarration;
let panalDisappearSound;

function requestAudioPermission() {
    return new Promise((resolve, reject) => {
        const permissionAlert = window.confirm('¿Permitir uso de sonido?');
        if (permissionAlert) {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            audioContext.resume().then(() => {
                console.log('Audio activado');
                resolve();
            }).catch(err => {
                console.error('Error al activar el audio:', err);
                reject(err);
            });
        } else {
            reject('Permiso denegado');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initAudio();
});

function initAudio() {
    requestAudioPermission().then(() => {
        startGame();
    }).catch(err => {
        console.error('Error al solicitar permiso de audio:', err);
    });
}

function startGame() {
    console.log("El juego ha comenzado");
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    contains(point) {
        return (point.x >= this.x - this.w &&
                point.x <= this.x + this.w &&
                point.y >= this.y - this.h &&
                point.y <= this.y + this.h);
    }
    intersects(range) {
        return !(range.x - range.w > this.x + this.w ||
                 range.x + range.w < this.x - this.w ||
                 range.y - range.h > this.y + this.h ||
                 range.y + range.h < this.y - this.h);
    }
}

class Quadtree {
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }
    subdivide() {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let w = this.boundary.w / 2;
        let h = this.boundary.h / 2;

        let ne = new Rectangle(x + w, y - h, w, h);
        this.northeast = new Quadtree(ne, this.capacity);

        let nw = new Rectangle(x - w, y - h, w, h);
        this.northwest = new Quadtree(nw, this.capacity);

        let se = new Rectangle(x + w, y + h, w, h);
        this.southeast = new Quadtree(se, this.capacity);

        let sw = new Rectangle(x - w, y + h, w, h);
        this.southwest = new Quadtree(sw, this.capacity);

        this.divided = true;
    }
    insert(point) {
        if (!this.boundary.contains(point)) {
            return false;
        }
        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }
        if (!this.divided) {
            this.subdivide();
        }
        if (this.northeast.insert(point) || this.northwest.insert(point) ||
            this.southeast.insert(point) || this.southwest.insert(point)) {
            return true;
        }
        return false;
    }
    query(range, found) {
        if (!found) {
            found = [];
        }
        if (!this.boundary.intersects(range)) {
            return found;
        }
        for (let p of this.points) {
            if (range.contains(p)) {
                found.push(p);
            }
        }
        if (this.divided) {
            this.northeast.query(range, found);
            this.northwest.query(range, found);
            this.southeast.query(range, found);
            this.southwest.query(range, found);
        }
        return found;
    }
}

class Boid {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2, 4));
        this.acceleration = createVector();
        this.maxForce = 0.1;
        this.maxSpeed = 8;
        this.perceptionRadius = 100;
        this.osc = new p5.Oscillator('sine');
        this.osc.amp(0.01);
        this.osc.start();
    }
    updateOscillator() {
        let freq = map(this.position.x, 0, width, 205.285, 260.655);
        this.osc.freq(freq);
        let amp = map(this.position.y, 0, height, 0.00, 0.03);
        this.osc.amp(amp);
        let pan = map(this.position.x, 0, width, -1, 1);
        pan = constrain(pan, -1, 1);
        this.osc.pan(pan);
    }
    edges() {
        if (this.position.x > width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = width;
        if (this.position.y > height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = height;
    }
    align(boids) {
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other !== this && d < this.perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }
    cohesion(boids) {
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other !== this && d < this.perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.limit(this.maxForce);
        }
        return steering;
    }
    separation(boids) {
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other !== this && d < this.perceptionRadius / 8) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.div(d);
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.limit(this.maxForce);
        }
        return steering;
    }
    followMouse() {
        let mouse = createVector(mouseX, mouseY);
        let steer = p5.Vector.sub(mouse, this.position);
        steer.setMag(this.maxSpeed);
        steer.sub(this.velocity);
        steer.limit(this.maxForce);
        this.acceleration.add(steer);
    }
    flock(boids) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);
        let mouseForce = this.followMouse();
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
        this.acceleration.add(mouseForce);
    }
    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
        this.updateOscillator();
    }
    show(scaleFactor) {
        push();
        imageMode(CENTER);
        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading() + radians(190));
        let size = max(15, 0 * scaleFactor);
        image(boidImage, 0, 0, size, size);
        pop();
    }
}

function preload() {
    backgroundImage = loadImage('paisaje.png');
    cityImage = loadImage('ciudad.png');
    finalImage = loadImage('africa.png');
    fifthImage = loadImage('centro.png');
    fourthImage = loadImage('campomorado.png');
    sixthImage = loadImage('azul.png');
    panalImage = loadImage('panal.png');
    boidImage = loadImage('abeja.png');
    panalDisappearSound = loadSound('panal.mp3');
    for (let i = 1; i <= 6; i++) {
        backgroundTracks.push(loadSound(`background${i}.mp3`));
        narrationTracks.push(loadSound(`narration${i}.mp3`));
    }
}

function setupAudioProcessing() {
    let compressor = new p5.Compressor();
    compressor.threshold(-24);
    compressor.ratio(12);
    compressor.attack(0.003);
    compressor.release(0.25);
    let reverb = new p5.Reverb();
    reverb.process(compressor, 3, 3);
    flock.forEach(boid => boid.osc.connect(reverb));
}

function setupPanales(count) {
    panalPositions = [];
    let margin = 70;
    for (let i = 0; i < count; i++) {
        let placed = false, attempts = 0;
        while (!placed && attempts < 100) {
            let candidatePosition = createVector(random(margin, width - margin), random(margin, height - margin));
            let tooClose = panalPositions.some(panal => p5.Vector.dist(candidatePosition, panal) < 80);
            if (!tooClose) {
                panalPositions.push(candidatePosition);
                placed = true;
            }
            attempts++;
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function initFlock() {
    console.log(`Inicializando boids en canvas de tamaño: ${width}x${height}`);
    flock = [];
    for (let i = 0; i < 100; i++) {
        let boid = new Boid(random(width), random(height));
        flock.push(boid);
        console.log(`Boid creado en posición: ${boid.position.x}, ${boid.position.y}`);
    }
}

function setupButtons() {
    let buttons = document.querySelectorAll('#buttonContainer button');
    buttons.forEach(button => button.style.display = 'block');
    document.getElementById('prevButton').onclick = function() {
        if (stage > 0) {
            stage--;
            changeStage(stage);
        }
    };
    document.getElementById('nextButton').onclick = function() {
        if (stage < 5) {
            stage++;
            changeStage(stage);
        }
    };
    document.getElementById('restartButton').onclick = function() {
        stage = 0;
        changeStage(stage);
    };
    document.getElementById('newGameButton').onclick = function() {
        window.location.href = 'collage.html';
    };
    document.getElementById('subtitleButton').onclick = function() {
        let subtitles = document.getElementById('subtitles');
        subtitles.style.display = subtitles.style.display === 'none' ? 'block' : 'none';
    };
    document.getElementById('paintButton').onclick = function() {
        window.location.href = 'paint.html';
    };
}

function changeStage(newStage) {
    if (currentBackgroundSound) {
        currentBackgroundSound.stop();
    }
    if (currentNarration) {
        currentNarration.stop();
    }
    stage = newStage;
    let backgrounds = [backgroundImage, cityImage, finalImage, fifthImage, fourthImage, sixthImage];
    background(backgrounds[stage]);

    currentBackgroundSound = backgroundTracks[stage];
    if (currentBackgroundSound) {
        currentBackgroundSound.loop();
    }
    if (narrationTracks[stage]) {
        currentNarration = narrationTracks[stage];
        currentNarration.play();
        currentNarration.onended(() => {
            setupPanales(stage < 5 ? 3 + stage : 0);
        });
    } else {
        setupPanales(stage < 5 ? 3 + stage : 0);
    }
    if (stage === 5) {
        document.getElementById('collageButton').style.display = 'block';
    } else {
        document.getElementById('collageButton').style.display = 'none';
    }
}

function setup() {
    pixelDensity(1);
    createCanvas(windowWidth, windowHeight);
    initFlock(); // Initialize flock here
    setupAudioProcessing();
    setupButtons();
    changeStage(0);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    clear();
    let currentBackground = [backgroundImage, cityImage, finalImage, fifthImage, fourthImage, sixthImage][stage];
    background(currentBackground);

    if (stage !== 5) {
        panalPositions.forEach(panal => {
            image(panalImage, panal.x, panal.y, 50, 50);
        });
    }

    quadtree = new Quadtree(new Rectangle(0, 0, width, height), 4);

    flock.forEach(boid => {
        quadtree.insert(boid);
        boid.edges();
        let range = new Rectangle(boid.position.x - 50, boid.position.y - 50, 100, 100);
        let nearbyBoids = quadtree.query(range);
        boid.flock(nearbyBoids);
        boid.update();
        boid.show(window.devicePixelRatio);
    });
}

function mousePressed() {
    for (let i = panalPositions.length - 1; i >= 0; i--) {
        let pos = panalPositions[i];
        if (dist(mouseX, mouseY, pos.x, pos.y) < 50) {
            panalPositions.splice(i, 1);
            panalDisappearSound.play();
            if (panalPositions.length === 0) {
                stage++;
                changeStage(stage);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setupButtons();
});
