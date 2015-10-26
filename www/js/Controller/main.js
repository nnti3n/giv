angular.module('starter.controllers')

.controller('mainController', function ($ionicLoading, $scope) {
    $scope.show = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="ripple" class="spinner-positive"></ion-spinner>'
        });
    };
    $scope.hide = function () {
        $ionicLoading.hide();
    };
});