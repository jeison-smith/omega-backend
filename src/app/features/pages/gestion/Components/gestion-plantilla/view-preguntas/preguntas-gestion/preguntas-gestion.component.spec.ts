import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreguntasGestionComponent } from './preguntas-gestion.component';

describe('PreguntasGestionComponent', () => {
  let component: PreguntasGestionComponent;
  let fixture: ComponentFixture<PreguntasGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreguntasGestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreguntasGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
