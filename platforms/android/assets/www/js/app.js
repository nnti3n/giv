// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'firebase', 'starter.controllers', 'starter.services', 'auth0', 'angular-storage', 'angular-jwt', 'ngCordova', 'angularMoment','monospaced.elastic'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }

            //check internet connection
            if(window.Connection) {
                if(navigator.connection.type == Connection.NONE) {
                    $ionicPopup.confirm({
                        title: 'No Internet Connection',
                        content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
                    })
                        .then(function(result) {
                            if(!result) {
                                ionic.Platform.exitApp();
                            }
                        });
                }
            }
        });
    })

    .run(function (auth) {
        // This hooks all auth events to check everything as soon as the app starts
        auth.hookEvents();
    })

    .run(function ($rootScope, auth, store, jwtHelper, $location) {
        // This events gets triggered on refresh or URL change
        var refreshingToken = null;
        $rootScope.$on('$locationChangeStart', function () {
            var token = store.get('token');
            var refreshToken = store.get('refreshToken');
            if (token) {
                if (!jwtHelper.isTokenExpired(token)) {
                    if (!auth.isAuthenticated) {
                        auth.authenticate(store.get('profile'), token);
                    }
                } else {
                    if (refreshToken) {
                        if (refreshingToken === null) {
                            refreshingToken = auth.refreshIdToken(refreshToken).then(function (idToken) {
                                store.set('token', idToken);
                                auth.authenticate(store.get('profile'), idToken);
                            }).finally(function () {
                                refreshingToken = null;
                            });
                        }
                        return refreshingToken;
                    } else {
                        $location.path('/login');
                    }
                }
            }

        });
    })

    .config(function ($stateProvider, $urlRouterProvider, authProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })

            // login
            .state('login', {
                url: "/login",
                templateUrl: "templates/login.html",
                controller: 'LoginCtrl'
            })

            // Each tab has its own nav history stack:

            .state('tab.message', {
                url: '/message',
                views: {
                    'tab-message': {
                        templateUrl: 'templates/tab-message.html',
                        controller: 'MessageCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                }
            })

            .state('tab.message-detail', {
                url: '/message/detail',

                params : {
                    chat_mate: null,
                    roomId: null
                },
                views: {
                    'tab-message': {
                        templateUrl: 'templates/message-detail.html',
                        controller: 'MessageDetailCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                }
            })

            .state('tab.givs', {
                url: '/givs',
                views: {
                    'tab-givs': {
                        templateUrl: 'templates/tab-givs.html',
                        controller: 'GivsCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                },
                cache: false
            })

            .state('tab.giv-detail', {
                url: '/givs/detail',
                params: {
                    givId: null
                },
                views: {
                    'tab-givs': {
                        templateUrl: 'templates/giv-detail.html',
                        controller: 'GivDetailCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                }
            })

            .state('tab.favorite', {
                url: '/favorite',
                views: {
                    'tab-favorite': {
                        templateUrl: 'templates/tab-favorite.html',
                        controller: 'FavoriteCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                },
                cache: false
            })

            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                }
            });


        authProvider.init({
            domain: 'giv-android.auth0.com',
            clientID: 'UrHcyqs7QmCNLNHCmoVvNq0xLetb7Op9',
            loginState: 'login'
        });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/givs');

    })


.config(function (authProvider, $urlRouterProvider, $httpProvider, jwtInterceptorProvider) {

  jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth) {
    var idToken = store.get('token');
    var refreshToken = store.get('refreshToken');
    // If no token return null
    if (!idToken || !refreshToken) {
      return null;
    }
    // If token is expired, get a new one
    if (jwtHelper.isTokenExpired(idToken)) {
      return auth.refreshIdToken(refreshToken).then(function(idToken) {
        store.set('token', idToken);
        return idToken;
      });
    } else {
      return idToken;
    }
  };
    $httpProvider.interceptors.push('jwtInterceptor');
});

//global variable for firebase
var user = new Firebase("https://giv.firebaseio.com/userdata");