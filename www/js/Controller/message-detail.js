angular.module('starter.controllers')

    .controller('MessageDetailCtrl', function ($scope, store, $state, $ionicScrollDelegate, $timeout, $ionicHistory, $http, auth, $ionicLoading) {

        $scope.show = function () {
            $ionicLoading.show({
                template: '<ion-spinner icon="ripple" class="spinner-positive"></ion-spinner>'
            });
        };
        $scope.hide = function () {
            $ionicLoading.hide();
        };

        //$scope.show();

        var profile_user = store.get('profile');
        //scroll to bottom in first-load message
        var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
        //take chat room id from params or userlist
        var room_id = null;
        //information of both user and chat_mate
        $scope.chat_mate = $state.params.chat_mate;
        $scope.user = {};
        $scope.user.id = profile_user.user_id;
        $scope.user.picture = profile_user.picture;

        //init chat object
        $scope.IM = {};
        $scope.IM.message_detail = '';

        //load chat
        var chats = [];
        var roomsRef_u = user.child("users").child(profile_user.user_id).child("rooms");

        //add favorite user
        $scope.favoriteAdd = function () {
            var json_id = {};
            json_id[profile_user.user_id] = true;
            user.child("users").child(profile_user.user_id).child("favorite").update(json_id);
        };

        $scope.GoBack = function () {
            $state.go("tab.message");
        };

        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            console.log($ionicHistory);
            viewData.enableBack = true;
        });

        if ($state.params.roomId) {
            //navigate from tab-message
            room_id = $state.params.roomId;

            //monitor the chatroom
            if (room_id) {
                user.child("rooms").child(room_id).on("child_added", function (chat_snapshot) {
                    //push message to scope
                    chats.push(chat_snapshot.val());
                    $scope.chats = chats;
                    //change message status to seen
                    roomsRef_u.child($state.params.chat_mate.id).child(room_id).update({
                        "seen": true
                    });
                    //user.child("users").child(profile_user.user_id).update({"all_seen": false});
                    //scroll when new message
                    $timeout(function () {
                        viewScroll.scrollBottom();
                    }, 0);
                    $scope.hide();
                });
            }
        }
        else {
            //navigate from giv-detail
            roomsRef_u.child($state.params.chat_mate.id).once("value", function (snapshot) {
                room_id = Object.keys(snapshot.val())[0];
                //monitor the chatroom
                if (room_id) {
                    user.child("rooms").child(room_id).on("child_added", function (chat_snapshot) {
                        //push message to scope
                        chats.push(chat_snapshot.val());
                        $scope.chats = chats;
                        //change message status to seen
                        roomsRef_u.child($state.params.chat_mate.id).child(room_id).update({
                            "seen": true
                        });

                        //scroll bottom when new message
                        $timeout(function () {
                            viewScroll.scrollBottom();
                        }, 0);
                        $scope.hide();
                    });
                }
            });
        }

        // send message button function
        $scope.sendMessage = function (receiver) {
            // set database url for sender and receiver
            var roomsRef_r = user.child("users").child(receiver).child("rooms");

            var message_to_send = $scope.IM.message_detail;
            $scope.IM.message_detail = '';

            //check room created or not for update information of latest message then push
            roomsRef_u.child(receiver).once("value", function (snapshot) {
                console.log(snapshot.val());
                //room_id =  Object.keys(snapshot.val())[0];
                var room = snapshot.val();
                if (room == null) {
                    // if room is not created, generate chat room id (push) then save time and save room_id to both user's rooms user_id->chatter->room_id
                    room_id = roomsRef_u.child(receiver).push({"last": (new Date()).getTime()}).key(); //for user
                    roomsRef_r.child(profile_user.user_id).child(room_id).set({
                        "last": (new Date()).getTime(),
                        "seen": false
                    }); //for receiver
                    // temp variable for monitor room first time
                    var vartemp = 1;
                } else {
                    room_id = Object.keys(snapshot.val())[0];
                    //update last message time
                    roomsRef_u.child(receiver).child(room_id).update({"last": (new Date()).getTime()}); //for user
                    roomsRef_r.child(profile_user.user_id).child(room_id).update({
                        "last": (new Date()).getTime(),
                        "seen": false
                    }); //for receiver
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

                        //update all seen for receiver
                        user.child("users").child(receiver).update({"all_seen": false});
                        // Make the API call
                        user.child("online_users").child(receiver).once("value", function (snapshot) {
                            console.log(snapshot);
                            if (snapshot == null) {
                                //create string to push
                                var req = {
                                    method: 'POST',
                                    url: 'https://giv-server.herokuapp.com/push',
                                    data: {
                                        "noti": {
                                            // "tokens": ["APA91bElXfJLbo8_kJd2YEYVKqK4eIh2AQs8QLT_VnLe_vEXGd20G5a4ufg5NBbjUgTJn2z7h3AHaiXrJaTb81omCF5heM9RSjlVmJ5F-5rMBXT0XGrH8hJWnkbIW1wqi88IUiR6kId-A_XUZ-wBmfs1HNEdMwhQxg"],
                                            "user_ids": [receiver],
                                            "notification": {
                                                "alert": auth.profile.name + ": " + message_to_send,
                                                "android": {
                                                    "badge": 1,
                                                    "sound": "chime.aiff",
                                                    "expiry": 1423238641,
                                                    "priority": 10,
                                                    "contentAvailable": true,
                                                    "payload": {
                                                        "key1": "value",
                                                        "key2": "value"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                };

                                //demo
                                $http(req).success(function (resp) {
                                    // Handle success
                                    console.log("Ionic Push: Push success! " + resp);
                                }).error(function (error) {

                                    // Handle error
                                    console.log("Ionic Push: Push error...");
                                });
                            }
                        }); // end of api call
                    }
                }); // end of push

                //if room is created first time, monitor room
                if (vartemp == 1) {
                    user.child("rooms").child(room_id).on("child_added", function (chat_snapshot) {
                        //push message to scope
                        chats.push(chat_snapshot.val());
                        $scope.chats = chats;
                        //change message status to seen
                        roomsRef_u.child(receiver).child(room_id).update({
                            seen: "true"
                        });
                        //scroll down when new message
                        $timeout(function () {
                            viewScroll.scrollBottom();
                        }, 0);
                        $scope.hide();
                    });
                }
            });

        };
        //    end of send message button function

    })

    //enter to send message
    .directive('enterSubmit', function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {

                elem.bind('keydown', function (event) {
                    var code = event.keyCode || event.which;

                    if (code === 13) {
                        if (!event.shiftKey) {
                            event.preventDefault();
                            scope.$apply(attrs.enterSubmit);
                        }
                    }
                });
            }
        }
    });