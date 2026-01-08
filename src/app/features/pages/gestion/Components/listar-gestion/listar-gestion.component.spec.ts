import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarGestionComponent } from './listar-gestion.component';

describe('ListarGestionComponent', () => {
  let component: ListarGestionComponent;
  let fixture: ComponentFixture<ListarGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarGestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
