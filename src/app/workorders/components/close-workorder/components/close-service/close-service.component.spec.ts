import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseServiceComponent } from './close-service.component';

describe('CloseServiceComponent', () => {
  let component: CloseServiceComponent;
  let fixture: ComponentFixture<CloseServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseServiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
