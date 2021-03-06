var BASE_URL = "http://slack.jikbakguri.com";
// var BASE_URL = "http://127.0.0.1:8000";
angular.module('starter.controllers', ['starter.services','ngOpenFB', 'ngStorage', 'ngCookies'])

.controller('AuthCtrl', function($scope, $state, ngFB, $http, $q, $window) {
  if($window.localStorage.token){
    $state.go('tab.slack');
  }

  $scope.fbLogin = function () {
    ngFB.login({scope: 'email,public_profile,publish_actions'}).then(
      function (response) {
        if (response.status === 'connected') {
          console.log('Facebook login succeeded');
          $scope.goServer();
        } 
        else {
          alert('Facebook login failed');
        }
      })
  }

  $scope.goServer = function(){
    //저장할 회원 값 가져오기
    var user = {};
    ngFB.api({
      path: '/me',
      params: {fields: 'id,name,email,gender,updated_time,locale'}
    }).then(
    function (resp) {
      angular.extend(user,resp)
      var deferred = $q.defer();

    // ajax 시작
    $http.post(BASE_URL +'/facebook/', user).then(function(resp) {

      var token = resp.data.token;
      var username = resp.data.username;
      var userid = resp.data.id;

      if (token && username) {
        $window.localStorage.token = token;
        $window.localStorage.username = username;
        $window.localStorage.userid = userid;
        deferred.resolve(true);
        $state.go('tab.slack');
      } else {
        deferred.reject('Invalid data received from server');
      }

    },
    function(err) {
      console.error('ERR', err);
    })
    //ajax 끝
  },
  //페이스북에서 회원 값 가져오기 실패
  function (error) {
    alert('Facebook error: ' + error.error_description);
  });
  }

})

.controller('LoginCtrl', function($scope, $state, $http, $q, $window, $ionicPopup) {
  $scope.user = {};

  $scope.logIn = function(user){
    $scope.user = {'email':user.email, 'password':user.password};
    var deferred = $q.defer();

    $http.post(BASE_URL + '/login/',user).then(function(resp) {

      var token = resp.data.token;
      var username = resp.data.username;
      var userid = resp.data.id;

      if (token && username) {
        $window.localStorage.token = token;
        $window.localStorage.username = username;
        $window.localStorage.userid = userid;
        deferred.resolve(true);
        $state.go('tab.slack');
      } else {
        deferred.reject('Invalid data received from server');
      }
    },
    function(err) {
      if(err.status === 403){
        $ionicPopup.alert({
         title: 'Alert',
         template: 'Password Error!'
       });

      }
      else if(err.status === 404){
        $ionicPopup.alert({
         title: 'Alert',
         template: 'Email is not found!'
       });
      }
      else{
        $ionicPopup.alert({
         title: 'Alert',
         template: 'Facebook Login Please!'
       });
      }
    })

  };

})

.controller('SignupCtrl', function($scope, $state, $http, $window, $q, $ionicPopup) {
  $scope.user = {};

  $scope.signUp = function(user){
    $scope.user = {'email':user.email, 'username':user.username, 'password':user.password};
    var deferred = $q.defer();
    
    $http.post(BASE_URL + '/signup/',user).then(function(resp) {
      var token = resp.data.token;
      var username = resp.data.username;
      var userid = resp.data.id;

      if (token && username) {
        $window.localStorage.token = token;
        $window.localStorage.username = username;
        $window.localStorage.userid = userid;
        deferred.resolve(true);
        $state.go('tab.slack');
      } else {
        deferred.reject('Invalid data received from server');
      }


      $state.go('tab.slack');
    },
    function(err) {
      console.error('ERR', err);

      if(err.data === 'email'){
        $ionicPopup.alert({
         title: 'Alert',
         template: 'Email overlapped!'
       });
      }
      else if(err.data === 'username'){
        $ionicPopup.alert({
         title: 'Alert',
         template: 'Username overlapped!'
       });
      }
      else{
        $ionicPopup.alert({
         title: 'Alert',
         template: 'Error'
       });
      }
    })
  };

})

.controller('ForgotPasswordCtrl', function($scope, $state) {
  $scope.recoverPassword = function(){
    $state.go('tab.slack');
  };

  $scope.user = {};
})


// slack 부분 시작

