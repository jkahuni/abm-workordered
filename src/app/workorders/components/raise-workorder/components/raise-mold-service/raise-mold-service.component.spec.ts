import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseMoldServiceComponent } from './raise-mold-service.component';

describe('RaiseMoldServiceComponent', () => {
  let component: RaiseMoldServiceComponent;
  let fixture: ComponentFixture<RaiseMoldServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseMoldServiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseMoldServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
