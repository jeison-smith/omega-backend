import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPlantillaComponent } from './gestion-plantilla.component';

describe('GestionPlantillaComponent', () => {
  let component: GestionPlantillaComponent;
  let fixture: ComponentFixture<GestionPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionPlantillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
