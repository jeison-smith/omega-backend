import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampoOpcionComponent } from './campo-opcion.component';

describe('CampoOpcionComponent', () => {
  let component: CampoOpcionComponent;
  let fixture: ComponentFixture<CampoOpcionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CampoOpcionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampoOpcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
