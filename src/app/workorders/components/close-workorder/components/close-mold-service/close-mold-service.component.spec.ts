import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseMoldServiceComponent } from './close-mold-service.component';

describe('CloseMoldServiceComponent', () => {
  let component: CloseMoldServiceComponent;
  let fixture: ComponentFixture<CloseMoldServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseMoldServiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseMoldServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
