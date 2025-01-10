import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = 80;
    this.setCollideWorldBounds(true);
    this.body.onWorldBounds = true;

    this.bullets = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    this.shootTimer = 0;
  }

  shoot() {
    const bullet = this.bullets.get(this.x, this.y + 20, 'bulletAlien');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = 200;
    }
  }

  update() {
    this.setVelocityY(this.speed);

    if (this.y > this.scene.scale.height) {
      this.setPosition(Phaser.Math.Between(50, 350), Phaser.Math.Between(-100, -50));
    }

    if (this.scene.time.now > this.shootTimer) {
      this.shoot();
      this.shootTimer = this.scene.time.now + 1500;
    }
  }

  destroy() {
    super.destroy();
    this.bullets.clear(true, true);
  }
}
