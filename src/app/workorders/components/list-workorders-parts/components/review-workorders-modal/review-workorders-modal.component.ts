import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { IntWorkorder, IntUser } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';
import * as weekOfYear from 'dayjs/plugin/weekOfYear';
import * as isToday from 'dayjs/plugin/isToday';
import * as isYesterday from 'dayjs/plugin/isYesterday';
import * as dayjs from 'dayjs';

dayjs.extend(weekOfYear);
dayjs.extend(isToday);
dayjs.extend(isYesterday);



@Component({
  selector: 'app-review-workorders-modal',
  templateUrl: './review-workorders-modal.component.html',
  styleUrls: ['./review-workorders-modal.component.scss']
})
export class ReviewWorkordersModalComponent implements OnInit {

  constructor(
    private workordersService: WorkordersService,
    private toast: HotToastService,
    private fb: FormBuilder
  ) {
    setTimeout(() => {
      if (this.openModalButton) {
        this.openModalButton.nativeElement.click();
      }
    });
   }

  @Input()
  workorders!: IntWorkorder[];

  // output
  @Output()
  close: EventEmitter<string> = new EventEmitter<string>();
  
  @ViewChild('openModalButton') openModalButton!: ElementRef;
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;
  @ViewChild('buttonSpinner') buttonSpinner!: ElementRef;

  form!: FormGroup;


  reviewingWorkorders = false;
  

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      dateRaisedFilter: ['']
    });

    return this.form = form;
  }


  private closeButtonSpinner(): void {
    this.reviewingWorkorders = false;

    if (this.buttonSpinner) {
      this.buttonSpinner.nativeElement.style.display = 'none';
    }
  }

  // wokrorders filter functions
  private filterTodaysWorkorders(date: string): boolean {
    const dateRaised = dayjs(date);
    return dateRaised && dateRaised.isToday() ? true : false;
  }

  private filterYesterdaysWorkorders(date: string): boolean {
    const dateRaised = dayjs(date);

    return dateRaised && dateRaised.isYesterday() ? true : false;
  }

  private filterThisWeeksWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);
    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();
    const weeksDifference = dateRaised.week() - now.week();

    return yearsDifference === 0 && monthsDifference === 0 && weeksDifference === 0 ? true : false;

  }

  private filterLastWeeksWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);

    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();
    const weeksDifference = dateRaised.week() - now.week();

    return yearsDifference === 0 && monthsDifference === 0 && weeksDifference === -1 ? true : false;
  }

  private filterThisMonthsWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);

    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();

    return yearsDifference === 0 && monthsDifference === 0 ? true : false;
  }

  private filterLastMonthsWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);

    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();

    return yearsDifference === 0 && monthsDifference === -1 ? true : false;
  }

  closeModal(): void {
    if (this.closeModalButton) {
      this.closeModalButton.nativeElement.click();
      this.close.emit('close');
    }
  }

  reviewWorkorders(): void {
    const { dateRaisedFilter } = this.form?.value;

    if (dateRaisedFilter === '') {
      return this.form?.get('dateRaisedFilter')?.setErrors({
        required: true
      });
    }

    else if (this.form?.invalid) {
      this.toast.close();
      this.toast.error(`An error occured while submitting your form. Please try again.`, { id: 'review-wokrorders-error-1' });
    }

    else {
      this.reviewingWorkorders = true;

      const workordersToReview = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const reviewStatus = workorder.review.status;
          const date = workorder.raised.dateTime;
          if (reviewStatus === '') {
            if (dateRaisedFilter === 'All') {
              return true;
            }
            else if (dateRaisedFilter === 'Today') {
              return this.filterTodaysWorkorders(date);
            }
            else if (dateRaisedFilter === 'Yesterday') {
              return this.filterYesterdaysWorkorders(date);
            }
            else if (dateRaisedFilter === 'This Week') {
              return this.filterThisWeeksWorkorders(date);
            }
            else if (dateRaisedFilter === 'Last Week') {
              return this.filterLastWeeksWorkorders(date);
            }
            else if (dateRaisedFilter === 'This Month') {
              return this.filterThisMonthsWorkorders(date);
            }
            else if (dateRaisedFilter === 'Last Month') {
              return this.filterLastMonthsWorkorders(date);
            } else {
              return false;
            }
          }
          return false;
        }
      );

      const totalWorkordersToReview = workordersToReview.length;
      if (totalWorkordersToReview) {
        workordersToReview.forEach(
          (workorder: IntWorkorder, index) => {
            const workorderUid = workorder.workorder.uid;
            const now = dayjs().format();

            const workorderUpdateData = {
              review: {
                status: 'reviewed',
                dateTime: now,
                concern: {}
              }
            };

            this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
              .then(() => {
                if (index + 1 === totalWorkordersToReview) {
                  this.closeButtonSpinner();
                  this.closeModal();
                  // this.refreshWorkorders(workorderUid,
                  //   workorderUpdateData);
                  this.toast.success(`Success. ${totalWorkordersToReview} workorder(s) reviewed successfully.`,
                    { duration: 8000, id: 'review-workorders-success' });
                }
              })
              .catch(() => {
                this.closeButtonSpinner();
                this.toast.error(
                  `Error: Reviewing multiple workorders failed with error code LW-RMW-01. Please report this error code to support to have the error fixed.`,
                  { autoClose: false, id: 'review-workorders-error-2' });
              });

          }
        );
      }
      else {
        this.closeButtonSpinner();
        this.toast.info(`No workorders raised ${dateRaisedFilter
          } were found. Consider changing the filter option selected.`,
          { duration: 10000, id: 'date-raised-filter-info' });

      }
    }
  }

}
