import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarSeccionesPlantillaComponent } from './editar-secciones-plantilla.component';

describe('EditarSeccionesPlantillaComponent', () => {
  let component: EditarSeccionesPlantillaComponent;
  let fixture: ComponentFixture<EditarSeccionesPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarSeccionesPlantillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarSeccionesPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
