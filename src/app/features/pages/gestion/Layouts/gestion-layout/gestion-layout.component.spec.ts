import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionLayoutComponent } from './gestion-layout.component';

describe('GestionLayoutComponent', () => {
  let component: GestionLayoutComponent;
  let fixture: ComponentFixture<GestionLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
