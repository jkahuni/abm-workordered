import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveSectionMultipleMonthsComponent } from './approve-section-multiple-months.component';

describe('ApproveSectionMultipleMonthsComponent', () => {
  let component: ApproveSectionMultipleMonthsComponent;
  let fixture: ComponentFixture<ApproveSectionMultipleMonthsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveSectionMultipleMonthsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveSectionMultipleMonthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
