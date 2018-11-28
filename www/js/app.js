// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite, $rootScope, $location, GpsUtilsService, $cordovaGoogleAnalytics) {
  
  $ionicPlatform.ready(function() {
    /*Config GoogleAnalytics*/
    // $cordovaGoogleAnalytics.debugMode();
    // $cordovaGoogleAnalytics.startTrackerWithId('');
    // $cordovaGoogleAnalytics.trackView($location.path());

    $rootScope.$on('$stateChangeSuccess', function (event) {
      console.log($location.path().split('/').length);

      if($rootScope.currentPoi && $rootScope.currentTrack){
        if($location.path().split('/').length==4){
          $cordovaGoogleAnalytics.trackView($location.path()+"/"+$rootScope.currentTrack.TRACK_NAME.replace(/ /g, "_")+"/"+$rootScope.currentTrack.STATUS.replace(/ /g, "_"));
          // window.ga('send', 'pageview', $location.path()+"/"+$rootScope.currentTrack.TRACK_NAME.replace(/ /g, "_")+"/"+$rootScope.currentTrack.STATUS.replace(/ /g, "_"));
          console.log('send - pageview '+ $location.path()+"/"+$rootScope.currentTrack.TRACK_NAME.replace(/ /g, "_")+"/"+$rootScope.currentTrack.STATUS.replace(/ /g, "_"));
        }else if($location.path().split('/').length==5){
          $cordovaGoogleAnalytics.trackView($location.path()+"/"+$rootScope.currentTrack.TRACK_NAME.replace(/ /g, "_")+"/"+$rootScope.currentTrack.STATUS.replace(/ /g, "_")+"/"+$rootScope.currentPoi.NAME.replace(/ /g, "_")+"/"+$rootScope.currentPoi.STATUS.replace(/ /g, "_"));
          // window.ga('send', 'pageview', $location.path()+"/"+$rootScope.currentTrack.TRACK_NAME.replace(/ /g, "_")+"/"+$rootScope.currentTrack.STATUS.replace(/ /g, "_")+"/"+$rootScope.currentPoi.NAME.replace(/ /g, "_")+"/"+$rootScope.currentPoi.STATUS.replace(/ /g, "_"));
          console.log('send - pageview '+ $location.path()+"/"+$rootScope.currentTrack.TRACK_NAME.replace(/ /g, "_")+"/"+$rootScope.currentTrack.STATUS.replace(/ /g, "_")+"/"+$rootScope.currentPoi.NAME.replace(/ /g, "_")+"/"+$rootScope.currentPoi.STATUS.replace(/ /g, "_"));
        }else{
          $cordovaGoogleAnalytics.trackView($location.path());
          // window.ga('send', 'pageview', $location.path());
          console.log('send', 'pageview', $location.path());
        }
      }else if($rootScope.currentTrack){
        $cordovaGoogleAnalytics.trackView($location.path()+"/"+$rootScope.currentTrack.TRACK_NAME.replace(/ /g, "_")+"/"+$rootScope.currentTrack.STATUS.replace(/ /g, "_"));
        // window.ga('send', 'pageview', $location.path()+"/"+$rootScope.currentTrack.TRACK_NAME.replace(/ /g, "_")+"/"+$rootScope.currentTrack.STATUS.replace(/ /g, "_"));
        console.log('send - pageview '+ $location.path()+"/"+$rootScope.currentTrack.TRACK_NAME.replace(/ /g, "_")+"/"+$rootScope.currentTrack.STATUS.replace(/ /g, "_"));
      }else{
        $cordovaGoogleAnalytics.trackView($location.path());
        // window.ga('send', 'pageview', $location.path());
        console.log('send', 'pageview', $location.path());
      }
      console.log($rootScope);
      console.log($location);
    });
      
    var urlDefaultImage = $rootScope.serverUlr+"default/download/t_tracks.f_icon.965439e51ab1ab50.7061696e656c2d652d6174686f732d62756c63616f2d696772656a696e68612d6173612d73756c312d31303234783332362e6a7067.jpg";

    $rootScope.urlClassIndicArray = [];
    $rootScope.urlClassIndicArray[0] = $rootScope.localUrl+"img/Class_Indic_00_disp.png";
    $rootScope.urlClassIndicArray[1] = $rootScope.localUrl+"img/Class_Indic_10_disp.png";
    $rootScope.urlClassIndicArray[2] = $rootScope.localUrl+"img/Class_Indic_12_disp.png";
    $rootScope.urlClassIndicArray[3] = $rootScope.localUrl+"img/Class_Indic_14_disp.png";
    $rootScope.urlClassIndicArray[4] = $rootScope.localUrl+"img/Class_Indic_16_disp.png";
    $rootScope.urlClassIndicArray[5] = $rootScope.localUrl+"img/Class_Indic_18_disp.png";
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    if(window.screen.orientation)
      window.screen.orientation.lock('portrait');

    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);

    $rootScope.db = null;

    function onResume(){
      console.log("onResume - onResume - onResume - onResume - onResume");
      $rootScope.db = $cordovaSQLite.openDB({name: "trilhas_poeticas.db", location:1});
      if($rootScope.turnOnGpsOnResume)
        GpsUtilsService.watchGps();
    }
    onResume();
    function onPause(){
      console.log("onPause - onPause - onPause - onPause - onPause");
      //verify if gps is on, turn off - turn on onResume

      if($rootScope.watchId){
        GpsUtilsService.clearWatchId();
        $rootScope.turnOnGpsOnResume = true;
      }
    }

    //dev on local enviroment
    if(ionic.Platform.isAndroid()){
      $rootScope.localUrl = "/android_asset/www/";
      //debug local server url using Genymotion Android Emulator
      $rootScope.serverUlr = "http://10.0.3.2:8000/trilhaspoeticas/";
    }else if(ionic.Platform.isIOS()){
      $rootScope.localUrl = "";
      //debug local server url using xCode
      $rootScope.serverUlr = "http://localhost:8000/trilhaspoeticas/";
    }
    //URL of your Web2py application
    //if you want to set a global URL
    // $rootScope.serverUlr = "http://yourServer.com/trilhaspoeticas/";

  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.loading', {
    cache: false,
    url: '/loading',
    views: {
      'menuContent': {
        templateUrl: 'templates/loading.html',
        controller: 'LoadingCtrl'
      }
    }
  })
  .state('app.terms', {
    url: '/terms',
    views: {
      'menuContent': {
        templateUrl: 'templates/terms.html',
        controller: 'LoadingCtrl'
      }
    }
  })
  .state('app.tour', {
    url: '/tour',
    views: {
      'menuContent': {
        templateUrl: 'templates/tour.html',
        controller: 'AppCtrl'
      }
    }
  })
  .state('app.trilhas', {
    cache: false,
    url: '/trilhas',
    views: {
      'menuContent': {
        templateUrl: 'templates/trilhas.html',
        controller: 'TrilhasCtrl'
      }
    }
  })
  .state('app.trilha', {
    cache: false,
    url: '/trilhas/:trilhaId',
    views: {
      'menuContent': {
        templateUrl: 'templates/trilha.html',
        controller: 'TrilhaCtrl'
      }
    }
  })
  .state('app.ponto', {
    url: '/trilhas/:trilhaId/:pontoId',
    views: {
      'menuContent': {
        templateUrl: 'templates/ponto.html',
        controller: 'PoiCtrl'
      }
    }
  })
  .state('app.denuncia', {
    cache: false,
    url: '/trilhas/denuncia/:trilhaId/:pontoId',
    views: {
      'menuContent': {
        templateUrl: 'templates/denuncia.html',
        controller: 'DenunciaCtrl',
      }
    }
  })
  .state('app.autor', {
    url: '/autor/:autorId',
    views: {
      'menuContent': {
        templateUrl: 'templates/autor-trilhas.html',
        controller: 'AutorCtrl'
      }
    }
  })
  .state('app.etiqueta', {
    url: '/etiqueta/:etiqueta',
    views: {
      'menuContent': {
        templateUrl: 'templates/etiqueta.html',
        controller: 'EtiquetaCtrl'
      }
    }
  })
  .state('app.clIndicativa', {
    url: '/clIndicativa/:clIndicativa',
    views: {
      'menuContent': {
        templateUrl: 'templates/clIndicativa.html',
        controller: 'ClIndicativaCtrl'
      }
    }
  })
  .state('app.history', {
    cache: false,
    url: '/history',
    views: {
      'menuContent': {
        templateUrl: 'templates/history.html',
        controller: 'HistoryCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  console.log($urlRouterProvider);
  $urlRouterProvider.otherwise('/app/loading');
  $ionicConfigProvider.backButton.icon('my-back-button');
});
