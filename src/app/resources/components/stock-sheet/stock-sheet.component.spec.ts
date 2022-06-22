import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockSheetComponent } from './stock-sheet.component';

describe('StockSheetComponent', () => {
  let component: StockSheetComponent;
  let fixture: ComponentFixture<StockSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockSheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
