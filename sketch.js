/*
Pelota que rebota en todos los bordes de la pantalla.
- Cada rebote la hace crecer.
- El mouse suelta partículas al moverse.
- Al llegar a un tamaño máximo, explota y se reinicia.
*/

const RADIO_INICIAL = 25;
const RADIO_MAX = 160;   // tamaño al que explota
const CRECIMIENTO = 12;  // cuánto crece en cada rebote
const PAUSA_EXPLOSION = 2000; // ms antes de reiniciar

let bola;
let particulas = [];
let explotada = false;
let tiempoExplosion = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  reiniciar();
}

function reiniciar() {
  bola = {
    x: width / 2,
    y: height / 2,
    vx: random(5, 8) * random([-1, 1]),
    vy: random(5, 8) * random([-1, 1]),
    r: RADIO_INICIAL,
  };
  explotada = false;
}

function draw() {
  // Fondo llamativo que cambia de color lentamente
  background((frameCount * 0.4) % 360, 85, 100);

  // Partículas del mouse (solo si se está moviendo)
  if (mouseX !== pmouseX || mouseY !== pmouseY) {
    for (let i = 0; i < 3; i++) {
      crearParticula(mouseX, mouseY, 2);
    }
  }

  if (!explotada) {
    actualizarBola();
    dibujarBola();
  } else if (millis() - tiempoExplosion > PAUSA_EXPLOSION) {
    reiniciar();
  }

  actualizarParticulas();
}

function actualizarBola() {
  bola.x += bola.vx;
  bola.y += bola.vy;

  let rebote = false;

  if (bola.x < bola.r) {
    bola.x = bola.r;
    bola.vx *= -1;
    rebote = true;
  } else if (bola.x > width - bola.r) {
    bola.x = width - bola.r;
    bola.vx *= -1;
    rebote = true;
  }

  if (bola.y < bola.r) {
    bola.y = bola.r;
    bola.vy *= -1;
    rebote = true;
  } else if (bola.y > height - bola.r) {
    bola.y = height - bola.r;
    bola.vy *= -1;
    rebote = true;
  }

  if (rebote) {
    bola.r += CRECIMIENTO;
    // Evita que al crecer quede incrustada en el borde
    bola.x = constrain(bola.x, bola.r, width - bola.r);
    bola.y = constrain(bola.y, bola.r, height - bola.r);

    if (bola.r >= RADIO_MAX) explotar();
  }
}

function dibujarBola() {
  stroke(0, 0, 10);
  strokeWeight(4);
  fill(0, 0, 100);
  circle(bola.x, bola.y, bola.r * 2);
}

function explotar() {
  explotada = true;
  tiempoExplosion = millis();
  for (let i = 0; i < 200; i++) {
    crearParticula(bola.x, bola.y, 14);
  }
}

function crearParticula(x, y, fuerza) {
  const angulo = random(TWO_PI);
  const vel = random(0.5, fuerza);
  particulas.push({
    x,
    y,
    vx: cos(angulo) * vel,
    vy: sin(angulo) * vel,
    vida: 1,
    tam: random(4, 14),
    h: random(360),
  });
}

function actualizarParticulas() {
  noStroke();
  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1; // gravedad leve
    p.vida -= 0.02;

    if (p.vida <= 0) {
      particulas.splice(i, 1);
      continue;
    }

    fill(p.h, 90, 100, p.vida);
    circle(p.x, p.y, p.tam * p.vida);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
