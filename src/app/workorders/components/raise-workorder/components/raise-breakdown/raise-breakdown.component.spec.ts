import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseBreakdownComponent } from './raise-breakdown.component';

describe('RaiseBreakdownComponent', () => {
  let component: RaiseBreakdownComponent;
  let fixture: ComponentFixture<RaiseBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseBreakdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
