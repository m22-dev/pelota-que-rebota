
const RADIO_INICIAL = 25;
const RADIO_MAX = 160;   // tamaño al que explota
const CRECIMIENTO = 12;  // cuánto crece en cada rebote
const PAUSA_EXPLOSION = 2000; // ms antes de reiniciar

let bola;
let particulas = [];
let explotada = false;
let tiempoExplosion = 0;

/* ---------- Sonido (Web Audio API, sin librerías extra) ---------- */
let audioCtx = null;

// Los navegadores bloquean el audio hasta que el usuario hace clic o toca una tecla
function activarAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}
function mousePressed() { activarAudio(); }
function keyPressed() { activarAudio(); }

function audioListo() {
  return audioCtx && audioCtx.state === "running";
}

// Sonido corto de rebote: más grave cuanto más grande es la pelota
function sonidoRebote(radio) {
  if (!audioListo()) return;
  const t = audioCtx.currentTime;
  const frecuencia = map(radio, RADIO_INICIAL, RADIO_MAX, 880, 220, true);

  const osc = audioCtx.createOscillator();
  const ganancia = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(frecuencia, t);
  osc.frequency.exponentialRampToValueAtTime(frecuencia * 0.6, t + 0.12); // pequeño "bloop"

  ganancia.gain.setValueAtTime(0.0001, t);
  ganancia.gain.exponentialRampToValueAtTime(0.3, t + 0.01);   // ataque rápido
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t + 0.15); // caída suave

  osc.connect(ganancia).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.16);
}

// Explosión: ruido filtrado que se apaga + un golpe grave
function sonidoExplosion() {
  if (!audioListo()) return;
  const t = audioCtx.currentTime;
  const duracion = 0.8;

  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duracion, audioCtx.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < datos.length; i++) datos[i] = random(-1, 1);

  const ruido = audioCtx.createBufferSource();
  ruido.buffer = buffer;
  const filtro = audioCtx.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.setValueAtTime(3000, t);
  filtro.frequency.exponentialRampToValueAtTime(200, t + duracion);
  const gRuido = audioCtx.createGain();
  gRuido.gain.setValueAtTime(0.5, t);
  gRuido.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
  ruido.connect(filtro).connect(gRuido).connect(audioCtx.destination);
  ruido.start(t);

  const grave = audioCtx.createOscillator();
  const gGrave = audioCtx.createGain();
  grave.type = "sine";
  grave.frequency.setValueAtTime(150, t);
  grave.frequency.exponentialRampToValueAtTime(40, t + 0.4);
  gGrave.gain.setValueAtTime(0.6, t);
  gGrave.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  grave.connect(gGrave).connect(audioCtx.destination);
  grave.start(t);
  grave.stop(t + 0.5);
}

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

  // Aviso hasta que el navegador permita el audio (requiere un clic)
  if (!audioListo()) {
    noStroke();
    fill(0, 0, 0, 0.6);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("Haz clic en la pantalla para activar el sonido", width / 2, height - 40);
  }
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
    sonidoRebote(bola.r); // suena con el tamaño actual, antes de crecer
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
  sonidoExplosion();
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
