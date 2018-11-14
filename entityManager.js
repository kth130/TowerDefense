/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/


var entityManager = {

  // "PRIVATE" DATA
  _bullets: [],
  _enemies: [],
  _towers: [],

  _CURRENT_WAVE: 1,
  
  // "PRIVATE" METHODS

  _generateEnemies: function () {
    var wave = waveManager.getNextWave(waves);

    for (var i = 0; i < wave.length; i++) {
      var { type, amount, initialDelay } = wave[i];
      var index = -1;
      var enemy = enemies.find( (e, x) =>{
          index = x;
          return e.type === type;
      });
        for(var j = 0; j < amount; j++){

            this.generateEnemy({
                hp: enemy.hp,
                delay: (initialDelay + enemy.delay * j),
                vel: enemy.vel,
                sprite: g_sprites.enemies[index],
                numberOfFrames: 4
            });
        }
    }     
  },

  // PUBLIC METHODS

  // A special return value, used by other objects,
  // to request the blessed release of death!
  //
  KILL_ME_NOW: -1,

  // Some things must be deferred until after initial construction
  // i.e. thing which need `this` to be defined.
  //
  deferredSetup: function() {
    this._categories = [this._bullets, this._enemies, this._towers];
  },

  init: function() {
    this._generateEnemies();
  },

  fireBullet: function (cx, cy, velX, velY, rotation, damage, isSlow) {
    this._bullets.push(new Bullet({
      cx: cx,
      cy: cy,
      velX: velX,
      velY: velY,

      rotation: rotation,
      damage: damage,
      isSlow: isSlow
    }));
  },

  generateEnemy: function(descr) {
    this._enemies.push(new Enemy(descr));
  },

  sendNextWave: function() {
    this._generateEnemies();
  },

  createNewTower: function(xPos, yPos) {
    if (menuManager.clickedTower === null) return;
    if (xPos >= g_gameWidth) return;
    var towerCost = menuManager._towerTypes[menuManager.clickedTower].price;
    if (g_money < towerCost) return;

    var xGridNum = Math.floor(xPos / 40);
    var yGridNum = Math.floor(yPos / 40);
    var arrayIndex = 20 * yGridNum + xGridNum;

    if (g_mapGrids[0][arrayIndex]) {
      this._towers.push(new Tower({
        cx: xGridNum * 40 + 20,
        cy: yGridNum * 40 + 20,
        sprite: menuManager._towerTypes[menuManager.clickedTower].sprite,
        shotVel: menuManager._towerTypes[menuManager.clickedTower].shotVel,
        fireRangeRadius: menuManager._towerTypes[menuManager.clickedTower].fireRangeRadius,
        rateOfFire: menuManager._towerTypes[menuManager.clickedTower].rateOfFire,
        price: menuManager._towerTypes[menuManager.clickedTower].price,
        damage: menuManager._towerTypes[menuManager.clickedTower].damage
      }));

      g_money -= towerCost;
    }
    g_mapGrids[0][arrayIndex] = 0;
  },

  update: function(du) {

    if (waveManager.isNextWaveReadyToGo(du)) {
      this._generateEnemies();
    }

    for (var c = 0; c < this._categories.length; ++c) {

      var aCategory = this._categories[c];
      var i = 0;
      var status = null;

      while (i < aCategory.length) {

        if (aCategory[i].delay <= 0 || aCategory[i].delay === undefined) {
          status = aCategory[i].update(du);
        } else {
          aCategory[i].delay = aCategory[i].delay - 1;
          status = null; // Núllstilla status svo óvinum sem eiga eftir að spawna verði ekki eytt
        }

        if (status === this.KILL_ME_NOW) {
          // remove the dead guy, and shuffle the others down to
          // prevent a confusing gap from appearing in the array
          aCategory.splice(i, 1);
        } else {
          ++i;
        }
      }
    }
  },

  render: function(ctx) {

    var debugX = 10,
      debugY = 100;

    for (var c = 0; c < this._categories.length; ++c) {

      var aCategory = this._categories[c];

      for (var i = 0; i < aCategory.length; ++i) {
        if (aCategory[i].delay <= 0 || aCategory[i].delay == undefined)
          aCategory[i].render(ctx);
        //debug.text(".", debugX + i * 10, debugY);

      }
      debugY += 10;
    }
  }

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();
