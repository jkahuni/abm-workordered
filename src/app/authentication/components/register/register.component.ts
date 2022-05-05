import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthenticationService } from '@authentication/services/authentication.service';
import { HotToastService } from '@ngneat/hot-toast';
import { NgxSpinnerService } from 'ngx-spinner';
import { IntFirebaseAuthUser, IntFirestoreUser } from '@authentication/models/authentication.models';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { MatSelect } from '@angular/material/select';

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

  @ViewChild('technicianGroupSelect') technicianGroupSelect!: MatSelect;
  @ViewChild('supervisorGroupSelect') supervisorGroupSelect!: MatSelect;

  hidePassword = true;
  hideConfirmPassword = true;
  form!: FormGroup;
  groups: string[] = ['Operator', 'Technician', 'QA', 'Supervisor', 'Manager',
    'Distribution'];
  technicianGroups: string[] = ['Electrical', 'Mechanical', 'Eng. Store', 'PM Planning'];
  supervisorGroups: string[] = ['Production', 'Engineering'];

  ngOnInit(): void {
    this.form = this.createForm();

  }


  createForm = () => {
    const form = this.fb.group({
      firstName: ['', { validators: [Validators.required] }],
      lastName: ['', { validators: [Validators.required] }],
      email: ['', {
        validators: [Validators.required,
        Validators.email]
      }],
      phoneNumber: ['', {
        validators: [Validators.required],

      }],
      group: ['', {
        validators: [Validators.required],

      }],
      technicianGroup: [''],
      supervisorGroup: [''],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    this.trackGroupChanges(form);

    return form;
  }

  private trackGroupChanges(form: FormGroup): any {
    form.get('group')?.valueChanges
      .subscribe((groupValue: string) => {
        console.log(groupValue);
        if (groupValue === 'Technician') {
          setTimeout(() => {
            if (this.technicianGroupSelect) {

              this.technicianGroupSelect.open();
            }
          });
        }
        else if (groupValue === 'Supervisor') {
          setTimeout(() => {
            if (this.supervisorGroupSelect) {
              this.supervisorGroupSelect.open();
            }
          });

        }
      });
  }

  private assignPrivileges(emailAddress: string): boolean {
    const email = emailAddress.trim().toLocaleLowerCase();
    const superUserEmails: string[] = [
      'josephkmwangi0683@gmail.com',
      'josephkmwangi2054@gmail.com',
      'josephkmwangi76@gmail.com',
      'josephkahunimwangi@gmail.com'
    ];

    const isPriviledgedUser = superUserEmails.includes(email);

    if (isPriviledgedUser) {
      return true;
    }
    return false;


  }

  register = () => {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      group,
      technicianGroup,
      supervisorGroup,
      password,
    } = this.form?.value;
    if (group === 'Technician' && technicianGroup === '') {
      this.form?.get('technicianGroup')?.setErrors({ required: true });
    }
    else if (group === 'Supervisor' && supervisorGroup === '') {
      this.form?.get('supervisorGroup')?.setErrors({ required: true });

    }
    else if (this.form.invalid) {
      this.toast.error(`Error. Ensure required fields are not blank or invalid.`,
        { duration: 7000, id: 'sign-up-error-2' });
    }
    else {
      this.spinner.show('app-sign-up-spinner');

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
            fullName: fullName.trim().toLocaleLowerCase(),
            email: email.trim().toLocaleLowerCase(),
            phoneNumber,
            group,
            technicianGroup,
            supervisorGroup,
            canEditWorkorder: this.assignPrivileges(email),
            canDeleteWorkorder: this.assignPrivileges(email),
            isAdmin: this.assignPrivileges(email),
            isSuperUser: this.assignPrivileges(email)
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
            this.toast.error('Create a stronger passwor, which is 6 characters long or more.',
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
