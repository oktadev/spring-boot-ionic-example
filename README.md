# Stormpath is Joining Okta
We are incredibly excited to announce that [Stormpath is joining forces with Okta](https://stormpath.com/blog/stormpaths-new-path?utm_source=github&utm_medium=readme&utm-campaign=okta-announcement). Please visit [the Migration FAQs](https://stormpath.com/oktaplusstormpath?utm_source=github&utm_medium=readme&utm-campaign=okta-announcement) for a detailed look at what this means for Stormpath users.

We're available to answer all questions at [support@stormpath.com](mailto:support@stormpath.com).

# Spring Boot, Ionic, and Stormpath 🍻

This project is an example application for a typical [Ionic](https://ionicframework.com/) app with a [Spring Boot](https://projects.spring.io/spring-boot/) backend.

You can read about how this application was created in [this tutorial](./TUTORIAL.md). Feel free to copy any code in this project for your own use in accordance with the [MIT license](LICENSE).

**Prerequisites**: Java 8, Node.js, Maven, a [Stormpath Account](https://api.stormpath.com/register), and an `apiKey.properties` file in `~/stormpath/`.

To run the Spring Boot backend, cd into `server` and run `mvn spring-boot:run`.

In another terminal window, install Ionic and Cordova.

```
npm install -g ionic cordova
```

Next, cd into `client` and execute `npm install && ionic serve`. The aforementioned [tutorial](./TUTORIAL.md) shows you how to deploy this app to an emulator/device. 
