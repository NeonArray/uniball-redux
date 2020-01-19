import 'phaser';

export default class Debug extends Phaser.Scene {
    private keys;

    constructor() {
        super({
            key: 'Debug',
            active: true,
        });
    }

    create(): void {
        const gameScene = this.scene.get('MainScene');
        const fontStyle = {
            font: '12px Arial',
            fill: '#fff',
        };

        const colorInfo = this.add.text(10, 10, 'Active Color: red', fontStyle);
        gameScene.events.on('changeActiveColor', (color) => {
            colorInfo.setText(`Active Color: ${color}`);
        }, this);

        const scoreInfo = this.add.text(10, 24, 'Score: 0', fontStyle);
        gameScene.events.on('scoreIncrease', (score) => {
            scoreInfo.setText(`Score: ${score}`);
        }, this);

        const staminaInfo = this.add.text(10, 38, 'Stamina: 0', fontStyle);
        gameScene.events.on('regenerateStamina', (amount) => {
           staminaInfo.setText(`Stamina: ${amount}`);
        }, this);
        // this.keys.add('B', this.input.keyboard.addKey('B'));
    }

    update(): void {
        // if (Phaser.Input.Keyboard.JustDown(this.keys.get('B'))) {
        //
        // }
    }
}