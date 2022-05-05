import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthenticationService } from '@authentication/services/authentication.service';
import { HotToastService } from '@ngneat/hot-toast';
import { NgxSpinnerService } from 'ngx-spinner';
import { IntFirebaseAuthUser, IntFirestoreUser } from '@authentication/models/authentication.models';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private toast: HotToastService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) { }

  hidePassword = true;
  hideConfirmPassword = true;
  form!: FormGroup;
  groups = ['Operator', 'Technician', 'QA', 'Supervisor', 'Manager',
    'Distribution'];
  technicians = ['Electrical', 'Mechanical', 'Eng. Store', 'PM Planning'];

  ngOnInit(): void {
    this.form = this.createForm();

  }


  createForm = () => {
    return this.fb.group({
      firstName: ['', { validators: [Validators.required] }],
      lastName: ['', { validators: [Validators.required] }],
      email: ['', {
        validators: [Validators.required,
        Validators.email], updateOn: 'blur'
      }],
      phoneNumber: ['', {
        validators: [Validators.required],
        updateOn: 'blur'
      }],
      group: ['', {
        validators: [Validators.required],
        updateOn: 'blur'
      }],
      specificGroup: ['', {
        validators: [Validators.required],
        updateOn: 'blur'
      }],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get technician(): any {
    const group = this.form?.get('group')?.value;
    return group === 'Technician' ? true : false;
  }

  register = () => {
    // check technician properties
    const form = this.form;
    if (!this.form.valid) {
      const technician = form?.get('group')?.value;
      const technicianGroup = form?.get('specificGroup')?.value;
      if (form?.get('specificGroup')?.hasError('required')) {
        if (technician !== 'Technician') {
          form.patchValue({
            specificGroup: 'n/a'
          });
        } else if (technician === 'Technician' && technicianGroup === '') {
          this.toast.error('Technicians must specify their specific group.', {
            duration: 5000, id: 'sign-up-error-1'
          });
        }

      } else {
        this.toast.error(`Error. A required field might be blank or invalid.`,
          { duration: 5000, id: 'sign-up-error-2' });
      }
    } else {
      this.spinner.show('app-sign-up-spinner');

      // deconstructed form data
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        group,
        specificGroup,
        password,
      } = form?.value;

      // for user firestore data
      const firstUserName = firstName.trim().toLocaleLowerCase();
      const lastUserName = lastName.trim().toLocaleLowerCase();
      const fullName = firstUserName + ' ' + lastUserName;

      // for firebase auth
      const userData: IntFirebaseAuthUser = {
        email,
        password
      };

      // save the user to both firebase and firestore
      this.authenticationService.signUp(userData)
        .then((user: User) => {
          // user firestore data
          const firestoreUserData: IntFirestoreUser = {
            uid: user.uid,
            fullName,
            email,
            phoneNumber,
            role: group,
            technicianRole: specificGroup,
            canEditWorkorder: false,
            canDeleteWorkorder: false,
            isAdmin: false,
            isSuperUser: false
          };

          // additional user config
          // update profile, save to firestore, verify email
          this.authenticationService
            .additionalUserConfiguration(
              user,
              lastUserName,
              firestoreUserData)
            .then(() => {
              this.toast
                .success(`Successfully registered. Email verification code sent to  ${user.email}.`,
                  { duration: 10000, id: 'sign-up-success-1' });
              this.router.navigate(['/']);
              this.spinner.hide('app-sign-up-spinner');
            });
        })
        .catch((error) => {
          this.spinner.hide('app-sign-up-spinner');

          const errorCode = error.code;

          if (errorCode === 'auth/email-already-in-use') {
            this.toast.error('A user with the provided email is already registered. Please Login or contact the Admin if you believe someone might have registered using your email.',
              { id: 'sign-up-error-3', duration: 6000 });
          }
          else if (errorCode === 'auth/invalid-email') {
            this.toast.error('Please provide a valid email address.',
              { id: 'sign-up-error-4', duration: 4000 });
          }
          else if (errorCode === 'auth/operation-not-allowed') {
            this.toast.error('A fatal error occured. Please contact the Admin for assistance.',
              { id: 'sign-up-error-5', duration: 4000 });
          }
          else if (errorCode === 'auth/weak-password') {
            this.toast.error('Create a stronger password.',
              { id: 'sign-up-error-6', duration: 4000 });
          }
          else {
            console.log('USER REGISTRATION err', error);
            console.log('USER REGISTRATION code', error.code);
            console.log('USER REGISTRATION msg', error.message);
            this.toast.error('An error occured during registration. Please try again or contact the admin.',
              { id: 'sign-up-error-7', duration: 5000 });
          }
        });
    }
  }

}
