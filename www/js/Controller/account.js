angular.module('starter.controllers')

.controller('AccountCtrl', function ($scope, store, auth, $state, $location, $http, GPS) {
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

        //load skill
        var req = {
            method: 'POST',
            url: 'https://giv-server.herokuapp.com/getpersonskill',
            data: {
                "sID":"linkedin|Tbz90p6Y4u"
            }
        };

        $http(req).success(function (data) {
            // Handle success
          $scope.skills = data;
        }).error(function (error) {
            // Handle error
            console.log("Save error: " + error);
        });

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