
export enum OrbColor {
    red = 'red',
    green = 'green',
    purple = 'purple',
    blue = 'blue',
    wild = 'wild',
}

export enum Registry {
    CurrentColor = 'currentOrbColor',
    Score = 'score',
}

export enum EventNames {
    ColorChange = 'colorChange',
    PlayerHit = 'playerHit',
    RegeneratingStamina = 'regeneratingStamina',
    StaminaMaxed = 'staminaMaxed',
    ReduceHealth = 'reduceHealth',
    IncreaseHealth = 'increaseHealth',
    ScoreIncrease = 'scoreIncrease',
}