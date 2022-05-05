import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseKaizenCardComponent } from './close-kaizen-card.component';

describe('CloseKaizenCardComponent', () => {
  let component: CloseKaizenCardComponent;
  let fixture: ComponentFixture<CloseKaizenCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseKaizenCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseKaizenCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
