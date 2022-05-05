import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseAbnormalityCardComponent } from './raise-abnormality-card.component';

describe('RaiseAbnormalityCardComponent', () => {
  let component: RaiseAbnormalityCardComponent;
  let fixture: ComponentFixture<RaiseAbnormalityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseAbnormalityCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseAbnormalityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
