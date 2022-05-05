import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthenticationService } from '@authentication/services/authentication.service';
import { HotToastService } from '@ngneat/hot-toast';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private toast: HotToastService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) { }

  form!: FormGroup;
  // boolean property to control password visibility
  hide = true;

  ngOnInit(): void {
    this.form = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      email: ['', {
        validators:
          [Validators.required, Validators.email]
      }],
      password: ['', {
        validators: [Validators.required]
      }]
    });
  }
  get f(): FormControl | any {
    return this.form.controls;
  }

  login = () => {
    if (!this.form.valid) {
      this.toast.error(`Error. Invalid email or password.`,
        { duration: 5000, id: 'sign-in-error-1' });
    } else {
      this.spinner.show('app-sign-in-spinner');
      const { email, password } = this.form.value;
      this.authenticationService.signIn(email, password)
        .then(() => {
          this.spinner.hide('app-sign-in-spinner');
          this.router.navigate(['/']);
        })
        .catch(() => {
          this.spinner.hide('app-sign-in-spinner');
          this.toast.error(
            'Failed. Invalid email or password. ', { duration: 4000, id: 'sign-in-error-2' }
          );
        });
    }
  }


}
