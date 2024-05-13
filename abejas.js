
    



class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;  // Centro del rectángulo en el eje x
        this.y = y;  // Centro del rectángulo en el eje y
        this.w = w;  // Ancho del rectángulo
        this.h = h;  // Altura del rectángulo
    }

    contains(point) {
        // Chequea si un punto está dentro del rectángulo
        return (point.x >= this.x - this.w &&
                point.x <= this.x + this.w &&
                point.y >= this.y - this.h &&
                point.y <= this.y + this.h);
    }

    intersects(range) {
        // Chequea si otro rectángulo se intersecta con este
        return !(range.x - range.w > this.x + this.w ||
                 range.x + range.w < this.x - this.w ||
                 range.y - range.h > this.y + this.h ||
                 range.y + range.h < this.y - this.h);
    }
}

// Clase Quadtree para manejar la partición espacial
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

        return false;  // En caso de que algo falle
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
        this.velocity.setMag(random(2, 8));
        this.acceleration = createVector();
        this.maxForce = 0.35;
        this.maxSpeed = 8;
        this.perceptionRadius = 370;
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
            if (other !== this && d < this.perceptionRadius / 2) {
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
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
    }

    show() {
        push();
        imageMode(CENTER);
        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading() + radians(90));
        let size = max(10, 10 * window.devicePixelRatio); // Asegura la visibilidad en dispositivos de alta resolución
        image(boidImage, 0, 0, size, size);
        pop();
    }

}



        let flock = [];
        let backgroundImage, cityImage, finalImage, fifthImage, fourthImage, sixthImage, panalImage, boidImage;
        let panalPositions = [];
        let stage = 0;
        let backgroundTracks = [];
        let narrationTracks = [];
        let currentBackgroundSound, currentNarration;
        let panalDisappearSound;

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
    for (let i = 0; i < 70; i++) {
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

            document.getElementById('collageButton').onclick = function() {
        window.location.href = 'collage.html'; // Cambia esto por la URL de tu página de collage
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

    // Detiene la configuración inicial de los panales aquí
    // setupPanales(stage < 5 ? 3 + stage : 0); // Comentamos o eliminamos esta línea

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
        // Configura los panales inmediatamente solo si no hay narración
        setupPanales(stage < 5 ? 3 + stage : 0);
    }

    if (stage === 5) {
        document.getElementById('collageButton').style.display = 'block';
    } else {
        document.getElementById('collageButton').style.display = 'none';
    }
}



function setup() {
    
    pixelDensity(1); // Puedes intentar remover esto para usar la densidad por defecto del dispositivo
    createCanvas(windowWidth, windowHeight);
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('display', 'block');
 

    // Eliminar inicialización de Quadtree aquí ya que se reiniciará en draw
    initFlock(); // Inicializa los boids
    setupButtons(); // Configura los botones
    changeStage(0); // Establece la etapa inicial del juego
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Asegúrate de reiniciar el Quadtree aquí también si las dimensiones del canvas cambian
    quadtree = new Quadtree(new Rectangle(0, 0, width, height), 4);
}


function draw() {
    clear();  
    let scaleFactor = window.devicePixelRatio; // Obtiene la densidad de píxeles del dispositivo
    
    // Establece el fondo actual basado en la etapa del juego
    let currentBackground = [backgroundImage, cityImage, finalImage, fifthImage, fourthImage, sixthImage][stage];
    background(currentBackground);

    // Dibuja panales sólo si la etapa no es la 6
    if (stage !== 5) {
        panalPositions.forEach(panal => {
            image(panalImage, panal.x, panal.y, 50, 50);
        });
    }

    // Reinicia el Quadtree cada frame para mantenerlo actualizado con las posiciones de los boids
    quadtree = new Quadtree(new Rectangle(0, 0, width, height), 4);

    // Insertar cada boid en el Quadtree y procesar su comportamiento
    flock.forEach(boid => {
        quadtree.insert(boid);

        boid.edges();

        // Consulta al Quadtree para obtener boids cercanos
        let range = new Rectangle(boid.position.x - 50, boid.position.y - 50, 100, 100);
        let nearbyBoids = quadtree.query(range);

        boid.followMouse();  // Asegúrate de llamar a followMouse para que respondan al mouse
        boid.flock(nearbyBoids);
        boid.update();

        // Ajusta la visualización de los boids basado en la escala del dispositivo
        boid.show(scaleFactor);
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
                        function touchStarted() {
    mousePressed();  // Puedes llamar a mousePressed o manejarlo de forma específica para toques
}

                    }
                }
            }
        }

   
        document.getElementById('startButton').addEventListener('click', function() {
    initAudio();
});

    
    
