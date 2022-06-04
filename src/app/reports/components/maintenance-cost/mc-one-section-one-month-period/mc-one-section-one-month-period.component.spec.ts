import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McOneSectionOneMonthPeriodComponent } from './mc-one-section-one-month-period.component';

describe('McOneSectionOneMonthPeriodComponent', () => {
  let component: McOneSectionOneMonthPeriodComponent;
  let fixture: ComponentFixture<McOneSectionOneMonthPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ McOneSectionOneMonthPeriodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(McOneSectionOneMonthPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
