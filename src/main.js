let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: false,
        antialias: true
    },
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },  // No gravity in any direction
            debug: false  // Set to true to see physics debugging (collision boxes, etc.)
        }
    },
    scene: [StartScreen, LevelOne, LevelTwo, GameOver, GameWon],
    fps: { forceSetTimeOut: true, target: 60 }
}

const game = new Phaser.Game(config);
