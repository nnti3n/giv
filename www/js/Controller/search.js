angular.module('starter.controllers')

    .controller('SearchCtrl', function ($scope, SkillSet, $http) {
        //$scope.skills = SkillSet.all();

        $http.get('https://giv-server.herokuapp.com/getallskill').
            success(function (data) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.skills = data;
            });

        $scope.more = function () {
            SkillSet.more();
        };

        $scope.select = function (object) {
            //push skill id to array
            SkillSet.select(object);

            if ($scope.skills[$scope.skills.indexOf(object)].selected) {
                $scope.skills[$scope.skills.indexOf(object)].selected = false;
            }
            else {
                $scope.skills[$scope.skills.indexOf(object)].selected = true;
            }
        };

        $scope.save = function () {
          SkillSet.save();
        };
    });