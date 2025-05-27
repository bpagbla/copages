import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditordashboardComponent } from './editordashboard.component';

describe('EditordashboardComponent', () => {
  let component: EditordashboardComponent;
  let fixture: ComponentFixture<EditordashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditordashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditordashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
