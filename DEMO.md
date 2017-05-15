Spring Boot, Ionic, and Stormpath

This demo script shows pre-recorded IntelliJ Live Template shortcuts to build an Ionic and Spring Boot app. **Prerequisites**: Java 8, Node.js.

## Spring Boot API

Create your Spring Boot API project using [start.spring.io](https://start.spring.io).

```
http https://start.spring.io/starter.zip \
dependencies==data-jpa,data-rest,h2,web,devtools -d
```

1. Run the application with `./mvnw spring-boot:run`. Create a `Beer` entity class in `src/main/java/com/example/beer`. → **boot-entity**
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
ionic start ionic-beer --v2
cd ionic-beer
ionic serve
```
<!--
Tell Cordova it’s OK to display the keyboard without user interaction by adding the following to `config.xml` in the root directory. → **io-keyboard**

```xml
<preference name="KeyboardDisplayRequiresUserAction" value="false"/>
```
-->

Check your changes into Git.

```
git add .
git commit -m "Create client"
```

## Build a Good Beers UI

1. Run `ionic generate page beer` to create a component and a template to display the list of good beers. 
2. Add `BeerPage` to the `declarations` and `entryComponent` lists in `app.module.ts`.
3. Run `ionic generate provider beer-service` to create a service to fetch the beer list from the Spring Boot API.
4. Change `src/providers/beer-service.ts` to use have a `getGoodBeers()` method. → **io-beer-service**
5. Modify `beer.html` to show the list of beers. → **io-beer-list**
6. Update `beer.ts` to import `BeerService` and add as a provider. Call the `getGoodBeers()` method in the `ionViewDidLoad()` lifecycle method. → **io-get-good-beers**
7. To expose this page on the tab bar, add it to `tabs.ts`. Update `tabs.html` too!

If you run `ionic serve`, you’ll likely see a CORS error in your browser’s console. To fix this, open your `BeerController` and add the following line to the good beers endpoint.

```
@CrossOrigin(origins = {"http://localhost:8100","file://"})
```

Restart Spring Boot and your Ionic app. 

Add some fun with Giphy! Run `ionic generate provider giphy-service`. → **ng-giphy-service**

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

Add `BeerModalPage` to the `declarations` and `entryComponent` lists in `app.module.ts`.

You'll also need to modify `beer-service.ts` to have `get()` and `save()` methods. → **io-get-save**

### Add Swipe to Delete

To add swipe-to-delete functionality on the list of beers, open `beer.html` and make it so `<ion-item-sliding>` wraps `<ion-item>` and contains the `*ngFor`. → **io-swipe**

Add a `remove()` method to `beer.ts`. → **io-remove**

Add `toastCtrl: ToastController` as a dependency in the constructor so everything compiles.

After making these additions, you should be able to add, edit and delete beers.

## PWAs with Ionic

Run the [Lighthouse Chrome extension](https://developers.google.com/web/tools/lighthouse/) on this application. To register a service worker, and improve the app’s score, uncomment the `serviceWorker` block in `index.html`.

After making this change, the score should improve. In my tests, it increased to 69/100.  

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
ionic platform add ios
```

You’ll need to run `ionic emulate ios` to open your app in Simulator.

The biggest problem I found when running the app in Simulator was that it was difficult to get the keyboard to popup. To workaround this, I used Edit > Hardware > Keyboard > Toggle Software Keyboard when I needed to type text in a field.

To deploy the app to an iPhone, start by plugging your iOS device into your computer. Then run the following commands to install ios-deploy/ios-sim, build the app, and run it on your device.

```
npm install -g ios-deploy ios-sim
ionic build ios
cd platforms/ios/
open ionic-beer.xcodeproj
```

Select your phone as the target in Xcode and click the play button to run your app. 

### Android

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
