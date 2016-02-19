var baseurl = "http://slack.jikbakguri.com";
// var baseurl = "http://127.0.0.1:8000";
angular.module('starter.controllers', ['starter.services','ngOpenFB', 'ngStorage', 'ngCookies'])

.controller('AuthCtrl', function($scope, $state, ngFB, $http, $q, $window) {
  if($window.localStorage.token){
    $state.go('tab.slack');
  }

  $scope.fbLogin = function () {
    ngFB.login({scope: 'email,public_profile,publish_actions'}).then(
      function (response) {
        if (response.status === 'connected') {
          console.log(response.authResponse.accessToken)
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
    $http.post(baseurl +'/facebook/', user).then(function(resp) {
      console.log(resp)

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

.controller('LoginCtrl', function($scope, $state, $http, $q, $window) {
  $scope.user = {};

  $scope.logIn = function(user){
    $scope.user = {'email':user.email, 'password':user.password};
    console.log($scope.user)
    var deferred = $q.defer();

    $http.post(baseurl + '/login/',user).then(function(resp) {
      console.log(resp)

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

  };

})

.controller('SignupCtrl', function($scope, $state, $http, $window, $q) {
  $scope.user = {};

  $scope.signUp = function(user){
    $scope.user = {'email':user.email, 'username':user.username, 'password':user.password};
    var deferred = $q.defer();
    
    $http.post(baseurl + '/signup/',user).then(function(resp) {
      console.log(resp)
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

.controller('SlackCtrl', function($scope, $http, SlackList) {

  $scope.slacks = [];
  $scope.noMoreItemsAvailable =false;
  var num = 0;

  $scope.loadMore = function() {
    SlackList.ListMore(num).then(function(slacks){
      if(slacks === 404){
        $scope.noMoreItemsAvailable = true;
      }
      else{
        num += 1
        $scope.slacks = $scope.slacks.concat(slacks);
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    });
  };

  $scope.doRefresh = function() {
    num = 0
    $scope.noMoreItemsAvailable = false;
    SlackList.ListMore(num).then(function(slacks){
      num += 1
      $scope.slacks = slacks;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

})

.filter("slackType",function(){
  return function(value){
    if (value === 0){
      return "공개 초대"
    }
    else if(value === 1){
      return "승인 초대"
    }
    else{
      return "초대 불가"
    }
  }
})

.controller('SlackDetailCtrl', function($scope, $stateParams, $http, $window, sendInvite) {
  var slackId = $stateParams.slackId;

  $http.get(baseurl + '/slacks/'+ slackId +'/').then(function(resp) {
    $scope.slack ={};
    console.log('Success',resp);
    $scope.slack = resp;
  },
  function(err) {
    console.error('ERR', err);
  })

  $scope.register = function(text){

    var user_register = {'slack_id': $scope.slack.data[0].id, 'user_id' : $window.localStorage.userid, 'description':text.description};
    console.log(user_register)
    $http.post(baseurl + '/register/', user_register).then(function(resp) {

      console.log(resp)
      alert('신청 완료되었습니다.');
      if($scope.slack.data[0].type === 0){
        sendInvite.SendInvite($scope.slack.data[0].id);
      }

    },
    function(err) {
      console.error('ERR', err);
      alert('이미 신청했습니다.');
    })

  }
})

.controller('MyRegistersCtrl', function($scope, $http, $window, myRegisterList) {

  $scope.myRegisters = [];
  $scope.noMoreItemsAvailable =false;
  var num = 0;

  $scope.loadMore = function() {
    myRegisterList.ListMore(num).then(function(myRegisters){
      if(myRegisters === 404){
        $scope.noMoreItemsAvailable = true;
      }
      else{
        num += 1
        $scope.myRegisters = $scope.myRegisters.concat(myRegisters);
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    });
  };

  $scope.doRefresh = function() {
    num = 0
    $scope.noMoreItemsAvailable = false;
    myRegisterList.ListMore(num).then(function(myRegisters){
      num += 1
      $scope.myRegisters = myRegisters;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };


})

.filter("registerType",function(){
  return function(value){
    if (value == 0){
      return "대기중"
    }
    else if(value == 1){
      return "초대완료"
    }
    else{
      return "초대거절"
    }
  }
})
.controller('MyRegistersDetailCtrl', function($scope, $stateParams) {
})



.controller('MySlacksCtrl', function($scope, $http, $window, mySlackList) {

 $scope.mySlacks = [];
 $scope.noMoreItemsAvailable =false;
 var num = 0;

 $scope.loadMore = function() {
  mySlackList.ListMore(num).then(function(mySlacks){
    if(mySlacks === 404){
      $scope.noMoreItemsAvailable = true;
    }
    else{
      num += 1
      $scope.mySlacks = $scope.mySlacks.concat(mySlacks);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }
  });
};

$scope.doRefresh = function() {
  num = 0
  $scope.noMoreItemsAvailable = false;
  mySlackList.ListMore(num).then(function(mySlacks){
    num += 1
    $scope.mySlacks = mySlacks;
    $scope.$broadcast('scroll.refreshComplete');
  });
};

})

.controller('MySlacksDetailCtrl', function($scope, $stateParams, $http, sendInvite) {
  var slackId = $stateParams.slackId;
  $http.get(baseurl + '/myslacks/' + slackId + '/').then(function(resp) {
    $scope.mySlacksRegister ={};
    console.log('Success',resp);
    $scope.mySlacksRegister = resp;
  },
  function(err) {
    console.error('ERR', err);
  })

  $scope.check = function(num,id){
    var information = {'register_id' : id, 'num' : num};
    console.log($scope.information)
    $http.post(baseurl + '/myslacks/' + slackId + '/', information).then(function(resp) {
      console.log('Success',resp);
      if(resp.data == 1){
        console.log("gogo")
        sendInvite.SendInvite(slackId)
      }
      else{
        alert('초대 거절되었습니다.');
      }
    },
    function(err) {
      console.error('ERR', err);
    })
  };

})


.controller('SettingsCtrl', function($scope, $window, $state, $http) {

  $scope.register = function(slack){
    $scope.slack = slack
    $scope.slack.user_id = $window.localStorage.userid;
    console.log(slack)

    $http.post(baseurl + '/slregister/', slack).then(function(resp) {

      console.log('Success',resp);
      console.log(resp)
      alert('등록 완료되었습니다.');
    },
    function(err) {
      console.error('ERR', err);
      alert('등록 실패되었습니다.');
    })
  }

  $scope.logout = function () {
    $window.localStorage.removeItem('token');
    $window.localStorage.removeItem('username');
    $window.localStorage.removeItem('userid');
    $window.localStorage.removeItem('fbAccessToken');
    $state.go('auth.walkthrough');
  }


});
