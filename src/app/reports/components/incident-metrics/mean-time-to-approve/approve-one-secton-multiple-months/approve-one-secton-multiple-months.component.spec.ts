import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveOneSectonMultipleMonthsComponent } from './approve-one-secton-multiple-months.component';

describe('ApproveOneSectonMultipleMonthsComponent', () => {
  let component: ApproveOneSectonMultipleMonthsComponent;
  let fixture: ComponentFixture<ApproveOneSectonMultipleMonthsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveOneSectonMultipleMonthsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveOneSectonMultipleMonthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
