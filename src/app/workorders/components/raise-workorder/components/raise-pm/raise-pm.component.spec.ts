import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaisePmComponent } from './raise-pm.component';

describe('RaisePmComponent', () => {
  let component: RaisePmComponent;
  let fixture: ComponentFixture<RaisePmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaisePmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaisePmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
