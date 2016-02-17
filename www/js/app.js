// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','ngOpenFB','ngStorage'])

.run(function($ionicPlatform, ngFB, $http, $window) {
  ngFB.init({appId: '1668219540123468', tokenStore: $window.localStorage, accessToken : $window.localStorage.fbAccessToken});

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
  if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    cordova.plugins.Keyboard.disableScroll(true);

  }
  if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  $httpProvider.interceptors.push('AuthInterceptor');
  $stateProvider

  .state('auth', {
    url: "/auth",
    templateUrl: "templates/auth/auth.html",
    abstract: true,
    controller: 'AuthCtrl'
  })

  .state('auth.walkthrough', {
    url: '/walkthrough',
    templateUrl: "templates/auth/walkthrough.html"
  })

  .state('auth.login', {
    url: '/login',
    templateUrl: "templates/auth/login.html",
    controller: 'LoginCtrl'
  })

  .state('auth.signup', {
    url: '/signup',
    templateUrl: "templates/auth/signup.html",
    controller: 'SignupCtrl'
  })

  .state('auth.forgot-password', {
    url: "/forgot-password",
    templateUrl: "templates/auth/forgot-password.html",
    controller: 'ForgotPasswordCtrl'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.slack', {
    url: '/slack',
    views: {
      'tab-slack': {
        templateUrl: 'templates/tab-slack.html',
        controller: 'SlackCtrl'
      }
    }
  })

  .state('tab.slack-detail', {
    url: '/slack/:slackId',
    views: {
      'tab-slack': {
        templateUrl: 'templates/slack-detail.html',
        controller: 'SlackDetailCtrl'
      }
    }
  })

  .state('tab.myRegisters', {
    url: '/myRegisters',
    views: {
      'tab-myRegisters': {
        templateUrl: 'templates/tab-myRegisters.html',
        controller: 'MyRegistersCtrl'
      }
    }
  })
  .state('tab.myRegisters-detail', {
    url: '/myRegisters/:registerId',
    views: {
      'tab-myRegisters': {
        templateUrl: 'templates/myRegisters-detail.html',
        controller: 'MyRegistersDetailCtrl'
      }
    }
  })

  .state('tab.mySlacks', {
    url: '/mySlacks',
    views: {
      'tab-mySlacks': {
        templateUrl: 'templates/tab-mySlacks.html',
        controller: 'MySlacksCtrl'
      }
    }
  })

  .state('tab.mySlacks-detail', {
    url: '/mySlacks/:slackId',
    views: {
      'tab-mySlacks': {
        templateUrl: 'templates/mySlacks-detail.html',
        controller: 'MySlacksDetailCtrl'
      }
    }
  })

  .state('tab.hello', {
    url: '/hello',
    views: {
      'tab-hello': {
        templateUrl: 'templates/tab-hello.html',
        controller: 'ProfileCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  // $urlRouterProvider.otherwise('/tab/slack');
  $urlRouterProvider.otherwise('/auth/walkthrough');

});
