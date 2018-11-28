angular.module('starter')
.controller('EtiquetaCtrl', function($scope, $rootScope, $ionicLoading, $ionicHistory, $ionicNavBarDelegate, TrilhasService, $timeout, $stateParams) {
	$ionicNavBarDelegate.showBar(true);
	$ionicNavBarDelegate.showBackButton(true);
	$scope.etiqueta = $stateParams.etiqueta;

	$ionicLoading.show({
		template: 'Carregando as Trilhas...'
	});

	TrilhasService.getTracksFromDBbyTag(function(tracks){
		for (var i = 0; i < tracks.length; i++) {
			if(tracks[i].ICON != null && tracks[i].ICON != "null" && tracks[i].ICON != "undefined"){
				tracks[i].ICON = $rootScope.serverUlr+"default/download/"+tracks[i].ICON;
			}else{
				tracks[i].ICON = $rootScope.localUrl+"img/Trilhas_Top_Facebook01.jpg";
			}
		}
		$scope.trilhas = tracks;
		$ionicLoading.hide();
	}, $scope.etiqueta);

	$scope.setAndGo = function(track){
		$rootScope.currentTrack = track;
	};
});