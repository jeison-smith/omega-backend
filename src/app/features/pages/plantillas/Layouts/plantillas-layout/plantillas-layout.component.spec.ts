import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillasLayoutComponent } from './plantillas-layout.component';

describe('PlantillasLayoutComponent', () => {
  let component: PlantillasLayoutComponent;
  let fixture: ComponentFixture<PlantillasLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlantillasLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantillasLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
