import { Component, OnInit , OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@authentication/services/authentication.service';
import { User } from '@angular/fire/auth';
import { Observable, Subject, takeUntil } from 'rxjs';



@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit, OnDestroy {

  user$!: Observable<User | null>;

  constructor(
    private authenticatonService: AuthenticationService,
    private router: Router
  ) { }

  private subscriptionSubject = new Subject<void>();

  ngOnDestroy(): void {
    this.subscriptionSubject.next();
    this.subscriptionSubject.complete();
  }

  ngOnInit(): void {
    this.user$ = this.authenticatonService.currentUser$;
    this.redirectHomeIfVerified();
  }

  private redirectHomeIfVerified(): void {
    this.user$
      .pipe(takeUntil(this.subscriptionSubject))
      .subscribe(
      (user: User | null) => {
        if (user && user.emailVerified) {
          console.log(user.emailVerified, 'THE USER');
          this.router.navigate(['/']);
        }
      }
    );
  }

}
