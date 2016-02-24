angular.module('typeFilters', [])


.filter("slackType",function(){
  return function(value){
    if (value === 0){
      return "Public invitation"
    }
    else if(value === 1){
      return "Private invitation"
    }
    else{
      return "invitation impossible"
    }
  }
})

.filter("registerType",function(){
  return function(value){
    if (value === 0){
      return "Waiting"
    }
    else if(value === 1){
      return "Invite success"
    }
    else{
      return "Invite refusal"
    }
  }
})