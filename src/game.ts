import "phaser";
import scenes from "./scenes/scenes";
import {Constants} from './constants';

const config: Phaser.Types.Core.GameConfig = {
    title: "Uniball Redux",
    version: "1.0.0.0",
    type: Phaser.AUTO,
    backgroundColor: "#203f3e",
    width: 800,
    height: 400,
    physics: {
        default: "arcade",
        arcade: {
            useTree: true,
            gravity: { y: 300 },
            debug: false,
        },
    },
    disableContextMenu: false,
    render: {
        pixelArt: true,
    },
    scene: scenes,
};

const resize: () => void = (): void => {
    const canvas: HTMLCanvasElement = document.querySelector("canvas");
    const windowWidth: number = window.innerWidth;
    const windowHeight: number = window.innerHeight;
    const windowRatio: number = windowWidth / windowHeight;
    const gameRatio: number = 16/9;

    if (windowRatio < gameRatio) {
        canvas.style.width = `${windowWidth}px`;
        canvas.style.height = `${windowWidth / gameRatio}px`;
    } else {
        canvas.style.width = `${windowHeight * gameRatio}px`;
        canvas.style.height = `${windowHeight}px`;
    }
};

window.onload = (): void => {
    const game: Phaser.Game = new Phaser.Game(config);
    resize();
    window.addEventListener("resize", resize, false);
};
