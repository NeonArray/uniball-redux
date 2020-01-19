import 'phaser';
import { Constants } from '../constants';
import { OrbColor, Registry } from '../types';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private currentScene: Phaser.Scene;
    private inputKeys: Map<string, Phaser.Input.Keyboard.Key> = new Map();
    private isMoving: boolean = false;
    private isFalling: boolean = false;
    private lastTime: number;
    private staminaDelayTime: number;
    private stamina: integer = 4;
    private staminaMax: integer = 4;
    
    constructor(params) {
        super(params.scene, params.x, params.y, params.key, params.frame);

        this.currentScene = params.scene;
        this.initSprite();
        this.currentScene.add.existing(this);
    }

    hit(): void {
        const color = this.currentScene.registry.get('currentOrbColor');

        this.anims.play(`hit_${color}`, true);
    }

    update(): void {
        const color = this.currentScene.registry.get('currentOrbColor');

        if (this.inputKeys.get('LEFT').isDown) {
            this.setFlipX(true);
            this.setVelocityX(Constants.P_MOVE_SPEED * -1);

            if (this.body.touching.down) {
                this.anims.play(`run_${color}`, true);
                this.isMoving = true;

                this.createRunningParticles();
            }
        } else if (this.inputKeys.get('RIGHT').isDown) {
            this.setFlipX(false);
            this.setVelocityX(Constants.P_MOVE_SPEED);

            if (this.body.touching.down) {
                this.anims.play(`run_${color}`, true);
                this.isMoving = true;

                this.createRunningParticles();
            }
        } else {
            this.isMoving = false;
            this.setVelocityX(0);
        }

        if (
            Phaser.Input.Keyboard.JustDown(this.inputKeys.get('UP'))
            && this.stamina > 0
        ) {
            this.anims.play(`jump_${color}`, true);
            this.createJumpingParticle();
            this.setVelocityY(Constants.P_JUMP_HEIGHT * -1);
            this.isMoving = true;
            this.reduceStamina();
        } else if (
            !this.body.touching.down
            && Phaser.Input.Keyboard.JustDown(this.inputKeys.get('DOWN'))
        ) {
            this.anims.play(`fall_${color}`);
            this.setVelocityY(Constants.P_SPIKE_SPEED);
            this.isMoving = true;
        if (this.isFalling && this.body.touching.down) {
            this.createFallingParticles();
            this.isFalling = false;
        }

        if (this.body.touching.down) {
            this.regenerateStamina(time);
        }

        if (!this.isMoving) {
            this.anims.play(`idle_${color}`, true);
        }
    }

    private initSprite(): void {
        this.currentScene.physics.world.enable(this);
        this.registerAnimations();
        this.registerControls();

        this.body.setSize(32, 47);
        this.setCollideWorldBounds(true);
    }

    private addKey(key: string): Phaser.Input.Keyboard.Key {
        return this.currentScene.input.keyboard.addKey(key);
    }

    private registerAnimations(): void {
        for (let orbColorKey in OrbColor) {

            if (!OrbColor.hasOwnProperty(orbColorKey) || orbColorKey === OrbColor.wild) {
                continue;
            }

            this.currentScene.anims.create({
                key: `idle_${orbColorKey}`,
                frames: this.currentScene.anims.generateFrameNames(`s_bombguy_${orbColorKey}`, {
                    start: 1, end: 26,
                    prefix: 'Idle/', suffix: '.png'
                }),
                frameRate: 15,
                repeat: -1,
            });
            this.currentScene.anims.create({
                key: `run_${orbColorKey}`,
                frames: this.currentScene.anims.generateFrameNames(`s_bombguy_${orbColorKey}`, {
                    start: 1, end: 14,
                    prefix: 'Run/', suffix: '.png'
                }),
                frameRate: 20,
                repeat: -1,
            });
            this.currentScene.anims.create({
                key: `jump_${orbColorKey}`,
                frames: this.currentScene.anims.generateFrameNames(`s_bombguy_${orbColorKey}`, {
                    start: 1, end: 4,
                    prefix: 'Jump/', suffix: '.png'
                }),
                frameRate: 8,
                repeat: 0,
            });
            this.currentScene.anims.create({
                key: `fall_${orbColorKey}`,
                frames: this.currentScene.anims.generateFrameNames(`s_bombguy_${orbColorKey}`, {
                    start: 1, end: 2,
                    prefix: 'Fall/', suffix: '.png'
                }),
                frameRate: 1,
                repeat: 0,
            });
            this.currentScene.anims.create({
                key: `hit_${orbColorKey}`,
                frames: this.currentScene.anims.generateFrameNames(`s_bombguy_${orbColorKey}`, {
                    start: 1, end: 8,
                    prefix: 'Hit/', suffix: '.png'
                }),
                frameRate: 16,
                repeat: 0,
            });
        }

        this.currentScene.anims.create({
            key: `p_run`,
            frames: this.currentScene.anims.generateFrameNames(`s_objects`, {
                start: 1, end: 6,
                prefix: 'RunParticles/', suffix: '.png'
            }),
            frameRate: 12,
            repeat: 0,
        });
        this.currentScene.anims.create({
            key: `p_jump`,
            frames: this.currentScene.anims.generateFrameNames(`s_objects`, {
                start: 0, end: 5,
                prefix: 'JumpParticles/', suffix: '.png'
            }),
            frameRate: 12,
            repeat: 0,
        });
        this.currentScene.anims.create({
            key: `p_fall`,
            frames: this.currentScene.anims.generateFrameNames(`s_objects`, {
                start: 0, end: 6,
                prefix: 'FallParticles/', suffix: '.png'
            }),
            frameRate: 12,
            repeat: 0,
        });
    }

    /**
     *
     */
    private reduceStamina(): void {
        this.stamina = Phaser.Math.Clamp(this.stamina - 1, 0, this.staminaMax);
        this.currentScene.events.emit('regenerateStamina', this.stamina);
    }

    private regenerateStamina(time: number): void {
        const delay = 1000;

        return ((time: number) => {

            if (this.stamina === this.staminaMax) {
                return;
            }

            if (time < this.staminaDelayTime + delay) {
                return;
            }

            this.staminaDelayTime = time;

            this.stamina += 1;

            this.currentScene.events.emit('regenerateStamina', this.stamina);
        })(time);
    }

    private createRunningParticles(time: number): void {
        const delay = 250;

        return ((time: number) => {

            if (time < this.lastTime + delay) {
                return;
            }

            this.lastTime = time;

            this.currentScene.add
                .sprite(this.x, this.y + 25, 's_objects', 'RunParticles/1.png')
                .play('p_run')
                .on('animationcomplete', function () {
                    this.destroy();
                });
        })(time);
    }

    private createJumpingParticle(): void {
        this.currentScene.add
            .sprite(
                this.x,
                this.y + 17,
                's_objects',
                'JumpParticles/1.png'
            )
            .play('p_jump')
            .on('animationcomplete', function () {
                this.destroy()
            });
    }

    private createFallingParticles(): void {
        this.createJumpingParticle();
        this.currentScene.add
            .sprite(
                this.x,
                this.y + 17,
                's_objects',
                'FallParticles/1.png'
            )
            .play('p_fall')
            .on('animationcomplete', function () {
                this.destroy()
            });
    }

    private registerControls(): void {
        this.inputKeys = new Map([
            ["LEFT", this.addKey("A")],
            ["RIGHT", this.addKey("D")],
            ["DOWN", this.addKey("S")],
            ["UP", this.addKey("W")]
        ]);
    }
}