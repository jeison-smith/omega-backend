import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPlantillaComponent } from './listar-plantilla.component';

describe('ListarPlantillaComponent', () => {
  let component: ListarPlantillaComponent;
  let fixture: ComponentFixture<ListarPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarPlantillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
