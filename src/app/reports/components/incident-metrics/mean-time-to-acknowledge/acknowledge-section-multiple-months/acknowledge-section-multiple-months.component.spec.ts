import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcknowledgeSectionMultipleMonthsComponent } from './acknowledge-section-multiple-months.component';

describe('AcknowledgeSectionMultipleMonthsComponent', () => {
  let component: AcknowledgeSectionMultipleMonthsComponent;
  let fixture: ComponentFixture<AcknowledgeSectionMultipleMonthsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcknowledgeSectionMultipleMonthsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcknowledgeSectionMultipleMonthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
