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

    .factory('SkillSet', function (store, $http, $timeout) {
        //var skills = [{"skill": "entrepreneur", "id": 1}, {
        //    "skill": "software engineer",
        //    "id": 3
        //}, {"skill": "UI/UX Designer", "id": 4}, {"skill": "Business Analyst", "id": 5}, {
        //    "skill": "entrepreneur",
        //    "id": 6
        //}, {"skill": "software engineer", "id": 7}, {"skill": "UI/UX Designer", "id": 8}, {
        //    "skill": "Business Analyst",
        //    "id": 9
        //}, {"skill": "entrepreneur", "id": 10}, {"id": 11, "skill": "software engineer"}, {
        //    "id": 12,
        //    "skill": "UI/UX Designer"
        //}, {"id": 13, "skill": "Business Analyst"}, {"id": 14, "skill": "entrepreneur"}, {
        //    "id": 15,
        //    "skill": "software engineer"
        //}, {"id": 16, "skill": "UI/UX Designer"}, {"skill": "Business Analyst", "id": 17}, {
        //    "skill": "entrepreneur",
        //    "id": 19
        //}, {"skill": "Javascript", "id": 54}, {"skill": "Data Scientist", "id": 58}, {
        //    "skill": "Entreprenuer",
        //    "id": 60
        //}, {"skill": "Growth Hacker", "id": 61}, {"skill": "UI/UX Designer", "id": 66}, {
        //    "skill": "Startup",
        //    "id": 67
        //}, {"skill": "Big Data", "id": 68}];

        var user_skill = [];

        function isInArray(value, array) {
            return array.indexOf(value) > -1;
        }

        var skills = [];

        return {
            select: function (object) {
                if (isInArray(object.id, user_skill)) {
                    user_skill.splice(user_skill.indexOf(object.id), 1);
                }
                else {
                    user_skill.push(object.id);
                }
                console.log(user_skill);
            },
            more: function () {
                skills.splice(0, 10);
            },
            save: function () {

                var profile_user = store.get('profile');

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
            }

        }
    });