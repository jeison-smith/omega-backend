import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObligatorioGestionComponent } from './obligatorio-gestion.component';

describe('ObligatorioGestionComponent', () => {
  let component: ObligatorioGestionComponent;
  let fixture: ComponentFixture<ObligatorioGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ObligatorioGestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObligatorioGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
