import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseServiceComponent } from './raise-service.component';

describe('RaiseServiceComponent', () => {
  let component: RaiseServiceComponent;
  let fixture: ComponentFixture<RaiseServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseServiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
