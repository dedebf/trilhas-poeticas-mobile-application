angular.module('starter')
.controller('ClIndicativaCtrl', function($scope, $rootScope, $ionicLoading, $ionicHistory, $ionicNavBarDelegate, TrilhasService, $timeout, $stateParams) {
	$ionicNavBarDelegate.showBar(true);
	$ionicNavBarDelegate.showBackButton(true);
	$scope.clIndicativa = $stateParams.clIndicativa;


	function getTracksByParentalRatings(){
		$ionicLoading.show({
			template: 'Carregando as Trilhas...'
		});

		TrilhasService.getTracksFromDBbyParentalRatings(function(tracks){
			if(tracks){
				for (var i = 0; i < tracks.length; i++) {
					if(tracks[i].ICON != null && tracks[i].ICON != "null" && tracks[i].ICON != "undefined"){
						tracks[i].ICON = $rootScope.serverUlr+"default/download/"+tracks[i].ICON;
					}else{
						tracks[i].ICON = $rootScope.localUrl+"img/Trilhas_Top_Facebook01.jpg";
					}
				}
				$scope.trilhas = tracks;
			}else{
				$scope.trilhas = [];
			}
			$ionicLoading.hide();
		}, $scope.clIndicativa);
	}
	getTracksByParentalRatings();

	$scope.ciToggle = function(id){
		if(id && (id != $scope.clIndicativa)){
			$scope.clIndicativa = id;
			getTracksByParentalRatings();
		}
	};

	$scope.setAndGo = function(track){
		$rootScope.currentTrack = track;
	};
});