import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespuestaCampoComponent } from './respuesta-campo.component';

describe('RespuestaCampoComponent', () => {
  let component: RespuestaCampoComponent;
  let fixture: ComponentFixture<RespuestaCampoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RespuestaCampoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RespuestaCampoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
