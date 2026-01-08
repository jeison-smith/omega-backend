import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespuestaPlantillaComponent } from './respuesta-plantilla.component';

describe('RespuestaPlantillaComponent', () => {
  let component: RespuestaPlantillaComponent;
  let fixture: ComponentFixture<RespuestaPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RespuestaPlantillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RespuestaPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

