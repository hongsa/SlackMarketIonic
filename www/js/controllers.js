// var baseurl = "http://slack.jikbakguri.com"
var baseurl = "http://127.0.0.1:8000"
angular.module('starter.controllers', ['starter.services','ngOpenFB', 'ngStorage', 'ngCookies'])

.controller('AuthCtrl', function($scope, $state, ngFB, $http, $ionicLoading) {

  $scope.fbLogin = function () {
    ngFB.login({scope: 'email,public_profile,publish_actions'}).then(
      function (response) {
        if (response.status === 'connected') {
          console.log('Facebook login succeeded');
        } else {
          alert('Facebook login failed');
        }
      });

    //저장할 회원 값 가져오기
    ngFB.api({
      path: '/me',
      params: {fields: 'id,name,email,gender,updated_time,locale'}
    }).then(
    function (user) {
      $scope.user = user;

    // ajax 시작
    $http.post(baseurl +'/facebook/',user).then(function(resp) {
      console.log(resp)
      $state.go('tab.slack');
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
  };

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

      // $cookies.put('user_id', resp.data.id)
      // $cookies.put('user_email', resp.data.email)

      // $cookies.put('sessionId', resp.headers['Set-Cookie']);
      

      // $cookies.userName = 'Sandeep';
      // $cookieStore.put('flower', 'Rose');

      // $localStorage.LocalMessage = resp.data
      // $sessionStorage.SessionMessage = resp.data

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

.controller('SlackCtrl', function($scope,$http) {

  $http.get(baseurl + '/lists/0/').then(function(resp) {
    $scope.slacks ={};
    console.log('Success',resp);
    $scope.slacks = resp;
  },
  function(err) {
    console.error('ERR', err);
  })

  // $scope.doRefresh = function(){

  //   $http.get(baseurl + '/slacks/').then(function(resp) {
  //     $scope.slacks ={};

  //     console.log('Success',resp);
  //     $scope.slacks = resp;
  //   },
  //   function(err) {
  //     console.error('ERR', err);
  //   })
  // }

  // $scope.loadMore = function() {
  //   $http.get(baseurl + '/slacks/').then(function(resp) {
  //     $scope.slacks ={};

  //     console.log('Success',resp);
  //     $scope.slacks = resp;
  //   },
  //   function(err) {
  //     console.error('ERR', err);
  //   })
  // };

  // $scope.$on('$stateChangeSuccess', function() {
  //   $scope.loadMore();
  // });


})

.filter("slackType",function(){
  return function(value){
    if (value == 0){
      return "공개 초대"
    }
    else if(value == 1){
      return "승인 초대"
    }
    else{
      return "초대 불가"
    }
  }
})

.controller('SlackDetailCtrl', function($scope, $stateParams, $http, $window) {
  $scope.slackId = $stateParams.slackId;

  $http.get(baseurl + '/slacks/'+$scope.slackId+'/').then(function(resp) {
    $scope.slack ={};
    console.log('Success',resp);
    $scope.slack = resp;
  },
  function(err) {
    console.error('ERR', err);
  })

  $scope.register = function(text){

    $scope.user_register = {'slack_id': $scope.slack.data[0].id, 'user_id' : $window.localStorage.userid, 'description':text.description}
    console.log($scope.user_register)
    $http.post(baseurl + '/register/', $scope.user_register).then(function(resp) {

      console.log('Success',resp);
      console.log(resp)
      alert('신청 완료되었습니다.');
    },
    function(err) {
      console.error('ERR', err);
      alert('이미 신청했습니다.');
    })


  }
})

.controller('MyRegistersCtrl', function($scope, $http, $window) {

  $scope.user_id = $window.localStorage.userid
  $http.post(baseurl + '/myregisters/', $scope.user_id).then(function(resp) {
    $scope.myRegisters ={};
    console.log('Success',resp);
    $scope.myRegisters = resp;
  },
  function(err) {
    console.error('ERR', err);
  })

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
.controller('MyRegistersDetailCtrl', function($scope, $stateParams, Chats) {
})



.controller('MySlacksCtrl', function($scope, $http, $window) {

  $scope.user_id = $window.localStorage.userid
  $http.post(baseurl + '/myslacks/', $scope.user_id).then(function(resp) {
    $scope.mySlacks ={};
    console.log('Success',resp);
    $scope.mySlacks = resp;
  },
  function(err) {
    console.error('ERR', err);
  })
})

.controller('MySlacksDetailCtrl', function($scope, $stateParams, $http) {
  $scope.slackId = $stateParams.slackId;
  $http.get(baseurl + '/myslacks/' + $scope.slackId + '/').then(function(resp) {
    $scope.mySlacksRegister ={};
    console.log('Success',resp);
    $scope.mySlacksRegister = resp;
  },
  function(err) {
    console.error('ERR', err);
  })

  $scope.check = function(num,id){
    $scope.information = {'register_id' : id, 'num' : num}
    console.log($scope.information)
    $http.post(baseurl + '/myslacks/' + $scope.slackId + '/', $scope.information).then(function(resp) {
      console.log('Success',resp);
      if(resp.data == 1){
        alert('초대 수락되었습니다.');
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

.controller('ProfileCtrl', function ($scope, ngFB) {
  ngFB.api({
    path: '/me',
    params: {fields: 'id,name,email,gender,updated_time,locale'}
  }).then(
  function (user) {
    console.log(user)
    $scope.user = user;
  },
  function (error) {
    alert('Facebook error: ' + error.error_description);
  });


});
