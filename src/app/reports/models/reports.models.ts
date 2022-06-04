export interface IntSwitchChart {
    type: string;
    section: string;
    month?: string;
    year?: number;
}

export interface IntNameAndFormattedName {
    name: string;
    formattedName: string;
}

export interface IntDateIndices {
    monthIndex: number;
    yearIndex: number;
}
