import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueSparesComponent } from './issue-spares.component';

describe('IssueSparesComponent', () => {
  let component: IssueSparesComponent;
  let fixture: ComponentFixture<IssueSparesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IssueSparesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueSparesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
