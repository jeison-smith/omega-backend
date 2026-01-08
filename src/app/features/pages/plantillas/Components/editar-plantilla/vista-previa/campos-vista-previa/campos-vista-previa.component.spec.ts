import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamposVistaPreviaComponent } from './campos-vista-previa.component';

describe('CamposVistaPreviaComponent', () => {
  let component: CamposVistaPreviaComponent;
  let fixture: ComponentFixture<CamposVistaPreviaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CamposVistaPreviaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CamposVistaPreviaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
