import { Component, ViewChild } from '@angular/core';
import { LoginComponent} from 'angular-stormpath';
import { NavController } from 'ionic-angular';
import { Stormpath, LoginService } from 'angular-stormpath';
import { ForgotPasswordPage } from '../forgot/forgot';
import { RegisterPage } from '../register/register';

@Component({
  selector: 'page-login',
  templateUrl: './login.html'
})
export class LoginPage extends LoginComponent {
  @ViewChild('email') email;

  constructor(stormpath: Stormpath, loginService: LoginService, private nav: NavController) {
    super(stormpath, loginService);
  }

  forgot() {
    this.nav.push(ForgotPasswordPage);
  }

  register() {
    this.nav.push(RegisterPage);
  }

  ionViewDidLoad() {
    setTimeout(() => {
      this.email.setFocus();
    },150);
  }
}
