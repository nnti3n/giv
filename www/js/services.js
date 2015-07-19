angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  //var chats = [{
  //  id: 0,
  //  name: 'Ben Sparrow',
  //  lastText: 'You on your way?',
  //  face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  //}, {
  //  id: 1,
  //  name: 'Max Lynx',
  //  lastText: 'Hey, it\'s me',
  //  face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  //}, {
  //  id: 2,
  //  name: 'Adam Bradleyson',
  //  lastText: 'I should buy a boat',
  //  face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  //}, {
  //  id: 3,
  //  name: 'Perry Governor',
  //  lastText: 'Look at my mukluks!',
  //  face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  //}, {
  //  id: 4,
  //  name: 'Mike Harrington',
  //  lastText: 'This is wicked good ice cream.',
  //  face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  //}];
  var chats = {};
  user.child("users_online").on("child_added",function(snapshot){
    //console.log("a");
    user.child("users").child(snapshot.key()).once("value",function(snap){
      //chats.push(snap.val());
      chats[snapshot.key()] = snap.val();
      //console.log(chats);
      //console.log(snapshot.key());
    });
    //chats.push(user.child("users").child(snapshot.key()).once("value",function(snap){}));
  });

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      //for (var i = 0; i < chats.length; i++) {
      //  if (chats[i].email === parseInt(chatId)) {
      //    return chats[i];
      //  }
      //}
      for (var child in chats) {
          if (child === chatId) {
            console.log(chats[child]);
            return chats[child];
          }
      }
      return null;
    }
  };
});
