import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseAmComponent } from './raise-am.component';

describe('RaiseAmComponent', () => {
  let component: RaiseAmComponent;
  let fixture: ComponentFixture<RaiseAmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseAmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseAmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
