import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPlantillaComponent } from './crear-plantilla.component';

describe('CrearPlantillaComponent', () => {
  let component: CrearPlantillaComponent;
  let fixture: ComponentFixture<CrearPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearPlantillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
