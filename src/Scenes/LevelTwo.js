class LevelTwo extends Phaser.Scene {
    constructor() {
        super({ key: 'levelTwoScene' });

        this.initGameState();
        this.path = new Phaser.Curves.Path();
    }

    initGameState() {
        this.my = { sprite: {}, bullets: [], enemyBullets: [], text: {} };
        this.bodyX = 400;
        this.bodyY = 515;
        this.enemySpeed = 3;  // Slightly faster than Level One
        this.enemyDirection = 1;
        this.myScore = 25;
        this.myHealth = 3;
        // wave info:
        this.activeEnemies = 0;
        this.waveIndex = 0;
        this.waves = [
            [{ x: 100, y: 50 }, { x: 100, y: 50 }, { x: 100, y: 50 }, { x: 100, y: 50 }, { x: 100, y: 50 }],
            [{ x: 100, y: 50 }, { x: 100, y: 50 }, { x: 100, y: 50 }],
            [{ x: 100, y: 50 }, { x: 100, y: 50 }, { x: 100, y: 50 }],
            // More waves can be defined here
        ];
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("background", "background.png");
        this.load.image("cowMain", "cow.png");
        this.load.image("bullet", "grass_shoot.png");
        this.load.image("enemy1", "shipGreen_manned.png");
        this.load.image("enemy2", "shipBlue_manned.png");
        //explosion:
        this.load.image("explosion", "laserYellow_burst.png");
        //enemy bullet:
        this.load.image("enemyFire", "laserYellow3.png");

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {
        this.enemies = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();
        this.spawnNextWave('enemy1');
    
        //this.spawnNextWave('enemy2');

        
        let my = this.my;
        let bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;

        // let positions = [
        //     { x: 100, y: 50 },
        //     { x: 200, y: 100 },
        //     { x: 300, y: 50 },
        //     { x: 400, y: 100 },
        //     { x: 500, y: 50 }
        // ];
    
        // positions.forEach((pos, index) => {
        //     this.time.delayedCall(1000 * index, () => {
        //         this.spawnEnemy(pos.x, pos.y);
        //     }, [], this);
        // });

    
        my.sprite.body = this.physics.add.sprite(this.bodyX, this.bodyY, "cowMain").setScale(0.7);
        my.sprite.body.setCollideWorldBounds(true);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
        my.text.score = this.add.bitmapText(580, 570, "rocketSquare", "Score " + this.myScore);
        my.text.health = this.add.bitmapText(10, 570, "rocketSquare", "Health " + this.myHealth);
        document.getElementById('description').innerHTML = '<h2>A - left <br>D - right <br>SPACE - shoot </h2>';
    
        this.time.addEvent({
            delay: 1200,
            callback: this.enemyFire,
            callbackScope: this,
            loop: true
        });

        this.physics.add.overlap(this.my.enemyBullets, this.my.sprite.body, this.onBulletHitPlayer, null, this);
    }

    update() {
        let my = this.my;
        
        // Handle player movement
        if (this.aKey.isDown) {
            my.sprite.body.x -= 5;
            if (my.sprite.body.x <= 40) my.sprite.body.x = 40;
        }
        if (this.dKey.isDown) {
            my.sprite.body.x += 5;
            if (my.sprite.body.x >= 760) my.sprite.body.x = 760;
        }
    
        // Handle firing bullets
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            let bullet = this.physics.add.sprite(my.sprite.body.x, my.sprite.body.y - 55, "bullet");
            bullet.setVelocityY(-300);
            my.bullets.push(bullet);
        }
    
        // Safely iterate over each enemy
        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.active) { // Check if the enemy exists and is active before accessing
                enemy.pathT = (enemy.pathT + enemy.pathSpeed) % 1;
                let point = enemy.path.getPoint(enemy.pathT);
                enemy.x = point.x;
                enemy.y = point.y;
    
                // Handle collision with bullets
                this.physics.world.overlap(my.bullets, enemy, (bullet, e) => {
                    this.myScore += enemy.scorePoints;
                    this.createExplosion(e.x, e.y);
                    bullet.destroy();
                    e.destroy(); // Safely destroy the enemy
                    this.updateScore();
                }, null, this);
            }
        });
    
        this.enemyBullets.children.iterate(bullet => {
            if (bullet) { // Check if bullet exists before overlap check
                this.physics.world.overlap(bullet, this.my.sprite.body, (b, player) => {
                    if (player) { // Check if player exists
                        this.onBulletHitPlayer(b, player);
                    }
                }, null, this);
            }
        });

    }
    
    
    onBulletHitPlayer(bullet, player) {
        //console.log('Collision detected');
        let my = this.my;
        bullet.destroy();  // Destroy the bullet
        this.myHealth -=1;
        my.text.health.setText("Health " + this.myHealth);
        if (this.myHealth <= 0) {
            //this.scene.start('gameOverScene');
            this.scene.start('gameOverScene');
        }

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
    

    spawnEnemy(x, y, sprite) {
        let enemy = this.physics.add.sprite(x, y, sprite);
        enemy.setOrigin(0.5, 0.5);
        console.log(`Enemy spawned at x: ${x}, y: ${y}`);
        enemy.setScale(0.8);
        enemy.setDepth(10);
        enemy.active = true;
        
        
        this.enemies.add(enemy);
    
        // Assign path based on the sprite
        if (sprite === 'enemy1') {
            // A simple back and forth movement across the top
            enemy.path = new Phaser.Curves.Path(x, 50);  // Start at the given x, y=50
            enemy.path.lineTo(this.sys.game.config.width - x, 50); // Move to the right edge of the screen
            enemy.path.lineTo(x, 50); // Return to the start
            enemy.pathSpeed = 0.0025; // Slower for back and forth movement
            enemy.scorePoints = 25;
        } else {
            // A more complex elliptical path
            enemy.path = new Phaser.Curves.Path(x, y);
            enemy.path.moveTo(x, y);
            enemy.path.add(new Phaser.Curves.Ellipse(400, 100, 250, 50, 0, 180));
            enemy.path.add(new Phaser.Curves.Ellipse(400, 100, 250, 50, 180, 360));
            enemy.pathSpeed = 0.0038; // A bit faster for elliptical movement
            enemy.scorePoints = 30;
        }
        
        enemy.pathT = 0;
        
        enemy.fireTimer = this.time.addEvent({
            delay: Phaser.Math.Between(1000, 3000), // Random firing delay
            callback: () => this.enemyFire(enemy, enemy.active),
            loop: true
        });
    
        this.activeEnemies++;
        //console.log(this.activeEnemies);
    
        enemy.on('destroy', () => {
            this.activeEnemies--;
             if (this.activeEnemies === 0) {
                this.spawnNextWave(sprite);  // Pass the sprite type to continue with the same type
             }
        });
    }
    

    spawnNextWave(sprite) {
        if (this.waveIndex < this.waves.length) {
            let positions = this.waves[this.waveIndex++];
            console.log(this.waveIndex);
            positions.forEach((pos, index) => {
                this.time.delayedCall(800 * index, () => {
                    if(this.waveIndex == 1){
                        this.spawnEnemy(pos.x, pos.y, 'enemy1');
                    }
                    if(this.waveIndex == 2){
                        this.spawnEnemy(pos.x, pos.y, 'enemy2');
                    }
                    if(this.waveIndex == 3){
                        this.spawnEnemy(pos.x, pos.y, 'enemy1');
                        this.spawnEnemy(pos.x, pos.y, 'enemy2');
                    }
                }, [], this);
            });
        } else {
            console.log("All waves completed for " + sprite + "!");
            this.waveIndex = 0; // Reset waves index for potential reuse or game loop
            // Optionally switch sprite types or end the game
            this.time.delayedCall(2000, () => {
                this.scene.stop();
                this.scene.start("gameWonScene");  // Assuming you want to restart or reset 'levelTwoScene'
            }, [], this);
        }
    }
    
    

    createEnemyPath(x, y) {
        let path = new Phaser.Curves.Path(x, y);
        // Make sure the path starts where the enemy spawns
        path.moveTo(x, y);
        path.add(new Phaser.Curves.Ellipse(400, 100, 250, 50, 0, 180));
        path.add(new Phaser.Curves.Ellipse(400, 100, 250, 50, 180, 360));
        return path;
    }
    
    
    
    enemyFire(enemy, active) {
        if (active && enemy) {
            let bullet = this.enemyBullets.create(enemy.x, enemy.y + 20, 'enemyFire');
            bullet.setVelocityY(250);  // Set bullet speed
        }
    }


    resetGame() {
        // Reset game state when restarting the scene
        this.initGameState();
        this.scene.restart(); // This will re-trigger create()
    }

}