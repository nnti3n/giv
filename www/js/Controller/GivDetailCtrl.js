GIVapp.controller('GivDetailCtrl', function ($scope, $stateParams, store, $state) {
        $scope.show();

        var giv = {};
        var giv_id = $state.params.givId;

        user.child("users").child(giv_id).once("value", function (snapshot) {
            giv = snapshot.val();
            //id for message purpose
            giv.id = giv_id;
            console.log(giv);
            $scope.giv = giv;
            $scope.$digest();
            $scope.hide();
        });


        //init the scope array
        $scope.IM = {};
        $scope.IM.content = '';

        var profile_user = store.get('profile');

        //send message
        $scope.sendMessage = function (chat_mate) {
            $state.go('tab.message/message-detail', {chat_mate: chat_mate});
        };

        //add favorite user
        $scope.favoriteAdd = function () {
            var json_id = {};
            json_id[giv_id] = true;
            user.child("users").child(profile_user.user_id).child("favorite").update(json_id, function (error) {
                if (error) {
                    alert("Your message could not be sent." + error);
                } else {
                    alert("add to favorite successfully.");
                }
            });
        };

        $scope.GoToLink = function (url) {
            window.open(url, '_system', 'location=yes');
            $scope.hide();
        };
        console.log($state.params.givId);
        //$scope.hide();
    });