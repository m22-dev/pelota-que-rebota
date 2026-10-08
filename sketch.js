//alert("HolaPapus");

/*
Este es un codigo  
de una pelota
que rebota en la pantalla
*/
console.log("Hola mundo");

let posY = 150;
let velY = 0;
const radio = 25;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(120);
  fill(30, 100, 30);
  noStroke();
  circle(width / 2, posY, radio * 2);

  velY += 0.5;
  posY += velY;

  // Rebote en el borde inferior
  if (posY > height - radio) {
    posY = height - radio;
    velY *= -0.9;
  }

  // Rebote en el borde superior
  if (posY < radio) {
    posY = radio;
    velY *= -0.9;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}