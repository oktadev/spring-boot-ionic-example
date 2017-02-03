import { Component } from '@angular/core';
import { ModalController, ToastController } from 'ionic-angular';
import { BeerService } from '../../providers/beer-service';
import { GiphyService } from '../../providers/giphy-service';
import { BeerModalPage } from './beer-modal';

@Component({
  selector: 'page-beer',
  templateUrl: 'beer.html',
  providers: [BeerService, GiphyService]
})
export class BeerPage {
  private beers: Array<any>;

  constructor(public beerService: BeerService, public giphyService: GiphyService,
              public modalCtrl: ModalController, public toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    this.beerService.getGoodBeers().subscribe(beers => {
      this.beers = beers;
      for (let beer of this.beers) {
        this.giphyService.get(beer.name).subscribe(url => {
          beer.giphyUrl = url
        });
      }
    })
  }

  openModal(beerId) {
    let modal = this.modalCtrl.create(BeerModalPage, beerId);
    modal.present();
    // refresh data after modal dismissed
    modal.onDidDismiss(() => this.ionViewDidLoad())
  }

  remove(beer) {
    this.beerService.remove(beer.id).subscribe(response => {
      for (let i = 0; i < this.beers.length; i++) {
        if (this.beers[i] === beer) {
          this.beers.splice(i, 1);
          let toast = this.toastCtrl.create({
            message: 'Beer "' + beer.name + '" deleted.',
            duration: 2000,
            position: 'top'
          });
          toast.present();
        }
      }
    });
  }
}
