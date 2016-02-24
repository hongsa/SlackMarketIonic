angular.module('starter.services', [])

.factory('AuthInterceptor', function ($rootScope, $q, $window, $location) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.localStorage.token) {
        config.headers.Authorization = 'Token ' + $window.localStorage.token;
      }
      return config;
    },

    responseError: function (response) {
      if (response.status === 401) {
        $window.localStorage.removeItem('token');
        $window.localStorage.removeItem('username');
        $window.localStorage.removeItem('userid');
        $location.path('/');
        return;
      }
      return $q.reject(response);
    }
  };
})

.factory('ListGet', function($http){
  // var BASE_URL = "http://127.0.0.1:8000";
  var BASE_URL = "http://slack.jikbakguri.com";
  var lists = [];

  return {

    ListMore: function(AJAX_URL, num){
      return $http.get(BASE_URL+ AJAX_URL+ num +'/').then(function(resp){
        lists = resp.data;
        return lists;
      },
      function(err) {
        lists = err.status;
        return lists;
      })

    }
  }
})

.factory('ListPost', function($http, $window){
  // var BASE_URL = "http://127.0.0.1:8000";
  var BASE_URL = "http://slack.jikbakguri.com";
  var lists = [];

  return {

    ListMore: function(AJAX_URL, num){
      var user_id = $window.localStorage.userid;
      return $http.post(BASE_URL+ AJAX_URL + num +'/', user_id).then(function(resp){
        lists = resp.data;
        return lists;
      },
      function(err) {
        lists = err.status;
        return lists;
      })

    }
  }
})

.factory('typeColor', function(){

  return {

    Slack : function(value){
      var num = parseInt(value);
      if(num === 0){
        var css = { 'color':'rgb(0, 186, 210)' };
        return css;
      }
      else if( num === 1){
        var css = { 'color':'orange' };
        return css;
      }
      else{
        var css = { 'color':'red' };
        return css;
      }
    },

    Register : function(value){
      var num = parseInt(value);

      if(num === 0){
        var css = { 'color':'gray' };
        return css;
      }
      else if( num === 1){
        var css = { 'color':'rgb(0, 186, 210)' };
        return css;
      }
      else{
        var css = { 'color':'red' };
        return css;
      }
    }

  }

})


.factory('sendInvite', function($http, $window, $ionicPopup){
  // var BASE_URL = "http://127.0.0.1:8000";
  var BASE_URL = "http://slack.jikbakguri.com";

  return {

    SendInvite: function(slackid){
      var user_id = $window.localStorage.userid;
      var data ={'user_id' : user_id, 'slack_id' : slackid};
      return $http.post(BASE_URL+'/invite/', data).then(function(resp){
        $ionicPopup.alert({
         title: 'Alert',
         template: 'Invitation has been sent.'
       });
        return true;
      },
      function(err) {
        $ionicPopup.alert({
         title: 'Alert',
         template: 'Sending fails, please check again.'
       });
        return false;
      })

    }
  }
})





