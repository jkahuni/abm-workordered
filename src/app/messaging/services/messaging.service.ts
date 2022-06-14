import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
const africasTalking = require('africastalking')(environment.africasTalkingCredentials);

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  constructor() { }

  private messageOptions = {
    to: ['+254725501413'],
    message: 'TEST MESSAGE'
  };

  async sendSMSMessage(): Promise<any> {
   const smsMessage = await africasTalking.SMS.send(this.messageOptions)
      .then((result: any) => {
        console.log('THE RESULT', result);
      })
      .catch((error: any) => {
        console.log('ERROR MESSAGE', error);
      });
    
    return smsMessage;
  }
}
