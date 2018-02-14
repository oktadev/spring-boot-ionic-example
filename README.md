# Spring Boot + Ionic 🍻

This project is an example application for a typical [Ionic](https://ionicframework.com/) app with a [Spring Boot](https://projects.spring.io/spring-boot/) backend.

You can read about how this application was created in [Develop a Mobile App With Ionic and Spring Boot](http://developer.okta.com/blog/2017/05/17/develop-a-mobile-app-with-ionic-and-spring-boot). Feel free to copy any code in this project for your own use in accordance with the [Apache license](LICENSE).

**Prerequisites**: Java 8 and Node.js.

To run the Spring Boot backend, cd into `server` and run `mvn spring-boot:run`.

In another terminal window, install Ionic and Cordova.

```
npm install -g ionic cordova
```

Next, cd into `client` and execute `npm install && ionic serve`. The aforementioned [tutorial](http://developer.okta.com/blog/2017/05/17/develop-a-mobile-app-with-ionic-and-spring-boot) shows you how to deploy this app to an emulator/device. 
