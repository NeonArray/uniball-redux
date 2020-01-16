import 'phaser';
import Player from '../components/player';
import { OrbColor } from '../types';

export default class MainScene extends Phaser.Scene {
    private player: Player;
    private currentColor: OrbColor = OrbColor.Red;
    private groups;

    constructor() {
        super('main');
    }

    preload(): void {
        this.registry.set('currentOrbColor', OrbColor.Red);

        this.load.image('grass', 'env/grass.png');

        for (let orbColorKey in OrbColor) {
            this.load.multiatlas(
                `s_bombguy_${OrbColor[orbColorKey]}`,
                `player/bombguy-${OrbColor[orbColorKey]}.json`,
                'player'
            );
        }
    }

    create(): void {
        this.groups = {
            platforms: this.physics.add.staticGroup(),
        };

        this.player = new Player({
            scene: this,
            x: 300,
            y: 200,
            key: `s_bombguy_${this.currentColor}`,
            frame: 'Idle/1.png',
        });

        for (let step = 16; step < 800; step += 32) {
            this.groups.platforms.create(step, 390, 'grass').refreshBody();
        }

        this.physics.add.collider(this.player, this.groups.platforms);
    }

    update(): void {
        this.player.update();
    }
}
