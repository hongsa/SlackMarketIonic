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

.factory('SlackList', function($http){
  // var BASE_URL = "http://127.0.0.1:8000";
  var BASE_URL = "http://slack.jikbakguri.com";
  var slacks = [];

  return {

    ListMore: function(num){
      return $http.get(BASE_URL+'/lists/'+ num +'/').then(function(resp){
        slacks = resp.data;
        return slacks;
      },
      function(err) {
        slacks = err.status
        return slacks
      })

    }
  }
})

.factory('myRegisterList', function($http, $window){
  // var BASE_URL = "http://127.0.0.1:8000";
  var BASE_URL = "http://slack.jikbakguri.com";
  var myRegisters = [];

  return {

    ListMore: function(num){
      var user_id = $window.localStorage.userid;
      console.log(user_id)
      return $http.post(BASE_URL+'/myregisters/'+ num +'/', user_id).then(function(resp){
        console.log(resp);
        myRegisters = resp.data;
        return myRegisters;
      },
      function(err) {
        myRegisters = err.status
        return myRegisters
      })

    }
  }
})

.factory('mySlackList', function($http, $window){
  // var BASE_URL = "http://127.0.0.1:8000";
  var BASE_URL = "http://slack.jikbakguri.com";
  var mySlacks = [];

  return {

    ListMore: function(num){
      var user_id = $window.localStorage.userid;
      console.log(user_id)
      return $http.post(BASE_URL+'/myslackslist/'+ num +'/', user_id).then(function(resp){
        console.log(resp);
        mySlacks = resp.data;
        return mySlacks;
      },
      function(err) {
        mySlacks = err.status
        return mySlacks
      })

    }
  }
})







