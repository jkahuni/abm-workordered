import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseWorkorderComponent } from './raise-workorder.component';

describe('RaiseWorkorderComponent', () => {
  let component: RaiseWorkorderComponent;
  let fixture: ComponentFixture<RaiseWorkorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseWorkorderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseWorkorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
