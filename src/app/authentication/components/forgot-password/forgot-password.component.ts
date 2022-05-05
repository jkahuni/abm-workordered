import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '@authentication/services/authentication.service';
import { HotToastService } from '@ngneat/hot-toast';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  constructor(
    private authenticationService: AuthenticationService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) { }

  form!: FormGroup;


  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', { validators: [Validators.required, Validators.email], updateOn: 'blur' }]
    });
  }

  get f(): any {
    return this.form.controls;
  }

  resetPassword(): void {
    if (!this.form.valid) {
      this.toast.error('Ensure your email is not blank or invalid.',
        { duration: 5000, id: 'error-forgot-password' });

    } else {

      this.spinner.show('app-forgot-password-spinner');

      const { email } = this.form?.value;

      this.authenticationService.resetPassword(email)
        .then(() => {
          this.spinner.hide('app-forgot-password-spinner');
          this.toast.success(`Success. Password reset link has been sent to ${email}.`,
            { duration: 5000, id: 'success4' });
          this.router.navigate(['/']);

        })
        .catch((err: any) => {
          this.spinner.hide('app-forgot-password-spinner');

          if (err.code === 'auth/invalid-email') {
            this.toast.error('Please provide a valid email address.',
              { id: 'reset-password-error-1', duration: 4000 });
          } else if (err.code === 'auth/operation-not-allowed') {
            this.toast.error('A fatal error occured. Please contact the Admin for assistance.',
              { id: 'reset-password-error-2', duration: 4000 });
          } else {
            console.log('[RESET PASSWORD] err', err);
            console.log('[RESET PASSWORD] code', err.code);
            console.log('[RESET PASSWORD] msg', err.message);
            this.spinner.hide('app-forgot-password-spinner');
            this.toast.error(`Failed. Please try again or contact the Admin for assistance.`,
              { duration: 5000, id: 'reset-password-error-3' });
          }
        }
        );


    }

  }
}
