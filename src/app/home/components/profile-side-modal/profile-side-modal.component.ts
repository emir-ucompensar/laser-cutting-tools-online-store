import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Animation, createAnimation } from '@ionic/angular';

@Component({
  selector: 'app-profile-side-modal',
  templateUrl: './profile-side-modal.component.html',
  styleUrls: ['./profile-side-modal.component.scss'],
  standalone: false,
})
export class ProfileSideModalComponent {
  @Input() isOpen = false;
  @Input() userEmail = '';
  @Output() closeModal = new EventEmitter<void>();
  @Output() deleteAccount = new EventEmitter<void>();

  onCloseClick(event: Event): void {
    event.preventDefault();
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
