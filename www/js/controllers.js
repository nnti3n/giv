angular.module('starter.controllers', [])

    .controller('mainController', function ($ionicLoading, $scope) {
        $scope.show = function () {
            $ionicLoading.show({
                template: '<ion-spinner icon="ripple" class="spinner-positive"></ion-spinner>'
            });
        };
        $scope.hide = function () {
            $ionicLoading.hide();
        };
    })

    .controller('MessageCtrl', function ($scope, store, auth, $state) {
        $scope.show();

        //get user_id for local storage to load all user's chat rooms
        var profile_user = store.get('profile');
        var roomsRef_u = user.child("users").child(profile_user.user_id).child("rooms");

        // list all chat rooms
        var rooms = [];
        //get all rooms of user
        roomsRef_u.on("child_added", function (snapshot) {
            var chat_room = Object.keys(snapshot.val())[0]; //room id
            var chat_key = snapshot.key(); // chat mate id
            console.log(chat_key);
            //push the chat_mate info
            user.child("users").child(chat_key).once("value", function (snap_profile) {
                // push chat mate user profile to array
                rooms.push(snap_profile.val());
                var last = snapshot.val()[chat_room].last;
                var time = new Date(parseInt(last));
                //add chat mate id and last message to array
                rooms[rooms.length - 1].room_id = chat_room;
                rooms[rooms.length - 1].id = chat_key;
                rooms[rooms.length - 1].time = time.toLocaleDateString() + " " + time.toLocaleTimeString();
                rooms[rooms.length - 1].last = last;
                console.log(rooms);
                $scope.rooms = rooms; // set view to frontend
                $scope.hide();
            });
        });
        console.log(rooms);

        $scope.openRoom = function (roomId, chat_mate) {
            console.log(roomId);
            $state.go('tab.message/message-detail', {roomId: roomId, chat_mate: chat_mate});
        };

        $scope.GoToLink = function (url) {
            window.open(url, '_system', 'location=yes');
        };

        $scope.hide();
        //  end of message controller
    })

    .controller('MessageDetailCtrl', function ($scope, store, $state, $ionicScrollDelegate, $timeout, $ionicHistory) {
        //$scope.show();

        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            console.log($ionicHistory);
            viewData.enableBack = true;
        });

        var profile_user = store.get('profile');

        console.log($state.params.roomId);
        console.log($state.params.chat_mate);

        //information of both user and chat_mate
        $scope.chat_mate = $state.params.chat_mate;
        $scope.user = {};
        $scope.user.id = profile_user.user_id;
        $scope.user.name = profile_user.family_name;
        $scope.user.picture = profile_user.picture;

        //scroll to bottom in first-load message
        var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');

        //load chat
        var chats = [];

        var roomsRef_u = user.child("users").child(profile_user.user_id).child("rooms");

        //take chat room id from params or userlist
        var room_id = null;
        if ($state.params.roomId) {
            //navigate from tab-message
            room_id = $state.params.roomId;
        }
        else {
            //navigate from giv-detail
            roomsRef_u.child($state.params.chat_mate.id).once("value", function (snapshot) {
                room_id = Object.keys(snapshot.val())[0];
                //monitor the chatroom
                if (room_id) {
                    user.child("rooms").child(room_id).on("child_added", function (chat_snapshot) {
                        chats.push(chat_snapshot.val());
                        $scope.chats = chats;
                        $timeout(function () {
                            viewScroll.scrollBottom();
                        }, 0);
                        console.log(chats);
                        $scope.hide();
                    });
                }
            });

        }

        console.log(room_id);

        //monitor the chatroom
        if (room_id) {
            user.child("rooms").child(room_id).on("child_added", function (chat_snapshot) {
                chats.push(chat_snapshot.val());
                $scope.chats = chats;
                //scroll when new message
                $timeout(function () {
                    viewScroll.scrollBottom();
                }, 0);
                console.log(chats);
                $scope.hide();
            });
        }

        //init chat object
        $scope.IM = {};
        $scope.IM.message_detail = '';

        //send message button
        $scope.sendMessage = function (receiver) {
            // set database url for sender and receiver
            var roomsRef_r = user.child("users").child(receiver).child("rooms");

            var message_to_send = $scope.IM.message_detail;
            $scope.IM.message_detail = '';

            roomsRef_u.child(receiver).once("value", function (snapshot) {
                console.log(snapshot.val());
                //room_id =  Object.keys(snapshot.val())[0];
                var room = snapshot.val();
                if (room == null) {
                    // if room is not created, generate chat room id (push) then save time and save room_id to both user's rooms user_id->chatter->room_id
                    room_id = roomsRef_u.child(receiver).push({"last": (new Date()).getTime()}).key(); //for user
                    roomsRef_r.child(profile_user.user_id).child(room_id).set({"last": (new Date()).getTime()}); //for receiver
                    var vartemp = 1;
                } else {
                    room_id = Object.keys(snapshot.val())[0];
                    //update last message time
                    roomsRef_u.child(receiver).child(room_id).update({"last": (new Date()).getTime()}); //for user
                    roomsRef_r.child(profile_user.user_id).child(room_id).update({"last": (new Date()).getTime()}); //for receiver
                }
                console.log(room_id);

                // push message, if this is the first time, create room
                user.child("rooms").child(room_id).push({
                    "time": (new Date()).getTime(),
                    "from": profile_user.user_id,
                    "to": receiver,
                    "content": message_to_send
                }, function (error) {
                    if (error) {
                        alert("Your message could not be sent." + error);
                    } else {
                        console.log("message sent successfully.");
                        //user.child("users_online").child(receiver).once(function(snap) {
                        //    var login = snap.val();
                        //    if (login != null) {
                        //
                        //    }
                        //});
                    }
                });

                //if room is created first time, monitor room
                if (vartemp == 1) {
                    console.log('run');
                    user.child("rooms").child(room_id).on("child_added", function (chat_snapshot) {
                        chats.push(chat_snapshot.val());
                        $scope.chats = chats;
                        //scroll when new message
                        $timeout(function () {
                            viewScroll.scrollBottom();
                        }, 0);
                        console.log(chats);
                        $scope.hide();
                    });
                }
            });

        };

        //add favorite user
        $scope.favoriteAdd = function () {
            var json_id = {};
            json_id[profile_user.user_id] = true;
            user.child("users").child(profile_user.user_id).child("favorite").update(json_id);
        };

        $scope.GoBack = function () {
            $state.go("tab.message");
        };

        //$scope.hide();
        //    end of messageDetailCtrl
    })

    .controller('FavoriteCtrl', function ($scope, store, $state, GPS) {

        $scope.show();

        //init data favs
        var favs = [];

        var profile_id = store.get('profile').user_id;
        user.child("users").child(profile_id).child("favorite").on("child_added", function (snapshot) {
            //console.log("a");
            //var gps2 = snapshot.val().position;
            //var gps = store.get('gps');

            user.child("users").child(snapshot.key()).once("value", function (snap) {
                //push user online information to array
                if (snapshot.key() != profile_id) {
                    favs.push(snap.val());
                    //favs[favs.length - 1].distance = getDistanceFromLatLonInKm(gps.lat, gps.long, gps2.lat, gps2.long);
                    favs[favs.length - 1].id = snapshot.key();
                }
                $scope.favs = favs;
                console.log($scope.favs);
                $scope.hide();
            });
        });

        //remove one from favorite
        $scope.remove = function (removed_id) {
            user.child("users").child("favorite").child(removed_id).update({});

            //remove id from $scope.favs
            $scope.favs = $scope.favs
                .filter(function (el) {
                    return el.id !== removed_id;
                });

        };

        $scope.search = {};
        $scope.search.searchText = "";
        $scope.profile_id = store.get('profile').user_id;

        //open item
        $scope.openGiv = function (givId) {
            $state.go("tab.giv-detail", {givId: givId})
        };

        //pull to refresh
        $scope.doRefresh = function () {
            GPS.refresh();
            //refresh state
            $state.transitionTo($state.current, $state.$current.params, {reload: true, inherit: true, notify: true});
            $scope.$broadcast('scroll.refreshComplete');
            $scope.hide();
        };

        $scope.hide();
        //    end of FavoriteCtrl
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

    .controller('GivsCtrl', function ($scope, Givs, $location, store, GPS, $state, $timeout) {
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
            return Math.round(d);
        }

        function deg2rad(deg) {
            return deg * (Math.PI / 180);
        }

        //function compare(a,b) {
        //    if (a.distance < b.distance)
        //        return -1;
        //    if (a.distance > b.distance)
        //        return 1;
        //    return 0;
        //}

        //init data givs
        var givs = [];

        user.child("users_online").on("child_added", function (snapshot) {
            //console.log("a");
            var gps2 = snapshot.val().position;
            var gps = store.get('gps');
            user.child("users").child(snapshot.key()).once("value", function (snap) {
                //push user online information to array
                if (snapshot.key() != store.get('profile').user_id) {
                    givs.push(snap.val());
                    //add distance to each object
                    givs[givs.length - 1].distance = getDistanceFromLatLonInKm(gps.lat, gps.long, gps2.lat, gps2.long);
                    //add id for load profile in detail view
                    givs[givs.length - 1].id = snapshot.key();
                }
                //givs.sort(compare);

                $scope.givs = givs;
                $scope.hide();
            });
        });

        //if one user signout, then remove from the givs[] array scope
        user.child("users_online").on("child_removed", function (snapshot) {
            console.log(snapshot.key());
            var removed = snapshot.key();

            //remove id from $scope.givs
            var array_removed = $scope.givs
                .filter(function (el) {
                    return el.id !== removed;
                });
            $scope.givs = array_removed;
        });

        $scope.search = {};
        $scope.search.searchText = "";
        $scope.profile_id = store.get('profile').user_id;

        //open item
        $scope.openGiv = function (givId) {
            $state.go("tab.giv-detail", {givId: givId})
        };

        //sendMessage
        $scope.openRoom = function (chat_mate) {
            console.log(roomId);
            $state.go('tab.message/message-detail', {chat_mate: chat_mate});
        };

        //pull to refresh
        $scope.doRefresh = function () {
            GPS.refresh();
            //refresh state
            $state.transitionTo($state.current, $state.$current.params, {reload: true, inherit: true, notify: true});
            $scope.$broadcast('scroll.refreshComplete');
            $scope.hide();
        };

        $scope.hide();
    })

    //Detail
    .controller('GivDetailCtrl', function ($scope, $stateParams, store, $state) {
        $scope.show();

        var giv = {};
        var giv_id = $state.params.givId;

        user.child("users").child(giv_id).once("value", function (snapshot) {
            giv = snapshot.val();
            //id for message purpose
            giv.id = giv_id;
            console.log(giv);
            $scope.giv = giv;
            $scope.$digest();
            $scope.hide();
        });


        //init the scope array
        $scope.IM = {};
        $scope.IM.content = '';

        var profile_user = store.get('profile');

        //send message
        $scope.sendMessage = function (chat_mate) {
            $state.go('tab.message/message-detail', {chat_mate: chat_mate});
        };

        //add favorite user
        $scope.favoriteAdd = function () {
            var json_id = {};
            json_id[giv_id] = true;
            user.child("users").child(profile_user.user_id).child("favorite").update(json_id, function (error) {
                if (error) {
                    alert("Your message could not be sent." + error);
                } else {
                    alert("add to favorite successfully.");
                }
            });
        };

        //old send message
        $scope.sendMessageOld = function () {
            var receiver = giv_id;
            var message_to_send = $scope.IM.content;
            $scope.IM.content = '';

            // set database url for sender and receiver
            var roomsRef_u = user.child("users").child(profile_user.user_id).child("rooms");
            var roomsRef_r = user.child("users").child(receiver).child("rooms");
            // watch if chat room is created or not
            roomsRef_u.child(receiver).once("value", function (snapshot) {
                if (snapshot.val() == null) {

                    // if room is not created, generate room id for the chat room with time user_id->chatter->room_id and save room_id to both user's rooms
                    var room_id = roomsRef_u.child(receiver).push({"last": (new Date()).getTime()}).key();
                    roomsRef_r.child(profile_user.user_id).child(room_id).set({"last": (new Date()).getTime()});

                    //then push message to chat room (and create room)
                    user.child("rooms").child(room_id).push({
                        "time": (new Date()).getTime(),
                        "from": profile_user.user_id,
                        "to": receiver,
                        "content": message_to_send
                    }, function (error) {
                        if (error) {
                            alert("Your message could not be sent." + error);
                        } else {
                            alert("message sent successfully.");
                        }
                    })
                } else {
                    var chat_key = Object.keys(snapshot.val());

                    //update last message time for message tab time order
                    roomsRef_u.child(receiver).child(chat_key[0]).update({"last": (new Date()).getTime()});
                    roomsRef_r.child(profile_user.user_id).child(chat_key[0]).update({"last": (new Date()).getTime()});

                    // if room is created, add chat to the chatroom
                    user.child("rooms").child(chat_key[0]).push({
                        "time": (new Date()).getTime(),
                        "from": profile_user.user_id,
                        "to": receiver,
                        "content": message_to_send
                    }, function (error) {
                        if (error) {
                            alert("Your message could not be sent." + error);
                        } else {
                            alert("message sent successfully.");
                        }
                    })
                }
            });
        };

        $scope.GoToLink = function (url) {
            window.open(url, '_system', 'location=yes');
            $scope.hide();
        };
        console.log($state.params.givId);
        //$scope.hide();
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

