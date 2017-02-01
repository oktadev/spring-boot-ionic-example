import { BeerService } from '../../providers/beer-service';
import { Component, ViewChild } from '@angular/core';
import { GiphyService } from '../../providers/giphy-service';
import { NavParams, ViewController, ToastController, NavController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { BeerPage } from './beer';

@Component({
  templateUrl: './beer-modal.html'
})
export class BeerModalPage {
  @ViewChild('name') name;
  beer: any = {};
  error: any;

  constructor(public beerService: BeerService,
              public giphyService: GiphyService,
              public params: NavParams,
              public viewCtrl: ViewController,
              public toastCtrl: ToastController,
              public navCtrl: NavController) {
    if (this.params.data.id) {
      this.beerService.get(this.params.get('id')).subscribe(beer => {
        this.beer = beer;
        this.beer.href = beer._links.self.href;
        this.giphyService.get(beer.name).subscribe(url => beer.giphyUrl = url);
      });
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  save(form: NgForm) {
    let update: boolean = form['href'];
    this.beerService.save(form).subscribe(result => {
      let toast = this.toastCtrl.create({
        message: 'Beer "' + form.name + '" ' + ((update) ? 'updated' : 'added') + '.',
        duration: 2000
      });
      toast.present();
      this.dismiss();
    }, error => this.error = error)
  }

  ionViewDidLoad() {
    setTimeout(() => {
      this.name.setFocus();
    },150);
  }
}
