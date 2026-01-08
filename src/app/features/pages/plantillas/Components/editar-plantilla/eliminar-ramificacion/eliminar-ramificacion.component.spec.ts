import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarRamificacionComponent } from './eliminar-ramificacion.component';

describe('EliminarRamificacionComponent', () => {
  let component: EliminarRamificacionComponent;
  let fixture: ComponentFixture<EliminarRamificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EliminarRamificacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarRamificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
