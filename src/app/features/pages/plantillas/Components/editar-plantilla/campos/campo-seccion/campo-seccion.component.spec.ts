import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampoSeccionComponent } from './campo-seccion.component';

describe('CampoSeccionComponent', () => {
  let component: CampoSeccionComponent;
  let fixture: ComponentFixture<CampoSeccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CampoSeccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampoSeccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
