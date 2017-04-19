# Tutorial: Develop a Mobile App with Ionic and Spring Boot

Ionic 3.0 was [recently released](http://blog.ionic.io/ionic-3-0-has-arrived/), with support for 
Angular 4, TypeScript 2.2, and lazy loading. Ionic, often called Ionic framework, is an open source
(MIT-licensed) project that simplifies building native and progressive web apps. When developing an Ionic app, you'll use Angular and have access to native APIs via [Ionic Native](https://ionicframework.com/docs/native/) and [Apache Cordova](https://cordova.apache.org/). This means you can develop slick-looking UIs using the technologies you know and love: HTML, CSS, and JavaScript/TypeScript.

This tutorial shows how to build a Spring Boot API, how to build an Ionic app, and how to deploy it to a mobile device.

**Prerequisites**: [Java 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and [Node.js](https://nodejs.org) installed.

## Create a Project

To begin, create a directory on your hard drive called `spring-boot-ionic-example`. During this tutorial, you will create `server` and `ionic-beer` directories to hold the server and client applications, respectively.  

## Spring Boot API

I recently wrote about how to build a Spring Boot API in a [QuickStart Guide to Spring Boot with Angular]. Rather than covering that again, you can clone the existing project and copy the `server` directory into `spring-boot-ionic-example`.

```bash
git clone https://github.com/oktadeveloper/spring-boot-angular-example.git
cp -r spring-boot-angular-example/server ~/spring-boot-ionic-example/.
```

This project contains a `beers` API that allows you to <abbr title="Create, Read, Update, and Delete">CRUD</abbr> a list of beer names. It also contains a `/good-beers` endpoint that filters out less-than-great beers.

The default list of beers is created by a `BeerCommandLineRunner` class:

```java
@Component
class BeerCommandLineRunner implements CommandLineRunner {
    private final BeerRepository repository;

    public BeerCommandLineRunner(BeerRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... strings) throws Exception {
        // Top beers from https://www.beeradvocate.com/lists/top/
        Stream.of("Kentucky Brunch Brand Stout", "Good Morning", "Very Hazy", "King Julius",
                "Budweiser", "Coors Light", "PBR").forEach(name ->
                repository.save(new Beer(name))
        );
        repository.findAll().forEach(System.out::println);
    }
}
```

The `BeerRepository` interface is decorated with `@RepositoryRestResource` to expose CRUD endpoints for the `Beer` entity.

```java
@RepositoryRestResource
interface BeerRepository extends JpaRepository<Beer, Long> {}
```

The last piece of the API is the `BeerController` that exposes `/good-beers` and specifies cross-origin resource sharing (CORS) settings.

```java
@RestController
public class BeerController {
    private BeerRepository repository;

    public BeerController(BeerRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/good-beers")
    @CrossOrigin(origins = "http://localhost:4200")
    public Collection<Map<String, String>> goodBeers() {

        return repository.findAll().stream()
                .filter(this::isGreat)
                .map(b -> {
                    Map<String, String> m = new HashMap<>();
                    m.put("id", b.getId().toString());
                    m.put("name", b.getName());
                    return m;
                }).collect(Collectors.toList());
    }

    private boolean isGreat(Beer beer) {
        return !beer.getName().equals("Budweiser") &&
                !beer.getName().equals("Coors Light") &&
                !beer.getName().equals("PBR");
    }
}
```

You should be able to start the `server` application by running it in your favorite IDE or from the command line using `mvn spring-boot:run`. If you don't have Maven installed, you can use the Maven wrapper that's included in the project (`./mvnw spring-boot:run` on *nix, `\mvnw spring-boot:run` on Windows).

After the app has started, navigate to <http://localhost:8080/good-beers>. You should see the list of good beers in your browser.

![Good Beers JSON](static/good-beers-json.png) 

## Create Ionic App

To create an Ionic app to display data from your API, you'll first need to install Ionic CLI and Cordova: 

```bash
npm install -g ionic cordova
```

The [Ionic CLI](http://ionicframework.com/docs/cli/) is a command-line tool that greatly reduces the time it takes to develop an Ionic app. It’s like a Swiss Army Knife: It brings together a bunch of miscellaneous tools under a single interface. The CLI contains a number of useful commands for Ionic development, such as `start`, `build`, `generate`, `serve`, and `run`.

After installation completes, create a new application using the following command:

```bash
ionic start ionic-beer --v2
```

This may take a minute or two to complete, depending on your internet connection speed. In the same terminal window, change to be in your application’s directory and run it.

```bash
cd ionic-beer
ionic serve
```

This will open your default browser on [http://localhost:8100](http://localhost:8100). You can click through the tabbed interface to see the default structure of the app.

![Ionic shell with tabs](static/ionic-tabs.png)

## Create a Good Beers UI

Run `ionic generate page beer` to create a component and a template to display the list of good beers. This creates a number of files in `src/app/pages/beer`:

```
beer.html
beer.module.ts
beer.scss
beer.ts
```

Open `beer.ts` and change the name of the class to be `BeerPage`.

```typescript
export class BeerPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BeerPage');
  }

}
```

Modify `beer.module.ts` to change the class name too.

```typescript
import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { BeerPage } from './beer';

@NgModule({
  declarations: [
    BeerPage
  ],
  imports: [
    IonicModule.forRoot(BeerPage),
  ],
  exports: [
    BeerPage
  ]
})
export class BeerModule {}
```

Add `BeerModule` to the `imports` list in `app.module.ts`.

```typescript
import { BeerModule } from '../pages/beer/beer.module';

@NgModule({
  ...
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    BeerModule
  ],
  ...
})
```

Run `ionic g provider beer-service` to create a service to fetch the beer list from the Spring Boot API.

Change `src/providers/beer-service.ts` to have constants for the API path and add a `getGoodBeers()` method.

```typescript
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

@Injectable()
export class BeerService {
  public API = 'http://localhost:8080';
  public BEER_API = this.API + '/beers';

  constructor(private http: Http) {}

  getGoodBeers(): Observable<any> {
    return this.http.get(this.API + '/good-beers')
      .map((response: Response) => response.json());
  }
}
```

Modify `beer.html` to show the list of beers.

```html
<ion-header>
  <ion-navbar>
    <ion-title>Good Beers</ion-title>
  </ion-navbar>

</ion-header>

<ion-content padding>
  <ion-list>
    <ion-item *ngFor="let beer of beers">
      <h2>{{beer.name}}</h2>
    </ion-item>
  </ion-list>
</ion-content>
```

Modify `beer.module.ts` to import `BeerService` and add it as a provider. You could add it as a provider in each component, but adding it in the module allows all components to use it. 

```typescript
import { BeerService } from '../../providers/beer-service';

@NgModule({
  ...
  providers: [
    BeerService
  ]
})
```

Update `beer.ts` to import `BeerService` and add it as a dependency in the constructor. Call the `getGoodBeers()` method in the `ionViewDidLoad()` lifecycle method.

```typescript
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BeerService } from '../../providers/beer-service';

@IonicPage()
@Component({
  selector: 'page-beer',
  templateUrl: 'beer.html'
})
export class BeerPage {
  private beers: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public beerService: BeerService) {
  }

  ionViewDidLoad() {
    this.beerService.getGoodBeers().subscribe(beers => {
      this.beers = beers;
    })
  }
}
```

To expose this page on the tab bar, add it to `tabs.ts`

```typescript
import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { BeerPage } from '../beer/beer';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any = HomePage;
  tab2Root: any = BeerPage;
  tab3Root: any = ContactPage;
  tab4Root: any = AboutPage;

  constructor() {}
}
```

You'll also need to update `tabs.html` to have the new tab order.

```html
<ion-tabs>
  <ion-tab [root]="tab1Root" tabTitle="Home" tabIcon="home"></ion-tab>
  <ion-tab [root]="tab2Root" tabTitle="Beer" tabIcon="beer"></ion-tab>
  <ion-tab [root]="tab3Root" tabTitle="Contact" tabIcon="contacts"></ion-tab>
  <ion-tab [root]="tab4Root" tabTitle="About" tabIcon="information-circle"></ion-tab>
</ion-tabs>
```

### Add Some Fun with Animated GIFs

Run `ionic g provider giphy-service` to generate a `GiphyService` class. Replace the code in `src/providers/giphy-service.ts` with code that searches Giphy's API:

```typescript
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
// http://tutorials.pluralsight.com/front-end-javascript/getting-started-with-angular-2-by-building-a-giphy-search-application
export class GiphyService {

  // Public beta key: https://github.com/Giphy/GiphyAPI#public-beta-key
  giphyApi = 'https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=';

  constructor(public http: Http) {
  }

  get(searchTerm): Observable<any> {
    let apiLink = this.giphyApi + searchTerm;
    return this.http.request(apiLink).map((res: Response) => {
      let results = res.json().data;
      if (results.length > 0) {
        return results[0].images.original.url;
      } else {
        return 'https://media.giphy.com/media/YaOxRsmrv9IeA/giphy.gif'; // dancing cat for 404
      }
    });
  }
}
```

Update `beer.module.ts` to import `GiphyService` and include it is as a provider.

```typescript
import { GiphyService } from '../../providers/giphy-service';

@NgModule({
  ...
  providers: [
    BeerService,
    GiphyService
  ]
})
```

Modify `beer.ts` to import `GiphyService` and set a `giphyUrl` on each beer.

```typescript
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BeerService } from '../../providers/beer-service';
import { GiphyService } from '../../providers/giphy-service';

@IonicPage()
@Component({
  selector: 'page-beer',
  templateUrl: 'beer.html'
})
export class BeerPage {
  private beers: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public beerService: BeerService, public giphyService: GiphyService) {
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
}
```

Update `beer.html` to display the image retrieved:

```html
<ion-item *ngFor="let beer of beers">
  <ion-avatar item-left>
    <img src="{{beer.giphyUrl}}">
  </ion-avatar>
  <h2>{{beer.name}}</h2>
</ion-item>
```

Start the Spring Boot app in one terminal and run `ionic serve` in another. Open <http://localhost:8100> in your browser. Click on the Beer icon and you'll likely see an error in your browser.

```
Uncaught (in promise): Error: No provider for Http! 
```

![No provider for Http!](static/no-http-provider.png)

This highlights one of the slick features of Ionic: errors are displayed in your browser, not just the browser's console. Add `HttpModule` to the list of imports in `src/app/app.module.ts` to solve this issue.

```typescript
import { HttpModule } from '@angular/http';

@NgModule({
  ...
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    BeerModule
  ],
```

After making this change, you’ll likely see the following error in your browser’s console.

```
XMLHttpRequest cannot load http://localhost:8080/good-beers. No 'Access-Control-Allow-Origin' 
header is present on the requested resource. Origin 'http://localhost:8100' is therefore 
not allowed access. The response had HTTP status code 401.
```

To fix this, open your Spring Boot application's `BeerController.java` class and change its `@CrossOrigin` annotation to allow `http://localhost:8100` and `file://`. This enables cross-origin resource sharing (CORS) from both the browser and the mobile client.

```java
@CrossOrigin(origins = {"http://localhost:8100","file://"})
public Collection<Map<String, String>> goodBeers() {
```

Recompile this class and DevTools should restart the application.

If everything works as expected, you should see a page similar to the one below in your browser.

![Good Beers UI](static/good-beers-ui.png)

### Add a Modal for Editing

Change the header in `beer.html` to have a button that opens a modal to add a new beer.

```html
<ion-header>
  <ion-navbar>
    <ion-title>Good Beers</ion-title>
    <ion-buttons end>
      <button ion-button icon-only (click)="openModal()" color="primary">
        <ion-icon name="add-circle"></ion-icon>
        <ion-icon name="beer"></ion-icon>
      </button>
    </ion-buttons>
  </ion-navbar>
```

In this same file, change `<ion-item>` to have a click handler for opening the modal for the current item.

```html
<ion-item *ngFor="let beer of beers" (click)="openModal({id: beer.id})">
```

Add `ModalController` as a dependency in `BeerPage` and add an `openModal()` method.

```typescript
import { IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';

export class BeerPage {
  private beers: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public beerService: BeerService, public giphyService: GiphyService,
              public modalCtrl: ModalController) {
  }

  // ionViewDidLoad()

  openModal(beerId) {
    let modal = this.modalCtrl.create(BeerModalPage, beerId);
    modal.present();
    // refresh data after modal dismissed
    modal.onDidDismiss(() => this.ionViewDidLoad())
  }
}
```

This won't compile because `BeerModalPage` doesn't exist. Create `beer-modal.ts` in the same directory. This page will retrieve the beer from the `beerId` that's passed in. It will render the name, allow it to be edited, and show the Giphy image found for the name.

```typescript
import { BeerService } from '../../providers/beer-service';
import { Component, ViewChild } from '@angular/core';
import { GiphyService } from '../../providers/giphy-service';
import { NavParams, ViewController, ToastController, NavController } from 'ionic-angular';
import { NgForm } from '@angular/forms';

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
```

Add the import for `BeerModalPage` to `beer.ts`, then create `beer-modal.html` as a template for this page.

```html
<ion-header>
  <ion-toolbar>
    <ion-title>
      {{beer ? 'Beer Details' : 'Add Beer'}}
    </ion-title>
    <ion-buttons start>
      <button ion-button (click)="dismiss()">
        <span ion-text color="primary" showWhen="ios,core">Cancel</span>
        <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
      </button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
<ion-content padding>
  <form #beerForm="ngForm" (ngSubmit)="save(beerForm.value)">
    <input type="hidden" name="href" [(ngModel)]="beer.href">
    <ion-row>
      <ion-col>
        <ion-list inset>
          <ion-item>
            <ion-input placeholder="Beer Name" name="name" type="text"
                       required [(ngModel)]="beer.name" #name></ion-input>
          </ion-item>
        </ion-list>
      </ion-col>
    </ion-row>
    <ion-row>
      <ion-col *ngIf="beer" text-center>
        <img src="{{beer.giphyUrl}}">
      </ion-col>
    </ion-row>
    <ion-row>
      <ion-col>
        <div *ngIf="error" class="alert alert-danger">{{error}}</div>
        <button ion-button color="primary" full type="submit"
                [disabled]="!beerForm.form.valid">Save</button>
      </ion-col>
    </ion-row>
  </form>
</ion-content>
```

Add `BeerModalPage` to the `declarations` and `entryComponent` lists in `beer.module.ts`.

You'll also need to modify `beer-service.ts` to have `get()` and `save()` methods.

```typescript
get(id: string) {
  return this.http.get(this.BEER_API + '/' + id)
    .map((response: Response) => response.json());
}

save(beer: any): Observable<any> {
  let result: Observable<Response>;
  if (beer['href']) {
    result = this.http.put(beer.href, beer);
  } else {
    result = this.http.post(this.BEER_API, beer)
  }
  return result.map((response: Response) => response.json())
    .catch(error => Observable.throw(error));
}
```

At this point, if you try to add or edit a beer name, you'll likely see an error in your browser's console.

```
ModalCmp ionViewPreLoad error: No component factory found for BeerModalPage. 
Did you add it to @NgModule.entryComponents?
```

Add `BeerModalPage` to the list of `entryComponents` in `app.module.ts`. While you're in there, add `BeerService` to the list of global providers so you don't have to add it to each component that uses it.

```typescript
@NgModule({
  ...
  entryComponents: [
    ...
    BeerModalPage
  ],
  providers: [
    BeerService,
    ...
  ]
})
```

Now if you try to edit a beer's name, you'll see another CORS in your browser's console. Add a `@CrossOrigin` annotation to `BeerRepository.java` (in your Spring Boot project) that matches the one in `BeerController`.
 
```java
@RepositoryRestResource
@CrossOrigin(origins = {"http://localhost:8100","file://"})
```

Re-compile and now everything should work as expected. For example, below is a screenshot that shows I added a new beer and what it looks like when editing it.
 
![Mmmmm, Guinness](static/beer-modal.png)

### Add Swipe to Delete

To add swipe-to-delete functionality on the list of beers, open `beer.html` and make it so `<ion-item-sliding>` wraps `<ion-item>` and contains the `*ngFor`. Add a delete button using `<ion-item-options>`.

```html
<ion-content padding>
  <ion-list>
    <ion-item-sliding *ngFor="let beer of beers">
      <ion-item (click)="openModal({id: beer.id})">
        <ion-avatar item-left>
          <img src="{{beer.giphyUrl}}">
        </ion-avatar>
        <h2>{{beer.name}}</h2>
      </ion-item>
      <ion-item-options>
        <button ion-button color="danger" (click)="remove(beer)"><ion-icon name="trash"></ion-icon> Delete</button>
      </ion-item-options>
    </ion-item-sliding>
  </ion-list>
</ion-content>
```

Add a `remove()` method to `beer.ts`.

```typescript
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
```

Add `toastCtrl` as a dependency in the constructor so everything compiles.

```typescript
constructor(public navCtrl: NavController, public navParams: NavParams,
          public beerService: BeerService, public giphyService: GiphyService,
          public modalCtrl: ModalController, public toastCtrl: ToastController) {
}
```

You'll also need to modify `beer-service.ts` to have a `remove()` method.

```typescript
remove(id: string) {
  return this.http.delete(this.BEER_API + '/' + id)
    .map((response: Response) => response.json());
}
```

After making these additions, you should be able to delete beer names. To emulate a left swipe in your browser, click on the item and drag it to the left.

![Left swipe](static/beer-delete.png)

## PWAs with Ionic

Ionic ships with support for creating progressive web apps (PWAs). If you’d like to learn more about what PWAs are, see [Navigating the World of Progressive Web Apps with Ionic 2](http://blog.ionic.io/navigating-the-world-of-progressive-web-apps-with-ionic-2/). This blog post is still relevant for Ionic 3.

If you run the [Lighthouse Chrome extension](https://developers.google.com/web/tools/lighthouse/) on this application, you’ll get a mediocre score (51/100).

![Lighthouse: 51](static/lighthouse-51.png)

To register a service worker, and improve the app’s score, uncomment the following block in `src/index.html`.

```html
<!-- un-comment this code to enable service worker
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('service worker installed'))
    .catch(err => console.log('Error', err));
}
</script>-->
```

After making this change, the score should improve. In my tests, it increased to 66/100. The remaining issues were:

* A couple -1’s in performance for "Cannot read property 'ts' of undefined”.
* Site is not progressively enhanced (page should contain some content when JavaScript is not available). This could likely be solved with [Angular’s app-shell directives](https://www.npmjs.com/package/@angular/app-shell).
* Site is not on HTTPS and does not redirect HTTP to HTTPS.

If you refresh the app and Chrome doesn’t prompt you to install the app (a PWA feature), you probably need to turn on a couple of features. Copy and paste the following URLs into Chrome and enable each feature.

```
chrome://flags/#bypass-app-banner-engagement-checks
chrome://flags/#enable-add-to-shelf
```

After enabling these flags, you’ll see an error in your browser’s console about `assets/imgs/logo.png` not being found. This file is referenced in `src/manifest.json`. You can fix this by copying a 512x512 PNG ([like this one](http://www.iconsdb.com/orange-icons/beer-icon.html)) into this location or by modifying `manifest.json` accordingly. At the very least, you should modify `manifest.json` to have your app's name.

## Deploy to a Mobile Device

It’s pretty cool that you’re able to develop mobile apps with Ionic in your browser. However, it’s nice to see the fruits of your labor and see how awesome your app looks on a phone. It really does look and behave like a native app!

To see how your application will look on different devices you can run `ionic serve --lab`. The `--lab` flag opens opens a page in your browser that lets you see how your app looks on different devices.

![Ionic Labs](static/ionic-labs.png)

### iOS

To emulate or deploy to an iOS device, you’ll need a Mac and a fresh installation of [Xcode](https://developer.apple.com/xcode/). If you’d like to build iOS apps on Windows, Ionic offers an [Ionic Package](http://ionic.io/cloud#packaging) service.

Make sure to open Xcode to complete the installation.

To make your app iOS-capable, add support for it using the following command.

```
ionic platform add ios
```

You’ll need to run `ionic emulate ios` to open your app in Simulator.

The biggest problem I found when running the app in Simulator was that it was difficult to get the keyboard to popup. To workaround this, I used Edit > Hardware > Keyboard > Toggle Software Keyboard when I needed to type text in a field.

To deploy the app to an iPhone, start by plugging your iOS device into your computer. Then run the following commands to install ios-deploy/ios-sim, build the app, and run it on your device. If you've

```
npm install -g ios-deploy ios-sim
ionic build ios
cd platforms/ios/
open ionic-beer.xcodeproj
```

Select your phone as the target in Xcode and click the play button to run your app. The first time you do this, Xcode may spin for a while with a “Processing symbol files” message at the top.

Deploying to your phone will likely fail because it won't be able to connect to `http://localhost:8080`. To fix this, copy [this script](./deploy.sh) to your hard drive. It expects to be in a directory above your apps. It also expects your apps to be named `ionic-beer` and `server`.

If you don't have a Cloud Foundry account, you'll need to [create one](https://account.run.pivotal.io/z/uaa/sign-up) and install its command line tools for this script to work.

```
brew tap cloudfoundry/tap && brew install cf-cli
```

Once you’re configured your phone, computer, and Apple ID to work, you should be able to open the app and see the beer list you created. Below is how it looks on my iPhone 6s Plus.

![iPhone Beer List](static/iphone-beer-list.png)

### Android

To emulate or deploy to an Android device, you’ll first need to install [Android Studio](https://developer.android.com/studio/index.html). As part of the install, it will show you where it installed the Android SDK. Set this path as an ANDROID_HOME environment variable. On a Mac, it should be `~/Library/Android/sdk/`.

Make sure to open Android Studio to complete the installation.

To deploy to the Android emulator, add support for it to the ionic-beer project using the `ionic` command.

```
ionic platform add android
```

If you run `ionic emulate android` you’ll get instructions from about how to create an emulator image.

```
Error: No emulator images (avds) found.
1. Download desired System Image by running: /Users/mraible/Library/Android/sdk/tools/android sdk
2. Create an AVD by running: /Users/mraible/Library/Android/sdk/tools/android avd
HINT: For a faster emulator, use an Intel System Image and install the HAXM device driver
```

Run the first suggestion and download your desired system image. Then  run the second command and created an AVD with the following settings:

```
AVD Name: TestPhone
Device: Nexus 5
Target: Android 7.1.1
CPU/ABI: Google APIs Intel Axom (x86_64)
Skin: Skin with dynamic hardware controls
```

After performing these steps, you should be able to run `ionic emulate android` and see your app running in the AVD.

![Android Beer List](static/android-beer-list.png)

## Learn More

I hope you’ve enjoyed this tour of Ionic and Angular. I like how Ionic takes your web development skills up a notch and allows you to create mobile applications that look and behave natively.

You can find a completed version of the application created in this blog post [on GitHub](https://github.com/oktadeveloper/spring-boot-ionic-example).

If you encountered issues, please [create an issue in GitHub](TODO) or hit me up on Twitter [@mraible](https://twitter.com/mraible).

To learn more about Ionic or Angular, please see the following resources:

* [Get started with Ionic Framework](http://ionicframework.com/getting-started/)
* [Angular Authentication with OpenID Connect and Okta in 20 Minutes](http://developer.okta.com/blog/2017/04/17/angular-authentication-with-oidc)
* [Getting Started with Angular](https://www.youtube.com/watch?v=Jq3szz2KOOs) A YouTube webinar by yours truly. ;)
