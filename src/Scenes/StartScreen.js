class StartScreen extends Phaser.Scene{
    constructor() {
        super({ key: 'startScreenScene' });
    }

    preload(){
        this.load.setPath("./assets/");
        this.load.image("background", "background.png");
    }
    create() {
        let my = this.my;

        // Set background image:
        let bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;

        let title = this.add.text(400, 300, 'Revolution Cows', { fontSize: '48px', fill: '#fff' })
            .setOrigin(0.5);

        let play = this.add.text(400, 400, 'Play', { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        play.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start("levelOneScene");
        });

        this.tweens.add({
            targets: [title, play],
            scaleX: 1.2,
            scaleY: 1.2,
            ease: 'Sine.easeInOut', // Specifies a smooth sinusoidal easing
            duration: 1000, // Duration of one way scaling
            yoyo: true, // Apply the tween back to the original state
            repeat: -1 // Repeat infinitely
        });
    }

}