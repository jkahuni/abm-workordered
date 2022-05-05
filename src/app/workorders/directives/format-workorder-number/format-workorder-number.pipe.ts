import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';

@Pipe({
  name: 'formatWorkorderNumber'
})
export class FormatWorkorderNumberPipe implements PipeTransform {

  transform(workorderRaisedDateTime: string): string | undefined {
    if (!workorderRaisedDateTime) {
      return;
    }

    const formatDate = dayjs(workorderRaisedDateTime).format('DD MMM');
    const formatTime = dayjs(workorderRaisedDateTime).format('HH:mm');

    if (formatDate && formatTime) {

      return formatDate + ', ' + formatTime;
    }
    return workorderRaisedDateTime;

  }

}
