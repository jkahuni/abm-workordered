import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseAmComponent } from './close-am.component';

describe('CloseAmComponent', () => {
  let component: CloseAmComponent;
  let fixture: ComponentFixture<CloseAmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseAmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseAmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
