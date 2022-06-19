export interface IntSection {
    uid: string;
    id: string | number;
    name: string;
}

export interface IntExpandedSection {
    id: string | number;
    name: string;
    nameLowercase: string;
}

export interface IntMachine {
    uid: string;
    id: string | number;
    name: string;
    section: string | number;
}

export interface IntExpandedMachine {
    id: string | number;
    name: string;
    nameLowercase: string;
    section: string | number;
}

export interface IntSpare {
    uid: string;
    code: string;
    name: string;
    unitCost: string;
    id: string | number;
    searchParams: string[];
}

export interface IntExpandedSpare {
    id: string | number;
    code: string;
    codeLowercase: string;
    name: string;
    nameLowercase: string;
    searchParams: string[];
    unitCost: string;
}
