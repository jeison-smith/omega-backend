import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamposGestionComponent } from './campos-gestion.component';

describe('CamposGestionComponent', () => {
  let component: CamposGestionComponent;
  let fixture: ComponentFixture<CamposGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CamposGestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CamposGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
