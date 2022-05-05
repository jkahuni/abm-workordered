import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseWorkorderComponent } from './close-workorder.component';

describe('CloseWorkorderComponent', () => {
  let component: CloseWorkorderComponent;
  let fixture: ComponentFixture<CloseWorkorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseWorkorderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseWorkorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
