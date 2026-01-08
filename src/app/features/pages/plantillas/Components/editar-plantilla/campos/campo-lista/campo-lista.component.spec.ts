import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampoListaComponent } from './campo-lista.component';

describe('CampoListaComponent', () => {
  let component: CampoListaComponent;
  let fixture: ComponentFixture<CampoListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CampoListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampoListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
