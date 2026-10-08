//alert("HolaPapus");

/*
Este es un codigo  
de una pelota
que rebota en la pantalla
*/
console.log("Hola mundo");

let posY = 150;
let velY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(120);
  fill(30, 100, 30);
  noStroke();
  circle(width/2, posY, 50);
  posY += velY;
  velY += 0.5;
  console.log(posY);
  if (posY > height-25) {
    velY = velY * -0.9;
    }
}   