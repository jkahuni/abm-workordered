// core ng impors
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// 3rd party libraries
import { NgxSpinnerService } from 'ngx-spinner';

// my imports
import { WorkordersService } from '@workorders/services/workorders.service';
import { IntSection, IntMachine, IntUser } from '@workorders/models/workorders.models';


@Component({
  selector: 'app-raise-workorder',
  templateUrl: './raise-workorder.component.html',
  styleUrls: ['./raise-workorder.component.scss']
})
export class RaiseWorkorderComponent implements OnInit {

  // control type of child to show
  newWorkorderTypeSelected = false;
  raiseAbrnomalityCard = false;
  raiseAm = false;
  raiseBreakdown = false;
  raiseCorrectiveMaintenance = false;
  raiseKaizenCard = false;
  raiseMoldService = false;
  raisePM = false;
  raiseProject = false;
  raiseService = false;
  raiseToolChange = false;


  // configures data to show children
  userUid!: string | null;
  sections!: IntSection[];
  initialSections: string[] = ['Grid Casting', 'Pasting'];
  machines!: IntMachine[];
  raiser!: IntUser;

  // error messages
  loading = true;
  loadingFailed = false;
  getSectionsError!: string;
  getMachinesError!: string;
  getUserError!: string;
  defaultErrorMessage = `Error URW-01 occured while configuring your workorder. 
  Please reload the page or report the error code to support for assistance.`;

  constructor(
    private spinner: NgxSpinnerService,
    private workordersService: WorkordersService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // this.spinner.show('app-raise-workorder-spinner');
    this.getSections();
    this.getMachines();
    this.getUser(this.setUserUid());
  }

  private setUserUid(): string | null {
    let userUid = this.route.snapshot.paramMap.get('userUid');
    return userUid;
  }

  private getUser(userUid: string | null): void {
    if (userUid) {
      this.workordersService.getUser(userUid)
        .then((user: IntUser) => {
          this.loading = false;
          this.raiser = user;
        })
        .catch((err: any) => {
          this.loadingFailed = true;
          if (err.code === 'failed-precondition') {
            this.getUserError = `Configuring your new workorder failed with error code IND-RW-01. Please report this error code to support to have it resolved.`;
          } else {
            this.getUserError = `Configuring your new workorder failed with error code RW-01. Please report this error code to support to have it resolved.`;
          }
        });
    } else {
      this.loadingFailed = true;
      this.getUserError = `Configuring your new workorder failed with error code RW-001. Please report this error code to support to have it resolved.`;
    }
  }

  private getSections(): void {
    this.workordersService.getSections()
      .then((sections: IntSection[]) => {
        this.loading = false;
        const initialSections: IntSection[] = sections.filter((section: IntSection) => {
          const sectionIsInitial = this.initialSections.includes(section.name);
          return sectionIsInitial;
        });
        this.sections = initialSections;
      })
      .catch((err: any) => {
        this.loadingFailed = true;

        if (err.code === 'failed-precondition') {
          this.getSectionsError = `Configuring your new workorder failed with error code IND-RW-03. Please report this error code to support to have it resolved.`;

        } else {
          this.getSectionsError = `Configuring your new workorder failed with error code RW-03. Please report this error code to support to have it resolved.`;

        }
      });
  }

  private getMachines(): void {
    this.workordersService.getMachines()
      .then((machines: IntMachine[]) => {
        this.loading = false;
        this.machines = machines;
      })
      .catch((err: any) => {
        this.loadingFailed = true;
        if (err.code === 'failed-precondition') {
          this.getMachinesError = `Configuring your new workorder failed with error code IND-RW-04. Please report this error code to support to have it resolved.`;
        } else {
          this.getMachinesError = `Configuring your new workorder failed with error code RW-04. Please report this error code to support to have it resolved.`;
        }
      });
  }

  // event emitted by new workorders component
  workorderTypeSelected(type: string): any {
    if (type === 'ac') {
      this.raiseAbrnomalityCard = true;
    }
    else if (type === 'am') {
      this.raiseAm = true;
    }
    else if (type === 'bd') {
      this.raiseBreakdown = true;
    }
    else if (type === 'cm') {
      this.raiseCorrectiveMaintenance = true;
    }
    else if (type === 'kc') {
      this.raiseKaizenCard = true;
    }
    else if (type === 'ms') {
      this.raiseMoldService = true;
    }
    else if (type === 'pm') {
      this.raisePM = true;
    }
    else if (type === 'pr') {
      this.raiseProject = true;
    }
    else if (type === 'ser') {
      this.raiseService = true;
    }
    else if (type === 'tc') {
      this.raiseToolChange = true;
    }
    this.newWorkorderTypeSelected = true;

  }

  // event emitted by children
  workorderRaised(status: boolean): void {
    if (status) {
      this.router.navigate(['/']);
    }
  }
}
