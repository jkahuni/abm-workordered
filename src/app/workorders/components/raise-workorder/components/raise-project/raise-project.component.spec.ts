import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseProjectComponent } from './raise-project.component';

describe('RaiseProjectComponent', () => {
  let component: RaiseProjectComponent;
  let fixture: ComponentFixture<RaiseProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseProjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