.controller('SlackCtrl', function($scope, $http, ListGet, typeColor) {

  $scope.slacks = [];
  $scope.noMoreItemsAvailable =false;
  var num = 0;
  var AJAX_URL = "/lists/";

  $scope.loadMore = function() {
    ListGet.ListMore(AJAX_URL, num).then(function(slacks){
      if(slacks === 404){
        $scope.noMoreItemsAvailable = true;
      }
      else{
        num += 1;
        $scope.slacks = $scope.slacks.concat(slacks);
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    });
  };

  $scope.doRefresh = function() {
    num = 0;
    $scope.noMoreItemsAvailable = false;
    ListGet.ListMore(AJAX_URL, num).then(function(slacks){
      num += 1;
      $scope.slacks = slacks;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.typeColor = function(value){
    return typeColor.Slack(value);
  };

})

.controller('SlackDetailCtrl', function($scope, $stateParams, $http, $window, sendInvite, $ionicPopup, typeColor) {
  var slackId = $stateParams.slackId;

  $http.get(BASE_URL + '/slacks/'+ slackId +'/').then(function(resp) {
    $scope.slack ={};
    console.log('Success',resp);
    $scope.slack = resp;
  },
  function(err) {
    console.error('ERR', err);
  })

  $scope.register = function(text){

    var user_register = {'slack_id': $scope.slack.data[0].id, 'user_id' : $window.localStorage.userid, 'description':text.description};
    $http.post(BASE_URL + '/register/', user_register).then(function(resp) {

      $ionicPopup.alert({
       title: 'Alert',
       template: 'Register Success!'
     });

      if($scope.slack.data[0].type === 0){
        sendInvite.SendInvite($scope.slack.data[0].id);
      }
    },
    function(err) {
      console.error('ERR', err);
      $ionicPopup.alert({
       title: 'Alert',
       template: 'Already registered!'
     });

    })
  }
  $scope.typeColor = function(value){
    return typeColor.Slack(value);
  };

})

.controller('MyRegistersCtrl', function($scope, $http, $window, ListPost, typeColor) {

  $scope.myRegisters = [];
  $scope.noMoreItemsAvailable =false;
  var num = 0;
  var AJAX_URL = "/myregisters/";

  $scope.loadMore = function() {
    ListPost.ListMore(AJAX_URL, num).then(function(myRegisters){
      if(myRegisters === 404){
        $scope.noMoreItemsAvailable = true;
      }
      else{
        num += 1;
        $scope.myRegisters = $scope.myRegisters.concat(myRegisters);
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    });
  };

  $scope.doRefresh = function() {
    num = 0;
    $scope.noMoreItemsAvailable = false;
    ListPost.ListMore(AJAX_URL, num).then(function(myRegisters){
      num += 1;
      $scope.myRegisters = myRegisters;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.typeColor = function(value){
    return typeColor.Register(value);
  };



})

.controller('MyRegistersDetailCtrl', function($scope, $stateParams) {
})


.controller('MySlacksCtrl', function($scope, $http, $window, ListPost, typeColor) {

 $scope.mySlacks = [];
 $scope.noMoreItemsAvailable =false;
 var num = 0;
 var AJAX_URL = "/myslackslist/";

 $scope.loadMore = function() {
  ListPost.ListMore(AJAX_URL, num).then(function(mySlacks){
    if(mySlacks === 404){
      $scope.noMoreItemsAvailable = true;
    }
    else{
      num += 1;
      $scope.mySlacks = $scope.mySlacks.concat(mySlacks);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }
  });
};

$scope.doRefresh = function() {
  num = 0
  $scope.noMoreItemsAvailable = false;
  ListPost.ListMore(AJAX_URL, num).then(function(mySlacks){
    num += 1;
    $scope.mySlacks = mySlacks;
    $scope.$broadcast('scroll.refreshComplete');
  });
};

$scope.typeColor = function(value){
  return typeColor.Slack(value);
};



})

.controller('MySlacksDetailCtrl', function($scope, $stateParams, $http, sendInvite, $ionicPopup) {
  var slackId = $stateParams.slackId;
  $http.get(BASE_URL + '/myslacks/' + slackId + '/').then(function(resp) {
    $scope.mySlacksRegister ={};
    console.log('Success',resp);
    $scope.mySlacksRegister = resp;
  },
  function(err) {
    console.error('ERR', err);
  })

  $scope.check = function(num,id){
    var information = {'register_id' : id, 'num' : num};
    $http.post(BASE_URL + '/myslacks/' + slackId + '/', information).then(function(resp) {
      console.log('Success',resp);
      if(resp.data === 1){
        sendInvite.SendInvite(slackId);
      }
      else{
        $ionicPopup.alert({
         title: 'Alert',
         template: 'Refuse success!'
       });
      }
    },
    function(err) {
      console.error('ERR', err);
    })
  };

})


.controller('SettingsCtrl', function($scope, $window, $state, $http) {

  $scope.user = {'username': $window.localStorage.username};

  $scope.logout = function () {
    $window.localStorage.removeItem('token');
    $window.localStorage.removeItem('username');
    $window.localStorage.removeItem('userid');
    $window.localStorage.removeItem('fbAccessToken');
    $state.go('auth.walkthrough');
  };
})


.controller('AddSlackCtrl', function($scope, $window, $state, $http, $ionicPopup) {

  $scope.register = function(slack){
    $scope.slack = slack;
    $scope.slack.user_id = $window.localStorage.userid;

    $http.post(BASE_URL + '/slregister/', slack).then(function(resp) {

      $ionicPopup.alert({
       title: 'Alert',
       template: 'Slack upload success!'
     });

      $state.go('tab.slack');
    },
    function(err) {
      console.error('ERR', err);
      $ionicPopup.alert({
       title: 'Alert',
       template: 'Fail!'
     });
    })
  }

});
