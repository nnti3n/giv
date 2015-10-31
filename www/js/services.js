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
                        users_online.set({"online": true});
                        alert("Can't get gps position " + err);
                    });
            }
        }
    })

    .factory('SkillSet', function (store, $http, $timeout) {

        var user_skill = [];

        var profile_user = store.get('profile');

        function isInArray(value, array) {
            return array.indexOf(value) > -1;
        }

        var skills = $http.get('https://giv-server.herokuapp.com/getallskill').
            success(function (response) {
                // this callback will be called asynchronously
                // when the response is available
                return response;
            });

        var spliced = [];

        return {
            all: function () {
              return skills;
            },
            personal_skill: function () {
                var req = {
                    method: 'POST',
                    url: 'https://giv-server.herokuapp.com/getpersonskill',
                    data: {
                        "sID":profile_user.user_id
                    }
                };

                return $http(req).success(function (response) {
                    return response;
                });
            },
            select: function (object) {
                //push or splice if select
                if (isInArray(object.id, user_skill)) {
                    user_skill.splice(user_skill.indexOf(object.id), 1);
                }
                else {
                    user_skill.push(object.id);
                }
                console.log(user_skill);
            },
            more: function () {
                spliced.concat(skills.splice(0, 10));
                if (skills.length < 1 ) {
                    skills.concat(spliced.splice(0,spliced.length-1));
                }
            },
            save: function () {

                var req_save = {
                    method: 'POST',
                    url: 'https://giv-server.herokuapp.com/createrela',
                    data: {
                        "sID": profile_user.user_id,
                        "label": "SKILL",
                        "skills": user_skill
                    }
                };

                $http(req_save).success(function (resp) {
                    // Handle success
                    console.log("Save relation successful! " + resp);
                }).error(function (error) {

                    // Handle error
                    console.log("Save error: " + error);
                });
            },
            remove: function () {
                var req_remove = {
                    method: 'POST',
                    url: 'https://giv-server.herokuapp.com/deleterela',
                    data: {
                        "sID": profile_user.user_id,
                        "label": "SKILL",
                        "skills": user_skill
                    }
                };

                $http(req_remove).success(function (resp) {
                    // Handle success
                    console.log("Remove relation successful! " + resp);
                }).error(function (error) {

                    // Handle error
                    console.log("Remove error: " + error);
                });
            }

        }
    });