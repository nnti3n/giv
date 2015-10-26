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
    })

    .factory('SkillSet', function() {
        var skills = [{1: "entrepreneur"}, {2: "software engineer"}, {3:"UI/UX Designer"}, {5:"Business Analyst"}, {6: "entrepreneur"}, {7: "software engineer"}, {8:"UI/UX Designer"}, {9:"Business Analyst"}, {10: "entrepreneur"}, {11: "software engineer"}, {12:"UI/UX Designer"}, {13:"Business Analyst"}, {14: "entrepreneur"},{15: "software engineer"}, {16:"UI/UX Designer"}, {17:"Business Analyst"}, {18: "entrepreneur"}, {19: "software engineer"}, {20:"UI/UX Designer"}, {21:"Business Analyst"}, {22: "entrepreneur"}, {23: "software engineer"}, {24:"UI/UX Designer"}, {25:"Business Analyst"}, {26: "entrepreneur"}, {27: "software engineer"},{ 28:"UI/UX Designer"}, {29:"Business Analyst"}, {30: "entrepreneur"}, {31: "software engineer"}, {32:"UI/UX Designer"}, {33:"Business Analyst"}];


       return {
           all: function () {
               return skills;
           },
           more: function() {
               skills.splice(0,10);
           },
           remove: function(object) {
               skills.splice(skills.indexOf(object), 1);
           }
       }
    });