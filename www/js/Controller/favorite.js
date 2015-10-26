angular.module('starter.controllers')

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
    });