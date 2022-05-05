import { Directive } from '@angular/core';
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { Observable, of } from 'rxjs';


@Directive({
  selector: '[appValidateMixedFormat]',
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: ValidateMixedFormatDirective,
    multi: true
  }]
})
export class ValidateMixedFormatDirective implements Validator {

  constructor() { }

  // formatToUse = String.raw`^[a-zA-Z0-9-\s]+$`;
  formatToUse = 'a-zA-Z0-9\\-\\s';

  validate(control: AbstractControl): Promise<ValidationErrors | null> {
    if (control.value.length === 0 || control.value === null || control.value === undefined) {
      return Promise.resolve(null);
    }

    const controlValue = control.value.trim();
    const allowedRegex = new RegExp('^[' + this.formatToUse + ']+?$');
    const invalidRegex = new RegExp('[^' + this.formatToUse + ']', 'g');

    return !allowedRegex.test(controlValue) ? Promise.resolve({
      invalidFormat: {
        value:
          `Character(s) ${controlValue.match(invalidRegex)} are not allowed.`
      }
    }) : Promise.resolve(null);

  }

}
