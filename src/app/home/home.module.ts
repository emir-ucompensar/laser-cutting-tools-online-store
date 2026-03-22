import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { HomeWebNavbarComponent } from './components/home-web-navbar/home-web-navbar.component';
import { HomeMobileFooterComponent } from './components/home-mobile-footer/home-mobile-footer.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProfileSideModalComponent } from './components/profile-side-modal/profile-side-modal.component';

import { HomePageRoutingModule } from './home-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage,
    HomeWebNavbarComponent,
    HomeMobileFooterComponent,
    ProductCardComponent,
    ProfileSideModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePageModule {}
