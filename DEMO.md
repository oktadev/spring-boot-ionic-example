## Spring Boot API

Create your Spring Boot API project using [start.spring.io](https://start.spring.io) or the command line.

```
http https://start.spring.io/starter.zip \
dependencies==data-jpa,data-rest,h2,web,devtools -d
```

1. Open project in IntelliJ IDEA. Create a `Beer` entity class in `src/main/java/com/example/demo/beer`. → **boot-entity**
2. Create a JPA Repository to manage the `Beer` entity (tip: `@RepositoryRestResource`). → **boot-repository**
3. Create a CommandLineRunner to populate the database. → **boot-command**
4. Add default data in the `run()` method. → **boot-add**
5. Create a `BeerController` for your REST API. Add some business logic that results in a `/good-beers` endpoint. → **boot-controller**
6. Add a `/good-beers` mapping that filters out beers that aren't great. → **boot-good**

## Create Ionic App

Install Ionic and Cordova: 

```
yarn global add cordova ionic
```

From a terminal window, create a new application using the following command:

```
ionic start ionic-beer
cd ionic-beer
ionic serve
```

## Build a Good Beers UI

1. Run `ionic generate page beer`. 
2. Add `BeerPageModule` to the `imports` list in `app.module.ts`.
3. Create `src/providers/beer-service.ts`. → **io-beer-service**
5. Modify `beer.html` to show the list of beers. → **io-beer-list**
6. Update `beer.ts` to import `BeerService` and add as a provider. Call the `getGoodBeers()` method in the `ionViewDidLoad()` lifecycle method. → **io-get-good-beers**
7. To expose this page on the tab bar, add it to `tabs.ts`. Update `tabs.html` too!

If you run `ionic serve`, you’ll likely see a CORS error in your browser’s console. To fix this, open your `BeerController` and add the following line to the good beers endpoint.

```
@CrossOrigin(origins = {"http://localhost:8100","file://"})
```

Restart Spring Boot and your Ionic app. 

Add some fun with Giphy! Create `giphy-service.ts`. → **ng-giphy-service**

Update `beer.ts` to take advantage of `GiphyService`. → **ng-giphy-foreach**

Update `beer.html` to display the image retrieved. → **io-avatar**

If everything works as expected, you should see a page with a list of beers and images.

### Add a Modal for Editing

Change the header in `beer.html` to have a button that opens a modal to add a new beer. → **io-open-modal**

In this same file, change `<ion-item>` to have a click handler for opening the modal for the current item.

```html
<ion-item (click)="openModal({id: beer.id})">
```

Add `ModalController` as a dependency in `BeerPage` and add an `openModal()` method. → **io-open-modal-ts**

This won't compile because `BeerModalPage` doesn't exist. Create `beer-modal.ts` in the same directory. → **io-beer-modal**

Create `beer-modal.html` as a template for this page. → **io-beer-modal-html**

Import `BeerModalPage` in `beer.ts` and add it to the `declarations` and `entryComponents` lists in `beer.module.ts`.

You'll also need to modify `beer-service.ts` to have `get()` and `save()` methods. → **io-get-save**

Demo how editing fails, then add `CrossOrigin` annotation to `BeerRepository`.

```java
@CrossOrigin(origins = {"http://localhost:8100","file://"})
```

### Add Swipe to Delete

To add swipe-to-delete functionality on the list of beers, open `beer.html` and make it so `<ion-item-sliding>` wraps `<ion-item>` and contains the `*ngFor`. → **io-swipe**

Add a `remove()` method to `beer.ts`. → **io-remove**

Add `toastCtrl: ToastController` as a dependency in the constructor so everything compiles.

After making these additions, you should be able to add, edit and delete beers.

## PWAs with Ionic

Run the [Lighthouse Chrome extension](https://developers.google.com/web/tools/lighthouse/) on this application. To register a service worker, and improve the app’s score, uncomment the `serviceWorker` block in `index.html`.

After making this change, the score should improve. In my tests, it increased to 75/100.  

If you refresh the app and Chrome doesn’t prompt you to install the app (a PWA feature), you probably need to turn on a couple of features. 

```
chrome://flags/#bypass-app-banner-engagement-checks
chrome://flags/#enable-add-to-shelf
```

After enabling these flags, you’ll see an error in your browser’s console about `assets/imgs/logo.png` not being found. This files is referenced in `src/manifest.json`. You can fix this by copying a 512x512 PNG into this location or by modifying `manifest.json` accordingly.

## Deploy to a Mobile Device

To see how your application will look on different devices you can run `ionic serve --lab`. The `--lab` flag opens opens a page in your browser that lets you see how your app looks on different devices. 

### iOS

To emulate or deploy to an iOS device, you’ll need a Mac and a fresh installation of [Xcode](https://developer.apple.com/xcode/). If you’d like to build iOS apps on Windows, Ionic offers an [Ionic Package](http://ionic.io/cloud#packaging) service.

```
npm install -g ios-sim
ionic cordova emulate ios
```

If this fails, run the following to open/deploy the project.

```
open platforms/ios/MyApp.xcodeproj
```

The biggest problem I found when running the app in Simulator was that it was difficult to get the keyboard to popup. To workaround this, I used Edit > Hardware > Keyboard > Toggle Software Keyboard when I needed to type text in a field.

In order to deploy the app to a phone, you'll need to deploy the backend to a public server. Copy `deploy.sh` from 
[spring-boot-ionic-example](https://github.com/oktadeveloper/spring-boot-ionic-example) and run it to deploy the backend
to Cloud Foundry.

If this fails, run the following to open/deploy the project.

```
open platforms/ios/MyApp.xcodeproj
```

Select your phone as the target in Xcode and click the play button to run your app. 

### Android

To deploy to the Android emulator, run `ionic cordova emulate android`.

```
AVD Name: TestPhone
Device: Nexus 5
Target: Android 7.1.1
CPU/ABI: Google APIs Intel Axom (x86_64)
Skin: Skin with dynamic hardware controls
```
