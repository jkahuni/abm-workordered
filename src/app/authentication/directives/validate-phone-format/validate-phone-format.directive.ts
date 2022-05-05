import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';
import { Directive } from '@angular/core';

@Directive({
  selector: '[appValidatePhoneFormat]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: ValidatePhoneFormatDirective,
    multi: true
  }]
})
export class ValidatePhoneFormatDirective implements Validator {

  phoneFormat = String.raw`^((01)|(07))([0-9]{8})$`;


  constructor() { }

  validate(control: AbstractControl): { [key: string]: any } | null {
    if (control.value.length === 0 || control.value === null || control.value === undefined) {
      return null;
    }

    const phoneNumber = control.value.trim();
    const regex = new RegExp(this.phoneFormat);

    return !regex.test(phoneNumber) ?
      { invalidPhoneFormat: true }
      : null;



  }



}
