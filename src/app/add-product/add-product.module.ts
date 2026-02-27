import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AddProductPage } from './add-product.page';
import { AddProductPageRoutingModule } from './add-product-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, AddProductPageRoutingModule],
  declarations: [AddProductPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddProductPageModule {}
