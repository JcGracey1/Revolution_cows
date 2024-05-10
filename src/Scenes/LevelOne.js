class LevelOne extends Phaser.Scene {
    constructor() {
        super("levelOneScene");
        // Initialize state here or in a separate init method
        this.initGameState();
    }

    
    initGameState() {
        this.my = { sprite: {}, bullets: [], enemyBullets: [], text: {} };
        this.bodyX = 400;
        this.bodyY = 515;
        this.enemySpeed = 2;
        this.enemyDirection = 1;
        this.myScore = 0;
        this.myHealth = 3;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("background", "background.png");
        this.load.image("cowMain", "cow.png");
        this.load.image("bullet", "grass_shoot.png");
        this.load.image("enemy1", "shipGreen_manned.png");
        this.load.image("blueShip", "shipBlue_manned.png");
        //explosion:
        this.load.image("explosion", "laserYellow_burst.png");
        //enemy bullet:
        this.load.image("enemyFire", "laserYellow3.png");

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {
        let my = this.my;

        // Set background image:
        let bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;

        my.sprite.body = this.add.sprite(this.bodyX, this.bodyY, "cowMain").setScale(0.7);
        my.enemy1 = this.add.sprite(100, 50, "enemy1").setScale(0.8);  // Starting position of the enemy
        my.enemy1.active = true;
        my.enemy1.scorePoints = 25;

        // Functional keys:
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        my.text.score = this.add.bitmapText(580, 570, "rocketSquare", "Score " + this.myScore);
        my.text.health = this.add.bitmapText(10, 570, "rocketSquare", "Health " + this.myHealth);

        // Collision detection added below
        document.getElementById('description').innerHTML = '<h2>A - left <br>D - right <br>SPACE - shoot </h2>';
        
        // Periodic enemy shooting:
        this.time.addEvent({
            delay: 1500, // Enemy shoots every 1000 milliseconds
            callback: this.enemyFire,
            callbackScope: this,
            loop: true
        });

            // Initialize the group for enemy bullets
        // my.enemyBullets = this.add.group({
        //     classType: Phaser.GameObjects.Sprite,  // Ensure they are treated as Sprites
        //     runChildUpdate: true  // Allows each bullet to have its own 'update' method
        // });

        my.enemyBullets = this.physics.add.group();

    }

    enemyFire() {
        if (!this.my.enemy1.active) {
            return; // Do not fire if the enemy is inactive
        }
    
        let bullet = this.my.enemyBullets.create(this.my.enemy1.x, this.my.enemy1.y + 20, 'enemyFire');
        bullet.setVelocityY(200);  // Moving down
    }

    update() {
        let my = this.my;

        // Player movement logic
        if (this.aKey.isDown) {
            my.sprite.body.x -= 5;
            if (my.sprite.body.x <= 40) my.sprite.body.x = 40;
        }
        if (this.dKey.isDown) {
            my.sprite.body.x += 5;
            if (my.sprite.body.x >= 760) my.sprite.body.x = 760;
        }

        // Firing bullets
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            let bullet = this.add.sprite(my.sprite.body.x, my.sprite.body.y - 55, "bullet");
            my.bullets.push(bullet);
        }

        // Update and check collisions for bullets
        my.bullets.forEach((bullet, index) => {
            bullet.y -= 3;
            if (bullet.y < 0) {
                bullet.destroy();
                my.bullets.splice(index, 1);
            } else if (my.enemy1.active && this.collides(my.enemy1, bullet)) {
                this.createExplosion(my.enemy1.x, my.enemy1.y);
                bullet.destroy();
                my.bullets.splice(index, 1);
                my.enemy1.destroy();  // Destroy the enemy
                my.enemy1.active = false;  // Update the active flag
                //my.enemy1 = this.add.sprite(100, 50, "enemy1").setScale(0.8);
                //this.scene.start('gameOverScene');  // Assuming you handle game over logic
                //update score:
                this.myScore += my.enemy1.scorePoints;
                this.updateScore();
                this.time.delayedCall(2000, () => {
                    this.scene.stop();
                    this.scene.start("levelTwoScene");  // Assuming you want to restart or reset 'levelTwoScene'
                }, [], this);
            }
        });

        // Enemy movement logic
        my.enemy1.x += this.enemySpeed * this.enemyDirection;
        if (my.enemy1.x >= this.sys.game.config.width - 100 || my.enemy1.x <= 100) {
            this.enemyDirection *= -1;  // Reverse direction
        }

        my.enemyBullets.children.iterate(function (bullet) {
            if (bullet && bullet.y > this.sys.game.config.height) {
                bullet.destroy(); // Destroy bullets when they go off-screen
            } else if (this.collides(bullet, my.sprite.body)){
                this.myHealth -= 1;
                this.onBulletHitPlayer(bullet, my.sprite.body);
                if (this.myHealth <= 0) {
                    this.scene.start('gameOverScene');
        
                }
            }
            
        }, this);
    }

    // What happens if a player is hit:
    onBulletHitPlayer(bullet, player) {
        let my = this.my;
        bullet.destroy();  // Destroy the bullet
        my.text.health.setText("Health " + this.myHealth);

        // when player is hit they are invulnerable during the duration of the blinking animation:
        player.invulnerable = true;
        this.tweens.add({
            targets: player,
            alpha: { from: 0.5, to: 1 },
            ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 100,
            repeat: 5, // Number of times to blink
            yoyo: true, // Smooth transition of properties to/from the values
            onComplete: () => {
                player.invulnerable = false;
                player.alpha = 1; // Make sure player is fully visible after blinking
            }
        });
    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (!a || !b) return false;

        return Math.abs(a.x - b.x) < (a.displayWidth / 2 + b.displayWidth / 2) &&
               Math.abs(a.y - b.y) < (a.displayHeight / 2 + b.displayHeight / 2);
    }

    createExplosion(x, y) {
        let explosion = this.add.sprite(x, y, "explosion").setScale(0.1).setAlpha(1);
        this.tweens.add({
            targets: explosion,
            scale: { from: 0.1, to: 1 },
            alpha: { from: 1, to: 0 },
            angle: 360,
            duration: 500,
            ease: "Cubic.easeOut",
            onComplete: () => {
                explosion.destroy();
            }
        });
    }

    updateScore(){
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
    }

    resetGame() {
        // Reset game state when restarting the scene
        this.initGameState();
        this.scene.restart(); // This will re-trigger create()
    }

}
