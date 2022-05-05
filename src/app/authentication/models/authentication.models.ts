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
    role: string;
    technicianRole: string;
    canEditWorkorder: boolean;
    canDeleteWorkorder: boolean;
    isAdmin: boolean;
    isSuperUser: boolean;
}
