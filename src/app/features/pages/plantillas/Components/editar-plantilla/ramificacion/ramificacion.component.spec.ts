import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RamificacionComponent } from './ramificacion.component';

describe('RamificacionComponent', () => {
  let component: RamificacionComponent;
  let fixture: ComponentFixture<RamificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RamificacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RamificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
