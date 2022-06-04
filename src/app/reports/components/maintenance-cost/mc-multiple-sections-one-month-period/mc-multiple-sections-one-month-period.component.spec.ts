import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McMultipleSectionsOneMonthPeriodComponent } from './mc-multiple-sections-one-month-period.component';

describe('McMultipleSectionsOneMonthPeriodComponent', () => {
  let component: McMultipleSectionsOneMonthPeriodComponent;
  let fixture: ComponentFixture<McMultipleSectionsOneMonthPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ McMultipleSectionsOneMonthPeriodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(McMultipleSectionsOneMonthPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
