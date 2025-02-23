export enum Words {
    ONE = 1,
    TWO = 2,
    THREE = 3
}

export enum Positions {
    ONE = 'First',
    TWO = 'Second',
    THREE = 'Third'
}

export const numberToPositon = (number: number): string => {
    return Positions[Words[number]].toLowerCase();
};

export const numberToWord = (number: number): string => {
    return Words[number].toLowerCase();
};
