import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from '@authentication/components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from '@authentication/components/verify-email/verify-email.component';
import { LoginComponent } from '@authentication/components/login/login.component';
import { RegisterComponent } from '@authentication/components/register/register.component';

// auth guards
import { canActivate, redirectLoggedInTo } from '@angular/fire/auth-guard';

const redirectToHome = () => redirectLoggedInTo(['/']);


const routes: Routes = [
  {
    path: 'authentication/sign-in',
    component: LoginComponent,
    ...canActivate(redirectToHome)
  },

  {
    path: 'authentication/sign-up',
    component: RegisterComponent,
    ...canActivate(redirectToHome)
  },

  {
    path: 'authentication/forgot-password',
    component: ForgotPasswordComponent,
    ...canActivate(redirectToHome)
  },

  {
    path: 'authentication/verify-email',
    component: VerifyEmailComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
