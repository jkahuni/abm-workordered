export interface IntResetPassword {
    email: string;
}

export interface IntFirebaseAuthUser {
    email: string;
    password: string;
}

export interface IntFirestoreUser {
    uid: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    phoneNumberVerified: boolean;
    group: string;
    technicianGroup: string;
    supervisorGroup: string;
    managerGroup: string;
    canEditWorkorder: boolean;
    canDeleteWorkorder: boolean;
    isAdmin: boolean;
    isSuperUser: boolean;
}

export interface IntUser {
    fullName: string;
    uid: string;
    group: string;
    technicianGroup: string;
    supervisorGroup: string;
    managerGroup?: string;
}


