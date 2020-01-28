import 'phaser';
import Player from '../components/player';
import {OrbColor, Registry} from '../types';
import Orb from '../components/orb';

const rnd = (low, high) => Phaser.Math.RND.integerInRange(low, high);

export default class MainScene extends Phaser.Scene {
    private player: Player;
    private currentColor: OrbColor = OrbColor.red;
    private groups;

    constructor() {
        super('MainScene');
    }

    preload(): void {
        this.registry.set('currentOrbColor', OrbColor.red);

        this.load.image('grass', 'env/grass.png');

        this.load.multiatlas('s_orbs', 'objects/orbs.json', 'objects');
        this.load.multiatlas('s_objects', 'objects/objects.json', 'objects');
        this.load.multiatlas('s_explode', 'effects/explode.json', 'effects');

        for (const orbColorKey in OrbColor) {

            if (!OrbColor.hasOwnProperty(orbColorKey) || orbColorKey === OrbColor.wild) {
                continue;
            }

            // this.load.multiatlas(
            //     `s_bombguy_${OrbColor[orbColorKey]}`,
            //     `player/bombguy-${OrbColor[orbColorKey]}.json`,
            //     'player'
            // );

            this.load.multiatlas(
                `s_peggie_${OrbColor[orbColorKey]}`,
                `player/peggie-${OrbColor[orbColorKey]}.json`,
                'player'
            );
        }
    }

    create(): void {
        this.groups = {
            platforms: this.physics.add.staticGroup(),
            fx: this.add.group(),
        };

        ///// ============== PLAYER =================
        this.player = new Player({
            scene: this,
            x: 300,
            y: 200,
            key: `s_peggie_${this.currentColor}`,
            frame: 'Idle/1.png',
        });

        ///// ============== PLATFORMS =================
        const ground = this.add.tileSprite(0, this.game.canvas.height - 16, this.game.canvas.width * 2, 32, 'grass');
        this.groups.platforms.add(ground);

        ///// ============== ORBS =================

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNames('s_explode', {
                start: 0, end: 7,
                prefix: 'explosion-2-',
                suffix: '.png',
            }),
            frameRate: 22,
            repeat: 0,
        });

        const orbGroupConfig = {
            bounceY: 1,
            bounceX: 1,
            collideWorldBounds: true,
            allowGravity: false,
            velocityX: rnd(20, 200),
            velocityY: rnd(20, 200),
        };

        this.groups.orbs = {
            red: this.physics.add.group(orbGroupConfig),
            blue: this.physics.add.group(orbGroupConfig),
            green: this.physics.add.group(orbGroupConfig),
            purple: this.physics.add.group(orbGroupConfig),
            wild: this.physics.add.group(orbGroupConfig),
        };

        const colorArray = Object.keys(OrbColor);

        colorArray.forEach((orbColorsKey: string, i: integer) => {
            const _orb = new Orb({
                scene: this,
                x: rnd(50, this.game.canvas.width - 20),
                y: rnd(50, this.game.canvas.height - 100),
                key: 's_orbs',
                frame: `orbs-${i}.png`,
                color: orbColorsKey,
            });

            this.groups.orbs[orbColorsKey].add(_orb);
        });

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
    }

    update(time: number): void {
        this.player.update(time);
        this.groups.orbs.red.getChildren().forEach((orb) => orb.update());
        this.groups.orbs.green.getChildren().forEach((orb) => orb.update());
        this.groups.orbs.blue.getChildren().forEach((orb) => orb.update());
        this.groups.orbs.purple.getChildren().forEach((orb) => orb.update());
        this.groups.orbs.wild.getChildren().forEach((orb) => orb.update());
    }

    private onWildOrbCollisionWithPlayer(player: Player, orb: Orb): void {
        // I subtract one from the index because the frames generated for the animation don't seem to be zeroth based.
        const index = orb.anims.currentFrame.index - 1;
        const colors = ['red', 'green', 'purple', 'blue'];

        this.currentColor = OrbColor[colors[index]];
        this.registry.set(Registry.CurrentColor, this.currentColor);

        orb.destroy();

        player.setTexture(`s_peggie_${this.currentColor}`);

        this.createNextWildOrb();

        this.events.emit('changeActiveColor', this.currentColor);
    private multiplyAnOrb(orb: Orb): void {
        if (this.groups.orbs[orb.color].children.entries.length > 150) {
            return;
        }

        const key = Object.keys(OrbColor);

        const _orb = new Orb({
            scene: this,
            x: Phaser.Math.Between(50, this.game.canvas.width - 20),
            y: Phaser.Math.Between(50, this.game.canvas.height - 100),
            key: Constants.SHEET_KEY,
            frame: `Uniball-Redux/Objects/Orbs/${key.indexOf(orb.color)}.png`,
            color: orb.color,
        });
        const _orb2 = new Orb({
            scene: this,
            x: Phaser.Math.Between(50, this.game.canvas.width - 20),
            y: Phaser.Math.Between(50, this.game.canvas.height - 100),
            key: Constants.SHEET_KEY,
            frame: `Uniball-Redux/Objects/Orbs/${key.indexOf(orb.color)}.png`,
            color: orb.color,
        });

        this.groups.orbs[orb.color].add(_orb);
        this.groups.orbs[orb.color].add(_orb2);
    }

    private onOrbCollisionWithPlayer(player: Player, orb: Orb): void {
        if (this.currentColor === orb.color) {
            const score = this.registry.get(Registry.Score) + 1;
            this.registry.set(Registry.Score, score);
            this.events.emit('scoreIncrease', score);
        } else {

            this.tweens.addCounter({
                from: 0,
                to: 100,
                duration: 1500,
                onUpdate: () => {
                    player.setTintFill(0xffffff);
                    this.time.delayedCall(250, () => {
                        player.clearTint();
                    });
                }
            });

            this.add
                .sprite(
                    orb.x,
                    orb.y,
                    's_explode',
                    'explosion-2-0.png'
                )
                .play('explode')
                .on('animationcomplete', function () {
                    this.destroy();
                });
            player.hit();
            this.events.emit('playerHit');
        }

        orb.destroy();
    }

    private createNextWildOrb(): void {
        if (this.groups.orbs.wild.countActive() > 1) {
            return;
        }

        const secondsToWait = rnd(1, 5) * 1000;

        this.time.delayedCall(secondsToWait, () => {
            const orb = new Orb({
                scene: this,
                x: rnd(50, 300),
                y: rnd(50, 300),
                key: 's_orbs',
                frame: `orbs-1.png`,
                color: OrbColor.wild,
            });
            this.groups.orbs.wild.add(orb);
            orb.anims.play('cycleColors');
        }, [], this);
    }
}
