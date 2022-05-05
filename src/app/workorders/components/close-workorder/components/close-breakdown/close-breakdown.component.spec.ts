import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseBreakdownComponent } from './close-breakdown.component';

describe('CloseBreakdownComponent', () => {
  let component: CloseBreakdownComponent;
  let fixture: ComponentFixture<CloseBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseBreakdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
