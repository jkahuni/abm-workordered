import { Directive } from '@angular/core';
import {
  NG_ASYNC_VALIDATORS,
  AsyncValidator, ValidationErrors, AbstractControl
} from '@angular/forms';
import { of, Observable } from 'rxjs';


@Directive({
  selector: '[appValidateSentenceFormat]',
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: ValidateSentenceFormatDirective,
    multi: true
  }]
})
export class ValidateSentenceFormatDirective implements AsyncValidator {

  constructor() { }

  sentenceFormat = 'A-Za-z0-9\\s\\.\\-\\/\\\'';
  // sentenceFormat = String.raw`^[A-Za-z0-9\s\.\-\/']+?$`;

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (control.value.length === 0 || control.value === null || control.value === undefined) {
      return Promise.resolve(null);
    }

    const sentence = control.value.trim();
    const allowedRegexPattern = new RegExp('^[' + this.sentenceFormat + ']+?$');
    const invalidCharacters = new RegExp('[^' + this.sentenceFormat + ']', 'g');

    return !allowedRegexPattern.test(sentence) ? of({
      invalidSentenceFormat: {
        value: `Character(s) ${sentence.match(invalidCharacters)
          } are not allowed.`
      }
    }) : of(null);

  }

}
