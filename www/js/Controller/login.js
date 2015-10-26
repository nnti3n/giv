angular.module('starter.controllers')

.controller('LoginCtrl', function (store, $scope, $location, auth, $state, $firebase, $rootScope, $ionicUser, $ionicPush, GPS) {
        // LoginCtrl.js

        $scope.login = function () {
            auth.signin({
                authParams: {
                    scope: 'openid offline_access',
                    device: 'Mobile device'
                }
            }, function (profile, token, accessToken, state, refreshToken) {
                store.set('profile', profile);
                store.set('token', token);
                store.set('refreshToken', refreshToken);
                $location.path('/');

                //register ionic service
                console.log('Ionic User: Identifying with Ionic User service');

                var user_push = $ionicUser.get();
                if(!user_push.user_id) {
                    // Set your user_id here, or generate a random one.
                    user_push.user_id = auth.profile.user_id;
                }

                // Add some metadata to your user object.
                angular.extend(user_push, {
                    "full_name": auth.profile.name
                });

                console.log(user_push.user_id);

                // Identify your user with the Ionic User Service
                if (user_push.user_id != null) {
                    $ionicUser.identify(user_push).then(function () {
                        $scope.identified = true;
                        console.log(user_push.user_id);
                        console.log('Identified user ' + user_push.full_name + '\n ID ' + user_push.user_id);

                        console.log('Ionic Push: Registering user');

                        // Register with the Ionic Push service.  All parameters are optional.
                        $ionicPush.register({
                            canShowAlert: true, //Can pushes show an alert on your screen?
                            canSetBadge: true, //Can pushes update app icon badges?
                            canPlaySound: true, //Can notifications play a sound?
                            canRunActionsOnWake: true, //Can run actions outside the app,
                            onNotification: function(notification) {
                                alert(notification);
                                return true;
                            }
                        });
                    });
                }

                //end of push register

                auth.getToken({
                    api: 'firebase'
                }).then(function (delegation) {
                    console.log(delegation);
                    store.set('firebaseToken', delegation.id_token);
                    $state.go('tab.givs');
                    // save data to firebase
                    // Here we're using the Firebase Token we stored after login
                    user.authWithCustomToken(store.get('firebaseToken'), function (error, auth) {
                        if (error) {
                            // There was an error logging in, redirect the user to login page
                            $state.go('login');
                        }
                        else console.log(auth);
                    });


                    // save info everytime user login
                    var usersRef = user.child("users").child(auth.profile.user_id);
                    usersRef.update({
                        "email": auth.profile.email,
                        "full_name": auth.profile.name,
                        "headline": auth.profile.headline,
                        "url": auth.profile.publicProfileUrl,
                        "picture": auth.profile.picture
                    });

                    //set gps
                    GPS.refresh();

                }, function (error) {
                    // Error getting the firebase token
                })
            }, function () {
                // Error callback
            });
        };
    });