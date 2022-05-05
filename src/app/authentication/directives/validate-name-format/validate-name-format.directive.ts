import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, ValidationErrors, AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appValidateNameFormat]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: ValidateNameFormatDirective,
    multi: true
  }]
})
export class ValidateNameFormatDirective implements Validator {

  nameFormat = String.raw`^[a-zA-Z']+$`;


  constructor() { }

  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value.length === 0 || control.value === null || control.value === undefined) {
      return null;
    }

    const name = control.value.trim();
    const regex = new RegExp(this.nameFormat);
    return !regex.test(name) ? { invalidNameFormat: true } : null;


  }

}
