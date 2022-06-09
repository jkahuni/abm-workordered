import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveOneSectionOneWeekComponent } from './approve-one-section-one-week.component';

describe('ApproveOneSectionOneWeekComponent', () => {
  let component: ApproveOneSectionOneWeekComponent;
  let fixture: ComponentFixture<ApproveOneSectionOneWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveOneSectionOneWeekComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveOneSectionOneWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
