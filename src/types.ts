
export enum OrbColor {
    green = "green",
    red = "red",
    purple = "purple",
    blue = "blue",
    wild = "wild",
}

export enum Registry {
    CurrentColor = "currentOrbColor",
    Score = "score",
}

export enum EventNames {
    ColorChange = "colorChange",
    PlayerHit = "playerHit",
    RegeneratingStamina = "regeneratingStamina",
    StaminaMaxed = "staminaMaxed",
    ReduceHealth = "reduceHealth",
    IncreaseHealth = "increaseHealth",
    ScoreIncrease = "scoreIncrease",
}

export interface IConstructorParams {
    scene?: Phaser.Scene;
    x?: integer;
    y?: integer;
    params?: any;
}
