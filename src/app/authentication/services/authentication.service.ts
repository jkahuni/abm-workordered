import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  User,
  UserCredential,
  ActionCodeSettings
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc
} from '@angular/fire/firestore';
import {
  IntFirebaseAuthUser, IntFirestoreUser
} from '@authentication/models/authentication.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
  ) { }

  currentUser$: Observable<User | null> = authState(this.auth);


  async signIn(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    return await this.auth.signOut();
  }

  async signUp(signUpUserData: IntFirebaseAuthUser): Promise<User> {
    const userObject = await createUserWithEmailAndPassword(
      this.auth, signUpUserData.email, signUpUserData.password
    );

    // UserCredential.user = User
    return userObject.user;

  }

  // set user profile on firestore
  // update display name
  // send verification email
  async additionalUserConfiguration(
    user: User,
    lastName: string,
    userData: IntFirestoreUser): Promise<[void, void, void]> {
    // for returning user back to app
    const actionCodeSettings: ActionCodeSettings = {
      url: `https://abm-workordered.web.app/?email=${user.email}`
    };

    // for persisting the user to firestore
    const userDocRef = doc(this.firestore, `users/${userData.uid}`);

    // update user display name
    const updateDisplayName = updateProfile(user, {
      displayName: lastName
    });

    // persist user to firestore
    const persistUserToFirestore = setDoc(userDocRef, userData);

    // verify email
    // with action code
    const sendVerificationEmail = sendEmailVerification(user, actionCodeSettings);

    // without action code
    // const sendVerificationEmail = sendEmailVerification(user);

    return await Promise.all([
      updateDisplayName,
      persistUserToFirestore,
      sendVerificationEmail
    ]);
  }

  async resetPassword(email: string): Promise<void> {
    const actionCodeSettings: ActionCodeSettings = {
      url: `https://abm-workordered.web.app/?email=${email}`
    };
    // with action code
    return await sendPasswordResetEmail(this.auth, email, actionCodeSettings);

    // without acion code
    // return await sendPasswordResetEmail(this.auth, email);


  }

  // for resending verification code from the home page
  async sendVerificationEmail(user: User): Promise<void> {
    const actionCodeSettings: ActionCodeSettings = {
      url: `https://abm-workordered.web.app/?email=${user.email}`
    };
    return await sendEmailVerification(user, actionCodeSettings);
  }
}
