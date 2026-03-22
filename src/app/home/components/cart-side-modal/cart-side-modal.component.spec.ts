import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CartSideModalComponent } from './cart-side-modal.component';

describe('CartSideModalComponent', () => {
  let component: CartSideModalComponent;
  let fixture: ComponentFixture<CartSideModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CartSideModalComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CartSideModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closeModal on close click', () => {
    spyOn(component.closeModal, 'emit');

    const fakeEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
    } as any;

    component.onCloseClick(fakeEvent);

    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should keep total input value', () => {
    component.total = 123456;
    expect(component.total).toBe(123456);
  });
});
