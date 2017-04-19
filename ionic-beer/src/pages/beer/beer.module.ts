import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { BeerPage } from './beer';
import { BeerModalPage } from './beer-modal';
import { BeerService } from '../../providers/beer-service';
import { GiphyService } from '../../providers/giphy-service';

@NgModule({
  declarations: [
    BeerPage,
    BeerModalPage
  ],
  imports: [
    IonicModule.forRoot(BeerPage)
  ],
  exports: [
    BeerPage,
    BeerModalPage
  ],
  providers: [
    BeerService,
    GiphyService
  ]
})
export class BeerModule {}
