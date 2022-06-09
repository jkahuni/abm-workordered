import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveOneSectionMultipleMonthsComponent } from './approve-one-section-multiple-months.component';

describe('ApproveOneSectionMultipleMonthsComponent', () => {
  let component: ApproveOneSectionMultipleMonthsComponent;
  let fixture: ComponentFixture<ApproveOneSectionMultipleMonthsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveOneSectionMultipleMonthsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveOneSectionMultipleMonthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
