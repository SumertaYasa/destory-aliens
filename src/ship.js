export default class Character extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.speed = 200;
    this.health = 3;

    this.setCollideWorldBounds(true);

    this.bullets = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });
  }

  shoot() {
    const bullet = this.bullets.get(this.x, this.y - 20, 'bullet');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -350;
    }
  }

  update(keys) {
    if (keys.A.isDown) {
      this.setVelocityX(-this.speed);
    } else if (keys.D.isDown) {
      this.setVelocityX(this.speed);
    } else {
      this.setVelocityX(0);
    }

    if (keys.W.isDown) {
      this.setVelocityY(-this.speed);
    } else if (keys.S.isDown) {
      this.setVelocityY(this.speed);
    } else {
      this.setVelocityY(0);
    }

    if (Phaser.Input.Keyboard.JustDown(keys.SPACE)) {
      this.shoot();
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    // console.log(`Player HP: ${this.health}`);
    if (this.health <= 0) {
      // console.log('Player Destroyed');
      this.destroy();
    }
  }
}
