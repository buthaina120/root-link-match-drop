import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntonymsComponent } from './antonyms.component';

describe('AntonymsComponent', () => {
  let component: AntonymsComponent;
  let fixture: ComponentFixture<AntonymsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntonymsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AntonymsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
