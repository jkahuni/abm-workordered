import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcknowledgeSectionOneWeekComponent } from './acknowledge-section-one-week.component';

describe('AcknowledgeSectionOneWeekComponent', () => {
  let component: AcknowledgeSectionOneWeekComponent;
  let fixture: ComponentFixture<AcknowledgeSectionOneWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcknowledgeSectionOneWeekComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcknowledgeSectionOneWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
