export interface IntSection {
    id: number;
    name: string;
    nameLowercase?: string;
}

export interface IntMachine {
    id: number;
    name: string;
    nameLowercase?: string;
    section: number;

}

export interface IntUser {
    fullName: string;
    uid: string;
    group: string;
    technicianGroup: string;
    supervisorGroup: string;
    managerGroup?: string;
}

export interface IntAbnormalityCard {
    status: boolean;
    amStep: number;
}

export interface IntStatusAndTime {
    status: boolean;
    dateTime: string;
    reason?: string;
}

export interface IntMoldService {
    number: string;
    partsServiced: string;
}

export interface IntWorkorderRaisedDateTime {
    dateTime: string;
}

export interface IntToolChange {
    from: string;
    to: string;
}

export interface IntWorkorderSummary {
    number: string;
    uid: string;
    type: string;
    description: string;
}

export interface IntTimeTakenByWorkorder {
    fromTimeRaised: string;
    fromTimeApproved: string;
    fromTimeAcknowledged: string;
    fromTimeMachineStopped: string;
}

export interface IntSparesUsed {
    status: boolean;
    spares: IntSpareWithQuantities[] | [];
    totalCost: string;
}

export interface IntWorkorder {
    abnormalityCard: IntAbnormalityCard;
    acknowledged: IntStatusAndTime;
    approved: IntStatusAndTime;
    breakdown: IntStatusAndTime;
    closed: IntStatusAndTime;
    done: IntStatusAndTime;
    moldService: IntMoldService;
    machine: IntMachine;
    raised: IntWorkorderRaisedDateTime;
    raiser: IntUser;
    rejected: IntStatusAndTime;
    section: IntSection;
    sparesUsed: IntSparesUsed;
    storesTechnician: IntUser;
    supervisor: IntUser;
    technician: IntUser;
    timeTaken: IntTimeTakenByWorkorder;
    toolChange: IntToolChange;
    workorder: IntWorkorderSummary;
    review: IntWorkorderReview;

}

export interface IntSpare {
    id?: number;
    code: string;
    codeLowercase?: string;
    machine?: string;
    machineLowercase?: string;
    name: string;
    nameLowercase?: string;
    unitCost: string;
    searchParams?: any;
}

export interface IntSpareWithQuantities {
    code: string;
    name: string;
    unitCost: string;
    quantity: number | string;
    totalCost: number | string;
}

export interface IntCloseWorkorderData {
    closed: IntStatusAndTime;
    correctiveActions: string;
    maintenanceActions: string;
    machineSubAssembly: string;
    rootCause: string;
    moldPartsServiced: string;
}

export interface IntWorkorderReview {
    status: string;
    dateTime: string;
    concern: IntConcern | {};
}

export interface IntConcern {
    user: IntUser;
    message: string;
}
