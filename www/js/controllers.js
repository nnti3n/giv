angular.module('starter.controllers', [])


.controller('DashCtrl', function($scope, store, auth, $state) {
      $scope.logout = function() {
        auth.signout();
        store.remove('token');
        store.remove('profile');
        store.remove('refreshToken');
        store.remove('firebaseToken');
        $state.go('login');
      };
      console.log(auth.profile);
      $scope.auth = auth;
})


.controller('moreCtrl', function($scope) {})

.controller('LoginCtrl', function(store, $scope, $location, auth, $state , $firebase) {
  // LoginCtrl.js
    $scope.login = function() {
      auth.signin({
        authParams: {
          scope: 'openid offline_access',
          device: 'Mobile device'
        }
      }, function(profile, token, accessToken, state, refreshToken) {
        store.set('profile', profile);
        store.set('token', token);
        store.set('refreshToken', refreshToken);
        $location.path('/');
        auth.getToken({
          api: 'firebase'
        }).then(function(delegation) {
          store.set('firebaseToken', delegation.id_token);
          $state.go('tab.dash');
          // save data to firebase
          // Here we're using the Firebase Token we stored after login
          user.authWithCustomToken(store.get('firebaseToken'), function(error, auth) {
            if (error) {
              // There was an error logging in, redirect the user to login page
              $state.go('login');
            }
            else console.log(auth);
          });
          var usersRef = user.child("users").child(profile.user_id);
          usersRef.once("value", function(snap) {
            if (snap.val() == null) {
              usersRef.set({
                "email": auth.profile.email,
                "full_name": auth.profile.name,
                "url": auth.profile.publicProfileUrl,
                "hashtag": 1
              });
            }
          })
        }, function(error) {
          // Error getting the firebase token
        })
      }, function() {
        // Error callback
      });
    };
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, store) {
  var profile_user = store.get('profile');
  console.log(profile_user);
  $scope.submit_hash = function () {
    var usersRef_x = user.child("users").child(profile_user.user_id).child("hashtag");
      usersRef_x.set({
        "hashtag1": $scope.hashtag.hashtag1,
        "hashtag2": $scope.hashtag.hashtag2,
        "hashtag3": $scope.hashtag.hashtag3
      }, function (error) {
        if (error) {
          alert("Hashtag could not be saved." + error);
        } else {
          alert("Hashtag saved successfully.");
        }
      });
  };
  $scope.settings = {
    enableFriends: true
  };

  var usersRef = user.child("users").child(profile_user.user_id).child("hashtag");
  usersRef.on("value", function(snap) {
    $scope.hashtag = {};
    var hashtag_val = snap.val();
    if ( hashtag_val.hashtag1 != null) {
      $scope.hashtag.hashtag1 = hashtag_val.hashtag1;
    }
    if ( hashtag_val.hashtag2 != null) {
      $scope.hashtag.hashtag2 = hashtag_val.hashtag2;
    }
    if ( hashtag_val.hashtag3 != null) {
      $scope.hashtag.hashtag3 = hashtag_val.hashtag3;
    }
  })
});
