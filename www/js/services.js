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
  var slacks = [];
  var num = 0;
  
  return {
    List: function(){
      return $http.get(BASE_URL+'/lists/'+ num +'/').then(function(resp){
        slacks = resp.data;
        return slacks;
      });
    },
    ListMore: function(){
      num += 1
      return $http.get(BASE_URL+'/lists/'+ num +'/').then(function(resp){
        slacks = resp.data;
        return slacks;
      });
    }
  }
})

