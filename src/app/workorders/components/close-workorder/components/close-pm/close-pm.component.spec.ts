import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosePmComponent } from './close-pm.component';

describe('ClosePmComponent', () => {
  let component: ClosePmComponent;
  let fixture: ComponentFixture<ClosePmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClosePmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosePmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
