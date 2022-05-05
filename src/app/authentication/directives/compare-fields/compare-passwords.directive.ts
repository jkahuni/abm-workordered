import { Directive, Input } from '@angular/core';
import { AbstractControl, Validator, ValidationErrors, NG_VALIDATORS } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appComparePasswords]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: ComparePasswordsDirective,
    multi: true
  }]
})
export class ComparePasswordsDirective implements Validator {
  // tslint:disable-next-line: no-input-rename
  @Input('compareWith') password!: string;
  constructor() { }
  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value.length === 0 || control.value === null) { return null; }

    const password = control.root.get(this.password);
    const passwordValue = password?.value;
    const confirmPasswordValue = control.value;

    if (password) {
      const sub: Subscription = password.valueChanges
        .subscribe(
          () => {
            control.updateValueAndValidity();
            sub.unsubscribe();
          }
        );
    }

    return password && passwordValue !== confirmPasswordValue ?
      { passwordsMismatch: true } : null;
  }
}
