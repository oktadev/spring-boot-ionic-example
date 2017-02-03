# Spring Boot, Ionic, and Stormpath

This tutorial shows how to build a secure Spring Boot API with Stormpath. It also shows how to build an Ionic app that securely connects to this API and can be deployed to a mobile device.

## Spring Boot API

Create your Spring Boot API project using [start.spring.io](https://start.spring.io).

```
http https://start.spring.io/starter.zip \
dependencies==data-jpa,data-rest,h2,web,devtools,security,stormpath -d
```

Run the application with `./mvnw spring-boot:run`.

Create a `Beer` entity class in `src/main/java/com/example/beer`.

```java
package com.example.beer;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class Beer {

    @Id
    @GeneratedValue
    private Long id;
    private String name;

    public Beer() {
    }

    public Beer(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Beer{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
```

Create a JPA Repository to manage the `Beer` entity.

```java
package com.example.beer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
interface BeerRepository extends JpaRepository<Beer, Long> {
}
```

Create a CommandLineRunner to populate the database.

```java
package com.example.beer;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.stream.Stream;

@Component
class BeerCommandLineRunner implements CommandLineRunner {

    public BeerCommandLineRunner(BeerRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... strings) throws Exception {
        // top 5 beers from https://www.beeradvocate.com/lists/top/
        Stream.of("Good Morning", "Kentucky Brunch Brand Stout", "ManBearPig", "King Julius",
                "Very Hazy", "Budweiser", "Coors Light", "PBR").forEach(name ->
                repository.save(new Beer(name))
        );
        System.out.println(repository.findAll());
    }

    private final BeerRepository repository;
}
```

Create a `BeerController` for your REST API. Add some business logic that results in a `/good-beers` endpoint.

```java
package com.example.beer;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class BeerController {
    private BeerRepository repository;

    public BeerController(BeerRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/good-beers")
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

Access the API using `http localhost:8080/good-beers --auth <user>:<password>`.

## Ionic App

Install Ionic and Cordova: `yarn global add cordova ionic`

From a terminal window, create a new application using the following command:

```
ionic start ionic-auth --v2
```

This may take a minute or two to complete, depending on your internet connection speed. In the same terminal window, change to be in your application’s directory and run it.

```
cd ionic-auth
ionic serve
```

This will open your default browser on (http://localhost:8100). You can use Chrome’s device toolbar to see what the application will look like on most mobile devices.

Stormpath allows you to easily integrate authentication into an Ionic 2 application. It also provides [integration for a number of backend frameworks](https://docs.stormpath.com/), making it easy to verify the JWT you get when logging in. 

Thanks to the [recent release of Stormpath's Client API](https://stormpath.com/blog/client-api-authentication-mobile-frontend), you can now authenticate directly without needing to hit your server with a Stormpath SDK integration installed. This article shows you how to do just that in an Ionic application.

Install the [Angular components for Stormpath](https://github.com/stormpath/stormpath-sdk-angular) using npm.

```
yarn add angular-stormpath
```

Modify `app.module.ts` to import the appropriate Stormpath classes from `angular-stormpath`. Create a function to configure the `endpointPrefix` to point to the DNS label for your Client API instance. You can find and configure your DNS label by logging into https://api.stormpath.com and navigating to Applications > My Application > Policies > Client API > DNS Label. Since mine is “raible”, I’ll be using `raible.apps.stormpath.io` for this example.

Make sure to specify Stormpath's pre-built Ionic pages in `entryComponents`.


```typescript
import {
  StormpathConfiguration, StormpathModule, StormpathIonicModule,
  LoginPage, RegisterPage, ForgotPasswordPage
} from 'angular-stormpath';
...
export function stormpathConfig(): StormpathConfiguration {
  let spConfig: StormpathConfiguration = new StormpathConfiguration();
  spConfig.endpointPrefix = 'https://raible.apps.stormpath.io';
  return spConfig;
}

@NgModule({
  ...
  imports: [
    IonicModule.forRoot(MyApp),
    StormpathModule,
    StormpathIonicModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ...
    LoginPage,
    ForgotPasswordPage,
    RegisterPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: StormpathConfiguration, useFactory: stormpathConfig}
  ]
})
export class AppModule {}
```

To render a login page before users can view the application, you can modify `src/app/app.component.ts` to use the `Stormpath` service and navigate to Stormpath's `LoginPage` if the user is not authenticated. 

```typescript
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { TabsPage } from '../pages/tabs/tabs';
import { Stormpath, LoginPage } from 'angular-stormpath';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage;

  constructor(platform: Platform, private stormpath: Stormpath) {
    stormpath.user$.subscribe(user => {
      if (!user) {
        this.rootPage = LoginPage;
      } else {
        this.rootPage = TabsPage;
      }
    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }
}
```

After making these changes, you can run `ionic serve`, but you’ll likely see something similar to the following error in your browser’s console.

```
XMLHttpRequest cannot load https://raible.apps.stormpath.io/me. Response to preflight request
doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on 
the requested resource. Origin 'http://localhost:8100 is therefore not allowed access. 
The response had HTTP status code 403.
```

To fix this, you’ll need to login to https://api.stormpath.com, and navigate to Applications > My Application, and modify the **Authorized Origin URIs** to include `http://localhost:8100`. 

At this point, you should see a login screen when you run `ionic serve`.

![Stormpath Login for Ionic](./static/ionic-login.png)

If you don’t see this screen, it’s possible you’re still logged in. Clearing your local storage will fix this, or you can continue below to add the ability to logout.

In `src/pages/home.html`, add a logout link to the header and a paragraph in the content section that shows the currently logged in user.

```html
<ion-header>
  <ion-navbar>
    <ion-title>Home</ion-title>
    <ion-buttons end>
      <button ion-button icon-only (click)="logout()">
        Logout
      </button>
    </ion-buttons>
  </ion-navbar>
</ion-header>

<ion-content padding>
  ...
  <p *ngIf="(user$ | async)">
    You are logged in as: <b>{{ ( user$ | async ).fullName }}</b>
  </p>
</ion-content>
```

If you login, the “Logout” button will render, but won’t work because there’s no `logout()` method in `src/pages/home.ts`. Similarly, the “You are logged in” message won’t appear because there’s no `user$` variable defined. Change the body of `home.ts` to retrieve `user$` from the `Stormpath` service and define the `logout()` method.

```typescript
import { Account, Stormpath } from 'angular-stormpath';
import { Observable } from 'rxjs';
...
export class HomePage {
  user$: Observable<Account | boolean>;

  constructor(private stormpath: Stormpath) {
    this.user$ = this.stormpath.user$;
  }

  logout(): void {
    this.stormpath.logout();
  }
}
```

If you’re logged in, you should see a screen with a logout button and the name of the currently logged in user.

![Logged in as: Hip User](./static/ionic-home.png)

The `LoginPage` tries to auto-focus onto the `email` field when it loads. To auto-activate the keyboard you'll need to tell Cordova it’s OK to display the keyboard without user interaction. You can do this by adding the following to `config.xml` in the root directory.

```xml
<preference name="KeyboardDisplayRequiresUserAction" value="false" />
```

## PWAs with Ionic

Ionic 2 ships with support for creating progressive web apps (PWAs). If you’d like to learn more about what PWAs are, see [Navigating the World of Progressive Web Apps with Ionic 2](http://blog.ionic.io/navigating-the-world-of-progressive-web-apps-with-ionic-2/). 

If you run the [Lighthouse Chrome extension](https://developers.google.com/web/tools/lighthouse/) on this application, you’ll get a mediocre score (54/100).

To register a service worker, and improve the app’s score, uncomment the following block in `index.html`.

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

After making this change, the score should improve. In my tests, it increased to 69/100. The remaining issues were:

* The page body should render some content if its scripts are not available. This could likely be solved with [Angular’s app-shell directives](https://www.npmjs.com/package/@angular/app-shell). 
* Site is not on HTTPS and does not redirect HTTP to HTTPS.
* A couple -1’s in performance for "Cannot read property 'ts' of undefined”. 

If you refresh the app and Chrome doesn’t prompt you to install the app (a PWA feature), you probably need to turn on a couple of features. Copy and paste the following URLs into Chrome and enable each feature.

```
chrome://flags/#bypass-app-banner-engagement-checks
chrome://flags/#enable-add-to-shelf
```

After enabling these flags, you’ll see an error in your browser’s console about `assets/imgs/logo.png` not being found. This files is referenced in `src/manifest.json`. You can fix this by copying a 512x512 PNG into this location or by modifying `manifest.json` accordingly.

## Deploy to a Mobile Device

It’s pretty cool that you’re able to develop mobile apps with Ionic in your browser. However, it’s nice to see the fruits of your labor and see how awesome your app looks on a phone. It really does look and behave like a native app!

To see how your application will look on different devices you can run `ionic serve --lab`. The `--lab` flag opens opens a page in your browser that lets you see how your app looks on different devices. 

### iOS

To emulate or deploy to an iOS device, you’ll need a Mac and a fresh installation of [Xcode](https://developer.apple.com/xcode/). If you’d like to build iOS apps on Windows, Ionic offers an [Ionic Package](http://ionic.io/cloud#packaging) service.

Make sure to open Xcode to complete the installation.

To make your app iOS-capable, add support for it using the following command.

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
open ionic-auth.xcodeproj
```

Select your phone as the target in Xcode and click the play button to run your app. The first time you do this, Xcode may spin for a while with a “Processing symbol files” message at the top.

See Ionic’s [deploying documentation](https://ionicframework.com/docs/v2/setup/deploying/) for information on code signing and trusting the app’s certificate.

Once you’re configured your phone, computer, and Apple ID to work, you should be able to open the app and see screens like the ones I captured on my iPhone 6s Plus.

|![](./static/iphone-login.png)|![](./static/iphone-register.png)|![](./static/iphone-forgot-password.png)|

### Android

To emulate or deploy to an Android device, you’ll first need to install [Android Studio](https://developer.android.com/studio/index.html). As part of the install, it will show you where it installed the Android SDK. Set this path as an ANDROID_HOME environment variable. On a Mac, it should be `~/Library/Android/sdk/`.

Make sure to open Android Studio to complete the installation.

To deploy to the Android emulator, add support for it to the ionic-auth project using the `ionic` command.

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

I ran the first suggestion and downloaded my desired system image. Then I ran the second command and created an AVD with the following settings:

```
AVD Name: TestPhone
Device: Nexus 5
Target: Android 7.1.1
CPU/ABI: Google APIs Intel Axom (x86_64)
Skin: Skin with dynamic hardware controls
```

After performing these steps, I was able to run `ionic emulate android` and see my app running in the AVD.

## Learn More
I hope you’ve enjoyed this tour of Ionic, Angular, and Stormpath. I like how Ionic takes your web development skills up a notch and allows you to create mobile applications that look and behave natively. They look great and have swift performance.

I’d love to learn how to add [Touch ID](https://ionicframework.com/docs/v2/native/touchid/) or [1Password support](https://github.com/AgileBits/onepassword-app-extension) to an Ionic app with Stormpath authentication. One of the biggest pain points as a user is having to enter in usernames and passwords on a mobile application. While Stormpath’s use of OAuth 2’s access and refresh tokens helps alleviate the problem, I do like the convenience of leveraging my phone and app’s capabilities.

To learn more about Ionic, Angular, or Stormpath, please see the following resources:

[Get started with Ionic Framework](http://ionicframework.com/getting-started/)
[Getting Started with Angular](https://www.youtube.com/watch?v=Jq3szz2KOOs) A YouTube webinar by yours truly. ;)
[Stormpath Client API Guide](https://docs.stormpath.com/client-api/product-guide/latest/) 
