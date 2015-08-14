angular.module('starter.services', [])

    .factory('Givs', function (store) {
        //calculate distance by km
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

        //var chats = [];
        //user.child("users_online").on("child_added", function (snapshot) {
        //    //console.log("a");
        //    var gps2 = snapshot.val().position;
        //    var gps = store.get('gps');
        //    user.child("users").child(snapshot.key()).once("value", function (snap) {
        //        //push user online information to array
        //        if (snapshot.key() != store.get('profile').user_id) {
        //            chats.push(snap.val());
        //            chats[chats.length - 1].distance = getDistanceFromLatLonInKm(gps.lat, gps.long, gps2.lat, gps2.long);
        //        }
        //        console.log(chats);
        //    });
        //});

        return {
            //distance: function () {
            //    return chats;
            //},
            remove: function (giv) {
                givs.splice(givs.indexOf(giv), 1);
            },
            get: function (givId) {
                //for (var i = 0; i < chats.length; i++) {
                //  if (chats[i].email === parseInt(chatId)) {
                //    return chats[i];
                //  }
                //}
                for (var child in givs) {
                    if (child === givId) {
                        console.log(givs[child]);
                        return givs[child];
                    }
                }
                return null;
            }
        };
    })

    .factory('GPS', function (auth, store, $cordovaGeolocation) {
        return {
            refresh: function () {
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
            }
        }
    });