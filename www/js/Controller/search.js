angular.module('starter.controllers')

    .controller('SearchCtrl', function ($scope, SkillSet) {
        $scope.skills = SkillSet.all();

        $scope.more = function () {
            SkillSet.more();
        };

        $scope.remove = function (object) {
            SkillSet.remove(object);
        }
    });