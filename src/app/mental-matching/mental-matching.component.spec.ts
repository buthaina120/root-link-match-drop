import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentalMatchingComponent } from './mental-matching.component';

describe('MentalMatchingComponent', () => {
  let component: MentalMatchingComponent;
  let fixture: ComponentFixture<MentalMatchingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentalMatchingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentalMatchingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
