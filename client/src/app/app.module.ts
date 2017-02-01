import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { StormpathConfiguration, StormpathModule } from 'angular-stormpath';
import { LoginPage } from '../pages/auth/login/login';
import { ForgotPasswordPage } from '../pages/auth/forgot/forgot';
import { RegisterPage } from '../pages/auth/register/register';
import { BeerPage } from '../pages/beer/beer';
import { BeerService } from '../providers/beer-service';
import { GiphyService } from '../providers/giphy-service';
import { BeerModalPage } from '../pages/beer/beer-modal';

export function stormpathConfig(): StormpathConfiguration {
  let spConfig: StormpathConfiguration = new StormpathConfiguration();
  spConfig.endpointPrefix = 'http://localhost:8080';
  spConfig.autoAuthorizedUris.push(new RegExp('http://localhost:8080/*'));
  return spConfig;
}

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    ForgotPasswordPage,
    RegisterPage,
    BeerPage,
    BeerModalPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    StormpathModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    ForgotPasswordPage,
    RegisterPage,
    BeerPage,
    BeerModalPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: StormpathConfiguration, useFactory: stormpathConfig},
    BeerService, GiphyService
  ]
})
export class AppModule {}
