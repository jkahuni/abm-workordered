import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveMultipleSectionsOneMonthComponent } from './approve-multiple-sections-one-month.component';

describe('ApproveMultipleSectionsOneMonthComponent', () => {
  let component: ApproveMultipleSectionsOneMonthComponent;
  let fixture: ComponentFixture<ApproveMultipleSectionsOneMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveMultipleSectionsOneMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveMultipleSectionsOneMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
