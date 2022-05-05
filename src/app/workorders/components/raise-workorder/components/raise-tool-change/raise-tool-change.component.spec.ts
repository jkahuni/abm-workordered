import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseToolChangeComponent } from './raise-tool-change.component';

describe('RaiseToolChangeComponent', () => {
  let component: RaiseToolChangeComponent;
  let fixture: ComponentFixture<RaiseToolChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseToolChangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseToolChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
