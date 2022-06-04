import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McOneSectionMultipleMonthsPeriodComponent } from './mc-one-section-multiple-months-period.component';

describe('McOneSectionMultipleMonthsPeriodComponent', () => {
  let component: McOneSectionMultipleMonthsPeriodComponent;
  let fixture: ComponentFixture<McOneSectionMultipleMonthsPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ McOneSectionMultipleMonthsPeriodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(McOneSectionMultipleMonthsPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
