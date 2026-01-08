import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyectoLayoutComponent } from './proyecto-layout.component';

describe('ProyectoLayoutComponent', () => {
  let component: ProyectoLayoutComponent;
  let fixture: ComponentFixture<ProyectoLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProyectoLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProyectoLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
