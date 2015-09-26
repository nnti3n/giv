GIVapp.controller('MessageCtrl', function ($scope, store, auth, $state) {
        $scope.show();

        //get user_id for local storage to load all user's chat rooms
        var profile_user = store.get('profile');
        var roomsRef_u = user.child("users").child(profile_user.user_id).child("rooms");

        // list all chat rooms
        var rooms = [];
        //get all rooms of user
        roomsRef_u.on("child_added", function (snapshot) {
            var chat_room = Object.keys(snapshot.val())[0]; //room id
            var chat_key = snapshot.key(); // chat mate id
            console.log(chat_key);
            //push the chat_mate info
            user.child("users").child(chat_key).once("value", function (snap_profile) {
                // push chat mate user profile to array
                rooms.push(snap_profile.val());
                var seen = snapshot.val()[chat_room].seen;
                var last = snapshot.val()[chat_room].last;
                var time = new Date(parseInt(last));
                //add chat mate id and last message to array
                rooms[rooms.length - 1].room_id = chat_room;
                rooms[rooms.length - 1].id = chat_key;
                rooms[rooms.length - 1].time = time.toLocaleDateString() + " " + time.toLocaleTimeString();
                rooms[rooms.length - 1].seen = seen;
                rooms[rooms.length - 1].last = last;
                console.log(rooms);
                $scope.rooms = rooms; // set view to frontend
                $scope.hide();
            });
        });
        console.log(rooms);

        $scope.openRoom = function (roomId, chat_mate) {
            console.log(roomId);
            $state.go('tab.message/message-detail', {roomId: roomId, chat_mate: chat_mate});
        };

        $scope.GoToLink = function (url) {
            window.open(url, '_system', 'location=yes');
        };

        $scope.hide();
        //  end of message controller
    });