import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarGestionComponent } from './eliminar-gestion.component';

describe('EliminarGestionComponent', () => {
  let component: EliminarGestionComponent;
  let fixture: ComponentFixture<EliminarGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EliminarGestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
