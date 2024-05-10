class GameWon extends Phaser.Scene {
    constructor() {
        super({ key: 'gameWonScene' });
    }

    preload(){
        this.load.setPath("./assets/");
        this.load.image("gamewonBG", "cowsChillin.png");
    }

    create() {
        let bg = this.add.image(0, 0, 'gamewonBG').setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;

        let youWon = this.add.text(400, 300, 'YOU WON', { fontSize: '48px', fill: '#fff' })
            .setOrigin(0.5);

        this.add.text(400, 200, 'Score ' + this.scene.get("levelTwoScene").myScore, { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5);

        this.add.text(400, 450, '   You have successfully warded off the alien enemies.\nYou and your cow comrades will live to chew another day!', { fontSize: '22px', fill: '#fff' })
            .setOrigin(0.5);

        let playAgain = this.add.text(400, 500, 'Play Again', { fontSize: '32px', fill: '#0f0' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        playAgain.on('pointerdown', () => {
            this.scene.stop();
            this.scene.get("levelOneScene").resetGame();
        });

        this.tweens.add({
            targets: [playAgain, youWon],
            scaleX: 1.2,
            scaleY: 1.2,
            ease: 'Sine.easeInOut', // Specifies a smooth sinusoidal easing
            duration: 1000, // Duration of one way scaling
            yoyo: true, // Apply the tween back to the original state
            repeat: -1 // Repeat infinitely
        });
    }
}
