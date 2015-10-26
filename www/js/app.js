// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordovaOauth', 'ngTwitter'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
/*
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
*/
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('AppCtrl', function($scope, $ionicPlatform, $twitterApi, $cordovaOauth) {

  var twitterKey = 'STORAGE.TWITTER.KEY';
  var clientId = 'w0TtlhxFEhYisSu0yWjlzFVk9';
  var clientSecret = 'UHoBcWQxZcX3JewnCklHpiYn4XjxUeus9qImiEAU0mIbx3E0rE';

  var USER_LISTS_URL = 'https://api.twitter.com/1.1/lists/ownerships.json';
  var LIST_FEED_URL = 'https://api.twitter.com/1.1/lists/statuses.json'; // list_id: {{id}}, include_entities: true, count: 10

  var myToken = '';
  $scope.tweet = {};
  $scope.userLists = [];

  $ionicPlatform.ready(function() {
    myToken = JSON.parse(window.localStorage.getItem(twitterKey));
    if (myToken === '' || myToken === null) {
      $cordovaOauth.twitter(clientId, clientSecret).then(function (succ) {
        myToken = succ;
        window.localStorage.setItem(twitterKey, JSON.stringify(succ));
        $twitterApi.configure(clientId, clientSecret, succ);

        $scope.getUserLists();
      }, function(error) {
        console.log(error);
      });
    } else {
      $twitterApi.configure(clientId, clientSecret, myToken);
      $scope.getUserLists();
    }
  });

  $scope.showHomeTimeline = function() {
    $twitterApi.getHomeTimeline().then(function(data) {
      $scope.home_timeline = data;
    });
  };

  $scope.submitTweet = function() {
    $twitterApi.postStatusUpdate($scope.tweet.message).then(function(result) {
      $scope.showHomeTimeline();
    });
  }

  $scope.getUserLists = function() {
    $twitterApi.getRequest(USER_LISTS_URL, {screen_name: myToken.screen_name}).then(function(data) {
      for (var i = 0; i < data.lists.length; i++) {
        var newList = {id: data.lists[i].id, name: data.lists[i].name, tweets: []};
        $scope.userLists.push(newList);
        $scope.getListTweets(newList.id);
      }
    });
  }

  $scope.getListTweets = function(listId) {
    $twitterApi.getRequest(LIST_FEED_URL, {list_id: listId, include_entities: true, count: 10}).then(function(data) {
      for (var i = 0; i < $scope.userLists.length; i++) {
        if($scope.userLists[i].id === listId)
          $scope.userLists[i].tweets = data;
      }
    });
  }

  $scope.doRefresh = function() {
    $scope.showHomeTimeline();
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.correctTimestring = function(string) {
    return new Date(Date.parse(string));
  };

});
