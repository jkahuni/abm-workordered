import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveSectionOneWeekComponent } from './approve-section-one-week.component';

describe('ApproveSectionOneWeekComponent', () => {
  let component: ApproveSectionOneWeekComponent;
  let fixture: ComponentFixture<ApproveSectionOneWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveSectionOneWeekComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveSectionOneWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
