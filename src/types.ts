
export enum OrbColor {
    Red = 'red',
    Blue = 'blue',
    Green = 'green',
    Purple = 'purple',
}

export interface Component {
    preload: Function;
    create: Function;
    update: Function;
}
