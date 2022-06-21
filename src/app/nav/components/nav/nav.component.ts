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

  user$!: Observable<User | null>;
  isStoresTechnician!: boolean;


  constructor(
    private authenticationService: AuthenticationService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private toast: HotToastService,
  ) { }

  ngOnInit(): void {
    this.userSetup();
    this.setUserGroup();
  }

  private userSetup(): any {
    return this.user$ = this.authenticationService.currentUser$;
  }

  private setUserGroup(): any {
    this.user$.subscribe(
      (user: User | null) => {
        if (user) {
          const uid = user.uid;

          this.authenticationService.getCurrentUserData(uid)
            .then((userGroup: string) => {
              return this.isStoresTechnician = userGroup && (userGroup === 'Eng. Store' || userGroup === 'PM Planning') ? true : false;
            })
            .catch(() => {
              return;
            });
        }
      }
    );
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
