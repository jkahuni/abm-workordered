import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveSectionOneMonthComponent } from './approve-section-one-month.component';

describe('ApproveSectionOneMonthComponent', () => {
  let component: ApproveSectionOneMonthComponent;
  let fixture: ComponentFixture<ApproveSectionOneMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveSectionOneMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveSectionOneMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
