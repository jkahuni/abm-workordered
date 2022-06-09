import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveOneSectionOneMonthComponent } from './approve-one-section-one-month.component';

describe('ApproveOneSectionOneMonthComponent', () => {
  let component: ApproveOneSectionOneMonthComponent;
  let fixture: ComponentFixture<ApproveOneSectionOneMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveOneSectionOneMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveOneSectionOneMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
