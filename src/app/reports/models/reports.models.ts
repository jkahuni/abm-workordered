export interface IntSwitchChart {
    type: string;
    section: string;
    month?: string;
    year?: number;
    week?: string;
    weeks?: string[];
}

export interface IntNameAndFormattedName {
    name: string;
    formattedName: string;
}

export interface IntDateIndices {
    monthIndex: number;
    yearIndex: number;
}

export interface IntDateRangeLimits {
    firstDate: IntDateIndices;
    lastDate: IntDateIndices;
    limitsUpdated: boolean;
}
