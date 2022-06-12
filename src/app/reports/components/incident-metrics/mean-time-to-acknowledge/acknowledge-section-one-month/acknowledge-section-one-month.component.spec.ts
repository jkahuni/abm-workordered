import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcknowledgeSectionOneMonthComponent } from './acknowledge-section-one-month.component';

describe('AcknowledgeSectionOneMonthComponent', () => {
  let component: AcknowledgeSectionOneMonthComponent;
  let fixture: ComponentFixture<AcknowledgeSectionOneMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcknowledgeSectionOneMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcknowledgeSectionOneMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
