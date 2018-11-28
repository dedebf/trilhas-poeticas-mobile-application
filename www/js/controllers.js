angular.module('starter.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $state, $timeout, GpsUtilsService, SqlUtilsService, $ionicLoading, $ionicNavBarDelegate, $ionicSlideBoxDelegate) {

  $rootScope.hasFilter = true;
  $rootScope.hasFilter = $rootScope.hasFilter;

  // Tour
  $scope.startApp = function() {
    SqlUtilsService.setShowTutorial(false);
    $state.go('app.trilhas');
  };
  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };

  $scope.statusFilterParentalToggle = function(parentalRating){
    if(parentalRating == $rootScope.statusFilterParental){
      $rootScope.statusFilterParental = ''  ;
    }else{
      $rootScope.statusFilterParental = parentalRating;
    }
  }

// Login
  $scope.loginData = {};
  if($rootScope.userEmail){
    $scope.loginData.email = $rootScope.userEmail;
  }

  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData.email);
    SqlUtilsService.updateUserEmail($scope.loginData.email);
    $rootScope.userEmail = $scope.loginData.email;
    $scope.closeLogin();
  };

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
      if(toState.name == "app.trilhas"){
        $ionicNavBarDelegate.showBackButton(false);
        $ionicNavBarDelegate.showBar(true);
        $ionicNavBarDelegate.align('center');
        $rootScope.currentTrack = null;

        $rootScope.hasFilter = true;
        $rootScope.fieldFilter = 'DISTANCE';
        $rootScope.statusFilter = '';
        $rootScope.statusFilterParental = '';

      }else{
        $rootScope.hasFilter = false;
      }
      if(toState.name == "app.trilha"){
        console.log("indo para a trilha");
        $ionicLoading.show({
          template: '</br><img ng-src="" src="img/00_Trilhas_Oficial_Simbolo_small.png" class="my-loading" style="width:50%; text-align: center;"></br></br><p class="load-text-popup">Carregando os Pontos...</p></br>'
        });
      }
      if(fromState.name == "app.ponto" && toState.name == "app.trilha"){
        console.log("do ponto para a trilha");
        console.log(window.screen.orientation);
        console.log(screen.orientation);
        if(window.screen.orientation)
          window.screen.orientation.lock('portrait');
        GpsUtilsService.clearWatchId();
      }
  });

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if(toState.name != "app.trilhas"){
      $timeout(function(){
        $ionicLoading.hide();
      },3000);
    }

    if(toState.name == "app.trilhas"){
      if($rootScope.clearTrackCache){
        $rootScope.updateTracks();
        $rootScope.clearTrackCache = false;
      }
    }

    if(toState.name == "app.tour"){
      $ionicNavBarDelegate.showBackButton(false);
      $ionicNavBarDelegate.showBar(false);
    }

  });

  $scope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams) {
  });

  $scope.$on('$stateNotFound', function(event, toState, toParams, fromState, fromParams) {
  });

});
