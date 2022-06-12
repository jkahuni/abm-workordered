import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewWorkordersModalComponent } from './review-workorders-modal.component';

describe('ReviewWorkordersModalComponent', () => {
  let component: ReviewWorkordersModalComponent;
  let fixture: ComponentFixture<ReviewWorkordersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewWorkordersModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewWorkordersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
