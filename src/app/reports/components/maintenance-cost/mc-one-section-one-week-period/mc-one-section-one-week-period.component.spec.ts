import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McOneSectionOneWeekPeriodComponent } from './mc-one-section-one-week-period.component';

describe('McOneSectionOneWeekPeriodComponent', () => {
  let component: McOneSectionOneWeekPeriodComponent;
  let fixture: ComponentFixture<McOneSectionOneWeekPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ McOneSectionOneWeekPeriodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(McOneSectionOneWeekPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
