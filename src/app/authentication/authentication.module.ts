import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AuthenticationRoutingModule } from '@authentication/authentication-routing.module';
import { ForgotPasswordComponent } from '@authentication/components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from '@authentication/components/verify-email/verify-email.component';
import { LoginComponent } from '@authentication/components/login/login.component';
import { RegisterComponent } from '@authentication/components/register/register.component';

// custom directives
import { ComparePasswordsDirective } from '@authentication/directives/compare-fields/compare-passwords.directive';
import { ValidateNameFormatDirective } from '@authentication/directives/validate-name-format/validate-name-format.directive';
import { ValidatePhoneFormatDirective } from '@authentication/directives/validate-phone-format/validate-phone-format.directive';

// shared
import { SharedModule } from '@shared/shared.module';
import { PhoneNumberComponent } from './components/phone-number/phone-number.component';
import { VerificationCodeComponent } from './components/verification-code/verification-code.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    // directives
    ComparePasswordsDirective,
    ValidateNameFormatDirective,
    ValidatePhoneFormatDirective,
    PhoneNumberComponent,
    VerificationCodeComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    AuthenticationRoutingModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AuthenticationModule { }
