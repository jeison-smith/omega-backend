import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrearPlantillaComponent } from './modal-crear-plantilla.component';

describe('ModalCrearPlantillaComponent', () => {
  let component: ModalCrearPlantillaComponent;
  let fixture: ComponentFixture<ModalCrearPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalCrearPlantillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCrearPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
