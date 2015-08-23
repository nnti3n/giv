angular.module('starter.controllers', [])

    .controller('mainController', function ($ionicLoading, $scope) {
        $scope.show = function() {
            $ionicLoading.show({
                template: '<ion-spinner icon="ripple" class="spinner-positive"></ion-spinner>'
            });
        };
        $scope.hide = function(){
            $ionicLoading.hide();
        };
    })

    .controller('DashCtrl', function ($scope, store, auth, $state) {

        //console.log(auth.profile);
        $scope.auth = auth;
    })

    .controller('moreCtrl', function ($scope) {
    })

    .controller('LoginCtrl', function (store, $scope, $location, auth, $state, $firebase, $cordovaGeolocation) {
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
                auth.getToken({
                    api: 'firebase'
                }).then(function (delegation) {
                    store.set('firebaseToken', delegation.id_token);
                    $state.go('tab.chats');
                    // save data to firebase
                    // Here we're using the Firebase Token we stored after login
                    user.authWithCustomToken(store.get('firebaseToken'), function (error, auth) {
                        if (error) {
                            // There was an error logging in, redirect the user to login page
                            $state.go('login');
                        }
                        else console.log(auth);
                    });
                    // save info when first login
                    var usersRef = user.child("users").child(auth.profile.user_id);
                    usersRef.once("value", function (snap) {
                        if (snap.val() == null) {
                            usersRef.set({
                                "email": auth.profile.email,
                                "full_name": auth.profile.name,
                                "headline": auth.profile.headline,
                                "url": auth.profile.publicProfileUrl,
                                "picture": auth.profile.picture
                            });
                        }
                    });
                    var users_online = user.child("users_online").child(auth.profile.user_id);
                    //get gps position
                    var gps = {"lat": "", "long": ""};
                    var posOptions = {timeout: 10000, enableHighAccuracy: false};
                    $cordovaGeolocation
                        .getCurrentPosition(posOptions)
                        .then(function (position) {
                            gps.lat = position.coords.latitude;
                            gps.long = position.coords.longitude;
                            console.log(gps);
                            users_online.set({
                                "online": true,
                                "position": {
                                    "lat": gps.lat,
                                    "long": gps.long
                                }
                            });
                            store.set('gps', gps);
                        }, function (err) {
                            // error
                            alert("Can't get gps position " + err);
                        });

                }, function (error) {
                    // Error getting the firebase token
                })
            }, function () {
                // Error callback
            });
        };
    })

    .controller('ChatsCtrl', function ($scope, Chats, $location, store, GPS, $state) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        //$scope.$on('$ionicView.enter', function(e) {
        //});
        //$location.path('/');

        //For some loading reason, all the code must be on controller, fix later
        $scope.show();
        function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2 - lat1);  // deg2rad below
            var dLon = deg2rad(lon2 - lon1);
            var a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2)
                ;
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            return Math.round(d * 100) / 100;
        }

        function deg2rad(deg) {
            return deg * (Math.PI / 180);
        }

        function compare(a,b) {
            if (a.distance < b.distance)
                return -1;
            if (a.distance > b.distance)
                return 1;
            return 0;
        }

        var chats = [];
        user.child("users_online").on("child_added", function (snapshot) {
            //console.log("a");
            var gps2 = snapshot.val().position;
            var gps = store.get('gps');
            user.child("users").child(snapshot.key()).once("value", function (snap) {
                //push user online information to array
                if (snapshot.key() != store.get('profile').user_id) {
                    chats.push(snap.val());
                    chats[chats.length - 1].distance = getDistanceFromLatLonInKm(gps.lat, gps.long, gps2.lat, gps2.long);
                }
                chats.sort(compare);
                store.set("chats", chats);
                $scope.hide();
            });
        });

        //user.child("users_online").on("value", function (snapshot) {
        //    //console.log("a");
        //    var gps2 = snapshot.val().position;
        //    var gps = store.get('gps');
        //    user.child("users").child(snapshot.key()).once("value", function (snap) {
        //        //push user online information to array
        //        if (snapshot.key() != store.get('profile').user_id) {
        //            chats.push(snap.val());
        //            chats[chats.length - 1].distance = getDistanceFromLatLonInKm(gps.lat, gps.long, gps2.lat, gps2.long);
        //        }
        //        chats.sort(compare);
        //        //$scope.hide();
        //    });
        //});

        $scope.chats = chats;

        $scope.search = {};
        $scope.search.searchText = "";
        $scope.profile_id = store.get('profile').user_id;

        $scope.doRefresh = function () {
            GPS.refresh();
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$apply();
        };

        $scope.remove = function (chat) {
            Chats.remove(chat);
        };
        $scope.hide();
    })

    //Detail
    .controller('ChatDetailCtrl', function ($scope, $stateParams, store) {
        //$scope.chat = Chats.get();
        var chats = store.get('chats');
        for (var child in chats) {
            if (child === $stateParams.chatId) {
                console.log(chats[child]);
                $scope.chat = chats[child];
            }
        }
        $scope.GoToLink = function (url) {
            window.open(url,'_system');
        };
        console.log($stateParams.chatId);
    })

    //Account
    .controller('AccountCtrl', function ($scope, store, auth, $state, $location, GPS) {
        $scope.show();
        var profile_user = store.get('profile');
        $scope.submit_hash = function () {
            var usersRef_x = user.child("users").child(profile_user.user_id).child("hashtag");
            usersRef_x.set({
                "hashtag1": $scope.hashtag.hashtag1,
                "hashtag2": $scope.hashtag.hashtag2,
                "hashtag3": $scope.hashtag.hashtag3
            }, function (error) {
                if (error) {
                    alert("Hashtag could not be saved." + error);
                } else {
                    alert("Hashtag saved successfully.");
                }
            });
        };

        $scope.auth = auth;

        $scope.settings = {
            enableFriends: true
        };

        var usersRef = user.child("users").child(profile_user.user_id).child("hashtag");
        usersRef.on("value", function (snap) {
            $scope.hashtag = {};
            var hashtag_val = snap.val();
            if (hashtag_val.hashtag1 != null) {
                $scope.hashtag.hashtag1 = hashtag_val.hashtag1;
            }
            if (hashtag_val.hashtag2 != null) {
                $scope.hashtag.hashtag2 = hashtag_val.hashtag2;
            }
            if (hashtag_val.hashtag3 != null) {
                $scope.hashtag.hashtag3 = hashtag_val.hashtag3;
            }
            $scope.hide();
        });

        //Refresh position
        $scope.refresh = function () {
            GPS.refresh();
            console.log('update position completely! ');
        };

        // Logout
        $scope.logout = function () {
            //delete on online users list
            var user_online = user.child("users_online").child(auth.profile.user_id);
            user_online.set({});

            auth.signout();
            store.remove('token');
            store.remove('profile');
            store.remove('refreshToken');
            store.remove('firebaseToken');
            $state.go('login');
        };
        $scope.hide();
    });
