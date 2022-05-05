import { Component, OnInit } from '@angular/core';

// for firebase User object
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';


@Component({
  selector: 'app-new-workorder',
  templateUrl: './new-workorder.component.html',
  styleUrls: ['./new-workorder.component.scss']
})
export class NewWorkorderComponent implements OnInit {

  constructor(
    private auth: Auth,
  ) { }

  public userUid!: string;


  ngOnInit(): void {
    onAuthStateChanged(this.auth,
      (user: User | null) => {
        if (user) {
          this.userUid = user.uid;
        }
      });

  }

}
