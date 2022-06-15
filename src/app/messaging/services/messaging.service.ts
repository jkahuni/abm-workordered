import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  constructor() { }



  async sendSMSMessage(): Promise<any> {
    // const africasTalking = require('africastalking')(environment.africasTalkingCredentials);

    // const messageOptions = {
    //   to: ['+254725501413'],
    //   message: 'TEST MESSAGE'
    // };

    // const smsMessage = await africasTalking.SMS.send(messageOptions)
    //   .then((result: any) => {
    //     console.log('THE RESULT', result);
    //   })
    //   .catch((error: any) => {
    //     console.log('ERROR MESSAGE', error);
    //   });

    // return smsMessage;
    console.log('MESSAGE WILL COME HERE');
  }
}
