angular.module('starter.services', [])

    .factory('GPS', function (auth, store, $cordovaGeolocation) {
        return {
            refresh: function () {
                var users_online = user.child("users_online").child(auth.profile.user_id);
                //get gps position
                var gps = {"lat": "", "long": ""};
                var posOptions = {timeout: 15000, enableHighAccuracy: true};
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
            }
        }
    });