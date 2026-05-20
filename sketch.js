let sushibackground;
let salmonrice;
let soysauce;
let sushiroll;

let platforms = [
  { x: 0, y: 410, w: 800, h: 40 }, //ground
  { x: 110, y: 310, w: 120, h: 35 },
  { x: 260, y: 240, w: 140, h: 35 },
  { x: 500, y: 170, w: 120, h: 35 },
  { x: 360, y: 320, w: 110, h: 35 },
  { x: 620, y: 290, w: 130, h: 35 },
];

let player  = {
  x: 100,
  y: 100,
  
  
  vx: 0,
  vy: 0,

  r: 20,        // radius (for drawing and collisions)

  speed: 0.55,    // horizontal acceleration per frame
  maxSpeed: 4.5,  // maximum horizontal speed
  jumpForce: -12, // upward velocity applied when jumping (negative = upward)
  friction: 0.78, // horizontal slowdown when no key is pressed (0–1, lower = more friction)

  onGround: false, // tracks whether the player is standing on something
  onSoysauce: false,
}

const GRAVITY = 0.6; // downward force added to vy every frame

const PLATFORM_COLOR = [255, 160, 50];

function preload() {
  sushibackground = loadImage('images/sushibackground.png');
  salmonrice = loadImage('images/salmonrice.png');
  soysauce = loadImage('images/soysauce.png');
  sushiroll = loadImage('images/sushiroll.png');
}

function setup() {
  createCanvas(800, 450);
  background(sushibackground);
}

function draw() {
  background(sushibackground);  
  
  handleInput();
  applyPhysics();
  resolvePlatformCollisions();

  drawPlatforms();
  drawSoysauce();
  drawPlayer();
  drawHUD();
}

function handleInput() {
  // --- Horizontal movement ---
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // LEFT or A
    player.vx -= player.speed;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // RIGHT or D
    player.vx += player.speed;
  }

  // --- Clamp horizontal speed ---
  // constrain(value, min, max) keeps a value within a range.
  // Without this, holding a key forever would accelerate infinitely.
  player.vx = constrain(player.vx, -player.maxSpeed, player.maxSpeed);

  // --- Apply friction when no horizontal key is pressed ---
  // Multiplying by a value less than 1 gradually slows the player down.
  if (
    !keyIsDown(LEFT_ARROW) &&
    !keyIsDown(65) &&
    !keyIsDown(RIGHT_ARROW) &&
    !keyIsDown(68)
  ) {
    if (player.onSoySauce) {
      player.vx *= 0.98; // slippery, slows down very slowly
    } else {
      player.vx *= player.friction; // normal ground friction
    }
  }

  // --- Jump ---
  // The player can only jump when standing on the ground (onGround = true).
  // This prevents jumping again mid-air.
  if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && player.onGround) { // UP or W
    player.vy = player.jumpForce;
    player.onGround = false;
  }
}

function applyPhysics() {
  // 1. Apply gravity — pulls the player down every frame
  player.vy += GRAVITY;

  // 2. Move player by its current velocity
  player.x += player.vx;
  player.y += player.vy;

  // 3. Keep player inside canvas horizontally
  player.x = constrain(player.x, player.r, width - player.r);

  // 4. If player falls below the canvas, reset to start position
  if (player.y > height + 100) {
    player.x = 100;
    player.y = platforms[0].y - player.r;
    player.vx = 0;
    player.vy = 0;
  }

  // Assume in the air until collision check says otherwise
  player.onGround = false;
  player.onSoySauce = false;
}

function resolvePlatformCollisions() {
  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];

    // Player's bounding box edges
    let playerLeft   = player.x - player.r;
    let playerRight  = player.x + player.r;
    let playerBottom = player.y + player.r;

    // Platform edges
    let platLeft  = p.x;
    let platRight = p.x + p.w;
    let platTop   = p.y;

    // 1. Check horizontal overlap
    let overlapsHorizontally = playerRight > platLeft && playerLeft < platRight;

    // 2 & 3. Check if landing on top (falling down onto the platform surface)
    // The small tolerance (+ 20) prevents the player clipping through
    // fast-moving platforms or getting stuck on edges.
    let landingOnTop =
      player.vy >= 0 &&
      playerBottom >= platTop &&
      playerBottom <= platTop + 20;

    if (overlapsHorizontally && landingOnTop) {
      player.y = platTop - player.r;
      player.vy = 0;
      player.onGround = true;

      if (i === 1) {
        player.onSoySauce = true;
      }
    }
  }
}

function drawPlatforms() {
  for (let i = 1; i < platforms.length; i++) {
    let p = platforms[i];
    image(salmonrice, p.x, p.y, p.w, p.h);
  }
}

function drawSoysauce() {

  push();
  let p = platforms[1]; // bottom-left salmon platform

  imageMode(CENTER);
  image(soysauce, p.x + p.w / 2, p.y + 10, p.w, 35);

  pop();
}

function drawPlayer() {
  push();

  imageMode(CENTER);
  image(sushiroll, player.x, player.y, player.r * 2, player.r * 2);

  pop();
}

function drawHUD() {
  push();

  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text('Use arrow keys or WASD to move and jump!', 10, 10);

  pop();
} 