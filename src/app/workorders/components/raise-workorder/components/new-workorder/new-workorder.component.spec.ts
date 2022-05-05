import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWorkorderComponent } from './new-workorder.component';

describe('NewWorkorderComponent', () => {
  let component: NewWorkorderComponent;
  let fixture: ComponentFixture<NewWorkorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewWorkorderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewWorkorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
