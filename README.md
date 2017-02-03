# Spring Boot, Ionic, and Stormpath 🍻

This project is an example application for a typical [Ionic](https://ionicframework.com/) app with a [Spring Boot](https://projects.spring.io/spring-boot/) backend.

You can read about how this application was created on [the Stormpath blog](https://stormpath.com/blog/spring-boot-ionic-stormpath-tutorial). Feel free to copy any code in this project for your own use in accordance with the [MIT license](LICENSE).

**Prerequisites**: Java 8, Node.js, Maven, a [Stormpath Account](https://api.stormpath.com/register), and an `apiKey.properties` file in `~/stormpath/`.

To run the Spring Boot backend, cd into `server` and run `mvn spring-boot:run`.

In another terminal window, install Ionic and Cordova.

```
npm install -g ionic cordova
```

Next, cd into `client` and execute `npm install && ionic serve`. The aforementioned blog post shows you how to deploy this app to an emulator/device. 
