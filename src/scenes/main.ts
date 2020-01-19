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
        ///// ============== COLLIDERS =================
        this.physics.add.collider([
            this.player,
            this.groups.orbs.red,
            this.groups.orbs.blue,
            this.groups.orbs.green,
            this.groups.orbs.purple,
            this.groups.orbs.wild,
        ], this.groups.platforms);

        this.physics.add.collider([
            this.groups.orbs.red,
            this.groups.orbs.blue,
            this.groups.orbs.green,
            this.groups.orbs.purple,
            this.groups.orbs.wild,
        ], [
            this.groups.orbs.red,
            this.groups.orbs.blue,
            this.groups.orbs.green,
            this.groups.orbs.purple,
            this.groups.orbs.wild,
        ]);

        this.physics.add.collider(
            this.player,
            [
                this.groups.orbs.red,
                this.groups.orbs.blue,
                this.groups.orbs.green,
                this.groups.orbs.purple
            ],
            this.onOrbCollisionWithPlayer,
            () => {},
            this,
        );

        this.physics.add.collider(
            this.player,
            [
                this.groups.orbs.red,
                this.groups.orbs.blue,
                this.groups.orbs.green,
                this.groups.orbs.purple
            ],
            this.onWildOrbCollisionWithPlayer,
            () => {},
            this,
        );

        this.physics.add.collider(
            this.player,
            this.groups.orbs.wild,
            this.onWildOrbCollisionWithPlayer,
            () => {},
            this,
        );

    private onWildOrbCollisionWithPlayer(player: Player, orb: Orb): void {
        // I subtract one from the index because the frames generated for the animation don't seem to be zeroth based.
        const index = orb.anims.currentFrame.index - 1;
        const colors = ['red', 'green', 'purple', 'blue'];

        this.currentColor = OrbColor[colors[index]];
        this.registry.set(Registry.CurrentColor, this.currentColor);

        orb.destroy();

        player.setTexture(`s_bombguy_${this.currentColor}`);

        this.createNextWildOrb();

        this.events.emit('changeActiveColor', this.currentColor);
    }
        }

        this.physics.add.collider(this.player, this.groups.platforms);
    }

    update(): void {
        this.player.update();
    }
}
