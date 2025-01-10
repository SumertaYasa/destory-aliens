import './style.css';
import Phaser from 'phaser';
import Character from './ship';
import Enemy from './aliens';
import RexVirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

let background;
let player;
let enemies;
let enemyBullets;
let keys;
let joystick;
let shootButton;
let healthBar;

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 600,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  plugins: {
    scene: [
      {
        key: 'rexVirtualJoystick',
        plugin: RexVirtualJoystickPlugin,
        mapping: 'rexVirtualJoystick',
      },
    ],
  },
};

function preload() {
  this.load.image('background', '/assets/background.png');
  this.load.image('ship', '/assets/mainShip.png');
  this.load.image('bullet', '/assets/bullet.png');
  this.load.image('bulletAlien', '/assets/bulletAlien.png');
  this.load.image('enemy', '/assets/alien.png');
}

function create() {
  background = this.add.tileSprite(200, 300, 400, 600, 'background');
  player = new Character(this, 200, 500, 'ship');

  player.health = 15;

  healthBar = this.add.graphics();
  updateHealthBar();

  keys = this.input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D,
    SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
  });

  enemies = this.physics.add.group({
    classType: Enemy,
    runChildUpdate: true,
  });

  const maxEnemies = 5;

  for (let i = 0; i < maxEnemies; i++) {
    const enemy = new Enemy(this, Phaser.Math.Between(50, 350), Phaser.Math.Between(-100, 0), 'enemy');
    enemies.add(enemy);
  }

  this.physics.add.collider(player.bullets, enemies, (bullet, enemy) => {
    bullet.setActive(false);
    bullet.setVisible(false);

    enemy.setTint(0xff0000);
    enemy.setAlpha(0.5);

    this.time.delayedCall(100, () => {
      enemy.clearTint();
      enemy.setAlpha(1);
    });

    this.time.delayedCall(200, () => {
      enemy.destroy();
      if (enemies.getChildren().length < maxEnemies) {
        const newEnemy = new Enemy(this, Phaser.Math.Between(50, 350), Phaser.Math.Between(-100, 0), 'enemy');
        enemies.add(newEnemy);
      }
    });
  });

  this.physics.add.collider(player, enemies, (player, enemy) => {
    player.takeDamage(1);
    enemy.destroy();
  });
  
  enemies.children.iterate((enemy) => {
    this.physics.add.collider(player, enemy.bullets, (player, bullet) => {
      player.takeDamage(1);
      bullet.destroy();
    });
  });

  if (!this.sys.game.device.os.desktop) {
    joystick = this.rexVirtualJoystick.add(this, {
      x: 70,
      y: 500,
      radius: 50,
      base: this.add.circle(0, 0, 50, 0x888888),
      thumb: this.add.circle(0, 0, 30, 0xcccccc),
      enable: true,
    });

    const speedFactor = 0.02;

    joystick.on('update', (pointer) => {
      const forceX = joystick.forceX;
      const forceY = joystick.forceY;

      const maxSpeed = player.speed * speedFactor;
      player.setVelocityX(forceX * maxSpeed);
      player.setVelocityY(forceY * maxSpeed);
    });

    shootButton = this.add.text(300, 500, 'Fire', { font: '24px Arial', fill: '#fff' });
    shootButton.setInteractive();
    shootButton.on('pointerdown', () => {
      player.shoot();
    });
  } else {
    this.input.keyboard.on('keydown', (event) => {
      if (event.code === 'Space') {
        player.shoot();
      }
    });
  }
}

function update() {
  background.tilePositionY += 1;
  player.update(keys);

  if (joystick) {
    const forceX = joystick.forceX;
    const forceY = joystick.forceY;
    player.setVelocityX(forceX * player.speed * 0.02);
    player.setVelocityY(forceY * player.speed * 0.02);
  }

  if (shootButton && shootButton.isDown) {
    player.shoot();
  }

  enemies.children.iterate((enemy) => {
    if (enemy) {
      enemy.update();
    }
  });

  updateHealthBar();
}

function updateHealthBar() {
  healthBar.clear();
  healthBar.fillStyle(0x00ff00, 1);
  healthBar.fillRect(20, 20, player.health * 10, 10);
}

const game = new Phaser.Game(config);
