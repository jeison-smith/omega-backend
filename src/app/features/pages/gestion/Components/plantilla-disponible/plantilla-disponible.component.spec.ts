import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillaDisponibleComponent } from './plantilla-disponible.component';

describe('PlantillaDisponibleComponent', () => {
  let component: PlantillaDisponibleComponent;
  let fixture: ComponentFixture<PlantillaDisponibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlantillaDisponibleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantillaDisponibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
