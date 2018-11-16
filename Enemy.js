// ====
// Enemy
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Enemy(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);
    this.setStartPosition(); // Ætti að taka inn hvaða borð/level er verið að spila

    this.frameIndex = 0,
    this.tickCount = 0,
    this.ticksPerFrame = 6,
    this.numberOfFrames = this.numberOfFrames || 1;

    // Default sprite and scale, if not otherwise specified
    this.nextNodeIndex = this.nextNodeIndex || 1;
    this.sprite = this.sprite || g_sprites.enemies[0];
    this.scale  = this.scale  || 1;
    this.defaultVel = this.vel;
    this.slowTimer = 0;

};

Enemy.prototype = new Entity();

// Finnur fyrsta punktinn í pathinu og setur hann sem upphafspunkt fyrir óvininn
Enemy.prototype.setStartPosition = function () {
  var pathNode = g_paths[g_level][0];
  this.cx = pathNode.cx;
  this.cy = pathNode.cy;
};


Enemy.prototype.update = function (du) {
    spatialManager.unregister(this);

    this.tickCount += 1;

    if(this.tickCount > this.ticksPerFrame) {
      this.tickCount = 0;
      // Go to the next frame
      // If the current frame index is in range
      if (this.frameIndex < this.numberOfFrames - 1) {
        // Go to the next frame
        this.frameIndex += 1;

      } else {
        this.frameIndex = 0;
      }
    }

    if(this._isDeadNow) return entityManager.KILL_ME_NOW;

    if(this.slowTimer > 0){
      this.vel = this.defaultVel/2;
      this.slowTimer -= du;
    }
    else this.vel = this.defaultVel;

    // Athugar hvort óvinur sé kominn á endapunkt
    if (this.nextNodeIndex >= g_paths[g_level].length){
      g_lives--;  // Minnkar líf

      if(g_lives <= 0) {
        g_gameState = GAME_OVER;
      } // Endar leikinn ef lífin eru búin
      return entityManager.KILL_ME_NOW; // Eyðir óvini
    }

    var pathNode = g_paths[g_level][this.nextNodeIndex]; // ætti að taka inn hvaða bor/lvl er verið að spila

    // Athugar hvar næsti punktur er og færir enemy í átt að honum.
    // Ef enemy er á næsta punkt þá breytum við næsta punkt.
    if(Math.abs(pathNode.cx - this.cx) < this.vel) this.cx = pathNode.cx;
    if(Math.abs(pathNode.cy - this.cy) < this.vel) this.cy = pathNode.cy;

    if (pathNode.cx > this.cx) {
      this.cx += this.vel;
      this.rotation = Math.PI/2;
    }
    else if (pathNode.cx < this.cx) {
      this.cx -= this.vel;
      this.rotation = Math.PI*1.5;
    }
    else if (pathNode.cy > this.cy) {
      this.cy += this.vel;
      this.rotation = Math.PI;
    }
    else if (pathNode.cy < this.cy) {
      this.cy -= this.vel;
      this.rotation = 0;
    }
    else {
      this.nextNodeIndex += 1;
    }

    spatialManager.register(this);

};

Enemy.prototype.getRadius = function () {
    return this.scale * (this.sprite.width / 2) * 0.9;
};

// HACKED-IN AUDIO (no preloading)
Enemy.prototype.evaporateSound = new Audio(
  "sounds/rockEvaporate.ogg");

Enemy.prototype.takeBulletHit = function (damage, isSlow) {
    this.hp = this.hp - damage;
    if(isSlow) this.slowTimer = 50;
    if(this.hp <= 0){
      this.kill();
      g_money += 50;
    }
    this.evaporateSound.play();
};

Enemy.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    var w = this.width/ this.numberOfFrames;
    this.sprite.scale = this.scale;
    // this.sprite.drawCentredAt(
    //   ctx, this.cx, this.cy, this.rotation
    // );
    this.sprite.drawCentredAtAnimated(
        ctx,
        this.frameIndex,
        this.cx,
        this.cy,
        this.rotation
    );
};
