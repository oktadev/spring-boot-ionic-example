import { Component } from '@angular/core';
import { RegisterComponent } from 'angular-stormpath';

@Component({
  selector: 'page-register',
  templateUrl: './register.html'
})
export class RegisterPage extends RegisterComponent {

  // fix for view model not always loading
  ionViewDidLoad(): void {
    super.ngOnInit();
  }
}
