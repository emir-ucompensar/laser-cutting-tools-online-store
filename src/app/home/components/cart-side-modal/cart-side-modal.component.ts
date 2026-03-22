import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Animation, createAnimation } from '@ionic/angular';

import { CartItem } from '../../../core/models/cart.models';

@Component({
  selector: 'app-cart-side-modal',
  templateUrl: './cart-side-modal.component.html',
  styleUrls: ['./cart-side-modal.component.scss'],
  standalone: false,
})
export class CartSideModalComponent {
  @Input() isOpen = false;
  @Input() items: CartItem[] = [];
  @Input() total = 0;
  @Input() loading = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() increase = new EventEmitter<CartItem>();
  @Output() decrease = new EventEmitter<CartItem>();
  @Output() checkout = new EventEmitter<void>();

  onCloseClick(event: Event): void {
    event.stopPropagation();
    this.closeModal.emit();
  }

  readonly enterAnimation = (baseEl: HTMLElement): Animation => {
    const root = baseEl.shadowRoot;
    const backdrop = root?.querySelector('ion-backdrop');
    const wrapper = root?.querySelector('.modal-wrapper');

    const backdropAnimation = createAnimation()
      .addElement(backdrop as HTMLElement)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(wrapper as HTMLElement)
      .keyframes([
        { offset: 0, opacity: '0.99', transform: 'translateX(100%)' },
        { offset: 1, opacity: '0.99', transform: 'translateX(0)' },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('cubic-bezier(0.32,0.72,0,1)')
      .duration(260)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  readonly leaveAnimation = (baseEl: HTMLElement): Animation =>
    this.enterAnimation(baseEl).direction('reverse');
}
