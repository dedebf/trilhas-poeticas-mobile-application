angular.module('starter')

.controller('LoadingCtrl', function($ionicPopup, $ionicPlatform, $scope, $rootScope, $ionicNavBarDelegate, $timeout, InternetUtilsService, GpsUtilsService, $ionicHistory, $state, TrilhasService, SqlUtilsService) {
  var debug = true;

  $ionicNavBarDelegate.showBar(false);
  $scope.loadTextClass = "load-text";
  $scope.loadTextClass2 = "load-text-2";
  $scope.statusText = "Verificando internet e GPS...";
  var showTutorial = 'SHOW';

  $ionicPlatform.ready(function(){
    $scope.setAcceptedTerms = function(){
      SqlUtilsService.setAcceptedTerms();
      acceptedTerms = 'ACCEPTED';
      showTutorial = 'SHOW';
      goToTracks(showTutorial);
    };
    $scope.exitApp = function(){
      console.log("exitApp");
      ionic.Platform.exitApp();
    };

    var hasInternet;
    InternetUtilsService.hasInternet(function(result){
      hasInternet = result;
      checkInternetGps();
    });
    var hasGps;
    GpsUtilsService.hasGps(function(result){
      hasGps = result;
      checkInternetGps();
    });
    
    function checkInternetGps(){
      if(hasInternet && hasGps){
        $timeout(function(){
          $scope.loadTextClass = $scope.loadTextClass + " load-ok";
          $scope.statusText = "Verificando internet e GPS";
          $scope.statusText2 = "Buscando as Trilhas Póeticas...";
          getData();
        }, 3000);
      }else{
        //@TODO avisar que o app vai estar limitado sem internet
        console.log("internet: " + hasInternet);
        console.log("GPS: " + hasGps);
      }
    }


    function getData(){
      console.log("getData");
      var hasSync = false;
      SqlUtilsService.setupTables(function(res){
        if(res){
          SqlUtilsService.getConfig(function(result){
            syncDate = result.SYNC_DATE;
            showTutorial = result.TUTORIAL;
            acceptedTerms = result.ACCEPTED_TERMS;
            console.log(result);
            console.log(result.SYNC_DATE);
            console.log(result.TUTORIAL);
            console.log(result.USER_EMAIL);
            if(result.USER_EMAIL){
              $rootScope.userEmail = result.USER_EMAIL;
            }
            if(syncDate){
              if(syncDate != NaN){
                TrilhasService.getFullSetAfterDate(syncDate,function(result){
                  if(result){
                    goToTracks(showTutorial);
                  }else{
                    $ionicPopup.alert({
                      title: 'Ops! Não conseguimos acessar o servidor, tente mais tarde. ;)',
                      template: '<img ng-src="" src="img/ico3_ponto_indisp.png" class="my-loading" style="width:50%; text-align: center;"><p class="load-text-popup">Ligue o GPS e tente novamente</p>',
                    })
                    .then(function(){
                      ionic.Platform.exitApp();
                    });
                  }
                });
              }
            }else{
              $rootScope.syncDateMillis = 0;
              TrilhasService.getFullSetAfterDate(0,function(result){
                console.log(result);
                if(result){
                  goToTracks("SHOW");
                }else{
                    $ionicPopup.alert({
                      title: 'Ops! Não conseguimos acessar o servidor, tente mais tarde. ;)',
                      template: '<img ng-src="" src="img/ico3_ponto_indisp.png" class="my-loading" style="width:50%; text-align: center;"><p class="load-text-popup">Ligue o GPS e tente novamente</p>',
                    })
                    .then(function(){
                      ionic.Platform.exitApp();
                    });
                }
              });
            }
          });
        }
      });
    }
  });

  function goToTracks(showTutorial){
    $scope.loadTextClass2 = $scope.loadTextClass2 + " load-ok";
    $scope.statusText2 = "Buscando as Trilhas Póeticas";
    $ionicHistory.nextViewOptions({
  		disableBack: true,
      historyRoot: true,
      disableAnimate: true
    });
    console.log("goToTracks");
    console.log(showTutorial);
    console.log(acceptedTerms);
    $ionicHistory.clearCache().then(function(){
      $ionicHistory.removeBackView();
      $ionicHistory.clearHistory();
      $rootScope.hasFilter = false;

      console.log((showTutorial == 'SHOW') && (acceptedTerms == 'ACCEPTED'));

      if((showTutorial == 'NSHOW') && (acceptedTerms == 'ACCEPTED')){
        $state.go('app.trilhas');
      }else if(acceptedTerms == 'ACCEPTED'){
        if(showTutorial == 'SHOW'){
          $state.go('app.tour');
        }else{
          $state.go('app.trilhas');
        }
      }else{
        $state.go('app.terms');
      }
    });
  }
});