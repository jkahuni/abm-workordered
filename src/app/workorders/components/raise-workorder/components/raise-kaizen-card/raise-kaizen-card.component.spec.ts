import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseKaizenCardComponent } from './raise-kaizen-card.component';

describe('RaiseKaizenCardComponent', () => {
  let component: RaiseKaizenCardComponent;
  let fixture: ComponentFixture<RaiseKaizenCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseKaizenCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseKaizenCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
