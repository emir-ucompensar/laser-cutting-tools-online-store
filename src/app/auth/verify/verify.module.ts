import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { VerifyPageRoutingModule } from './verify-routing.module';
import { VerifyPage } from './verify.page';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, VerifyPageRoutingModule],
  declarations: [VerifyPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VerifyPageModule {}
