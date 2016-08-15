angular.module('starter.controllers')

    .controller('AccountCtrl', function ($scope, store, auth, $state, $location, SkillSet, GPS, $ionicLoading) {

        $scope.show = function () {
            $ionicLoading.show({
                template: '<ion-spinner icon="ripple" class="spinner-positive"></ion-spinner>'
            });
        };
        $scope.hide = function () {
            $ionicLoading.hide();
        };

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
        SkillSet.personal_skill().success(function (response) {
            $scope.personal_skills = response;
            $scope.hide();
        });

        //select skills to remove
        $scope.select = function (object) {
            //push skill id to array
            SkillSet.select(object);

            if ($scope.personal_skills[$scope.personal_skills.indexOf(object)].selected) {
                $scope.personal_skills[$scope.personal_skills.indexOf(object)].selected = false;
            }
            else {
                $scope.personal_skills[$scope.personal_skills.indexOf(object)].selected = true;
            }
        };

        //remove skills
        $scope.remove = function () {
            SkillSet.remove();
            $state.transitionTo($state.current, $state.$current.params, {reload: true, inherit: true, notify: true});
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
            var user_online = user.child("users_online").child(profile_user.user_id);
            user_online.set({});

            auth.signout();
            store.remove('token');
            store.remove('profile');
            store.remove('refreshToken');
            store.remove('firebaseToken');
            $state.go('login');
        };
    });