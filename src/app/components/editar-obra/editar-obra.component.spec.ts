import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarObraComponent } from './editar-obra.component';

describe('EditarObraComponent', () => {
  let component: EditarObraComponent;
  let fixture: ComponentFixture<EditarObraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarObraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarObraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
