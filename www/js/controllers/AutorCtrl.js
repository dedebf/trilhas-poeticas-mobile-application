angular.module('starter')
.controller('AutorCtrl', function($scope, $rootScope, $ionicLoading, $ionicHistory, $ionicNavBarDelegate, TrilhasService, $timeout, $stateParams, AuthorService) {
	$scope.descClass = "sml-desc clear";
	$scope.descToggleArrow = "img/seta_down.png";
	$scope.descToggleEl = "desc-el-hide";
	$scope.expanded = "not-expanded";
	$scope.expandedAutorImg = "autor-img-container";

	$ionicNavBarDelegate.showBar(true);
	$ionicNavBarDelegate.showBackButton(true);
	authorID = $stateParams.autorId;

	$ionicLoading.show({
		template: 'Carregando as Trilhas...'
	});

    AuthorService.getAuthorByID(authorID, function(author){
    	if(author){
    		$scope.author = author;
    		$scope.author.ICON = $rootScope.serverUlr+"default/download/"+$scope.author.avatar;
			TrilhasService.getTracksFromDBbyAuthor(function(tracks){
				for (var i = 0; i < tracks.length; i++) {
					if(tracks[i].ICON != null && tracks[i].ICON != "null" && tracks[i].ICON != "undefined"){
						tracks[i].ICON = $rootScope.serverUlr+"default/download/"+tracks[i].ICON;
					}else{
						tracks[i].ICON = $rootScope.localUrl+"img/Avatar.png";
					}
				}
				$scope.trilhas = tracks;
				$ionicLoading.hide();
			}, $stateParams.autorId);
    	}
    });

	$scope.descriptionToggle = function($event){
		if($scope.descClass == "sml-desc clear"){//show
			$scope.descClass = "full-desc clear";
			$scope.descToggleArrow = "img/seta_up.png";
			$scope.descToggleEl = "desc-el-show";
			$scope.expanded = "expanded";
			$scope.expandedAutorImg = "autor-img-container-expanded";

		}else{//hide
			$scope.descClass = "sml-desc clear";
			$scope.descToggleArrow = "img/seta_down.png";
			$scope.descToggleEl = "desc-el-hide";
			$scope.expanded = "not-expanded";
			$scope.expandedAutorImg = "autor-img-container";
		}
	}

	$scope.setAndGo = function(track){
		$rootScope.currentTrack = track;
	};
});