import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseToolChangeComponent } from './close-tool-change.component';

describe('CloseToolChangeComponent', () => {
  let component: CloseToolChangeComponent;
  let fixture: ComponentFixture<CloseToolChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseToolChangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseToolChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
