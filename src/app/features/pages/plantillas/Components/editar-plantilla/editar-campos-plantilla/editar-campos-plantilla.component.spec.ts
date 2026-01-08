import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCamposPlantillaComponent } from './editar-campos-plantilla.component';

describe('EditarCamposPlantillaComponent', () => {
  let component: EditarCamposPlantillaComponent;
  let fixture: ComponentFixture<EditarCamposPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarCamposPlantillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarCamposPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
