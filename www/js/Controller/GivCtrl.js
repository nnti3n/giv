GIVapp.controller('GivsCtrl', function ($scope, Givs, $location, store, GPS, $state) {
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
    });