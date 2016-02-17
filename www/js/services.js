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
  var BASE_URL = "http://127.0.0.1:8000";
  // var BASE_URL = "http://slack.jikbakguri.com";
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

