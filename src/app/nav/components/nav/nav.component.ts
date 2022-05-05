import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { AuthenticationService } from '@authentication/services/authentication.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HotToastService } from '@ngneat/hot-toast';

import { User } from '@angular/fire/auth';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  constructor(
    private authenticationService: AuthenticationService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private toast: HotToastService,
  ) { }

  user$!: Observable<User | null>;

  ngOnInit(): void {
    this.user$ = this.authenticationService.currentUser$;
  }

  logout(): void {
    this.spinner.show('logout-spinner');
    this.authenticationService.logout()
      .then(() => {
        this.spinner.hide('logout-spinner');
        this.router.navigate(['/']);
      })
      .catch(() => {
        this.spinner.hide('logout-spinner');
        this.toast
          .error(`An unknown error error occured. Please try again or contact the admin.`, { duration: 5000, id: 'sign-out-error' });

      });

  }




}
