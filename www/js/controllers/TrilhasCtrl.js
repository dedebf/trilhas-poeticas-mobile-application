angular.module('starter')
.controller('TrilhasCtrl', function($scope, $rootScope, $state, $ionicNavBarDelegate, $ionicHistory, $ionicLoading, TrilhasService, PoiService) {
	$rootScope.$on('$ionicView.afterEnter', function(){
		console.log('TrilhasCtrl - afterEnter - rootScope'); 
		//TODO
	});
	$scope.$on('$ionicView.beforeEnter', function(){
		console.log('TrilhasCtrl - beforeEnter - scope'); 
	});
	$scope.$on('$ionicParentView.afterEnter', function(){
		console.log('TrilhasCtrl - afterEnter - ionicParentView'); 
	});
	$ionicHistory.clearHistory();

	$ionicNavBarDelegate.showBar(true);
	$ionicNavBarDelegate.title("Trilhas");
	$ionicNavBarDelegate.align('center');

	$rootScope.selectedTrack = null;

	var tracksFromDB;
	function getTracks(){
		console.log("getTracks ionicLoading");
		$ionicLoading.show({
			template: '</br></br><img ng-src="" src="img/00_Trilhas_Oficial_Simbolo.png" class="my-loading" style="width:50%; text-align: center;"></br></br>Carregando as Trilhas...</br></br></br>'
		});
		TrilhasService.getTracksFromDB(function(tracks){
			console.log(tracks);
			var tracksID = '';
			for (var i = 0; i < tracks.length; i++) {
				if(tracks[i].ICON != null && tracks[i].ICON != "null" && tracks[i].ICON != "undefined"){
					tracks[i].ICON = $rootScope.serverUlr+"default/download/"+tracks[i].ICON;
				}else{
					tracks[i].ICON = $rootScope.localUrl+"img/Trilhas_Top_Facebook01.jpg";
				}
				tracksID = tracksID + tracks[i].ID +',';
			}
			tracksID = tracksID.slice(0,-1);
			tracksFromDB = tracks;
			PoiService.getDistanceFromCanCapturePoiByTracksID(tracksID, function(trackDistance){
				console.log(trackDistance);
				for (var i = 0; i < tracksFromDB.length; i++) {
					if(trackDistance[tracksFromDB[i].ID])
						tracksFromDB[i].DISTANCE = trackDistance[tracksFromDB[i].ID];
				}
				setTracks(tracksFromDB);
			});
			
		});
	}getTracks();

	$scope.getTracks = function(){
		$ionicLoading.show({
			template: '</br></br><img ng-src="" src="img/00_Trilhas_Oficial_Simbolo.png" class="my-loading" style="width:50%; text-align: center;"></br></br>Carregando as Trilhas...</br></br></br>'
		});

		TrilhasService.getFullSetAfterDate($rootScope.syncDateMillis,function(result){
	        if(result){
				getTracks();
	        }
			$scope.$broadcast('scroll.refreshComplete');
			setTimeout($ionicLoading.hide(), 5000);
		});
	};

	$rootScope.updateTracks = function(){
		getTracks();
	}

	function setTracks(tracks){
		$scope.trilhas = tracks;
		console.log($scope.trilhas);
		$ionicLoading.hide();
	}

	$scope.setAndGo = function(track){
		console.log(track);
		$rootScope.currentTrack = track;
	};

	var urlDefaultImage = $rootScope.localUrl+"img/Trilhas_Top_Facebook01.jpg";
	$rootScope.urlDefaultImage = urlDefaultImage;
	$rootScope.urlClassIndicArray = [];
	$rootScope.urlClassIndicArray[3] = $rootScope.localUrl+"img/Class_Indic_00_disp.png";
	$rootScope.urlClassIndicArray[4] = $rootScope.localUrl+"img/Class_Indic_10_disp.png";
	$rootScope.urlClassIndicArray[5] = $rootScope.localUrl+"img/Class_Indic_12_disp.png";
	$rootScope.urlClassIndicArray[6] = $rootScope.localUrl+"img/Class_Indic_14_disp.png";
	$rootScope.urlClassIndicArray[7] = $rootScope.localUrl+"img/Class_Indic_16_disp.png";
	$rootScope.urlClassIndicArray[8] = $rootScope.localUrl+"img/Class_Indic_18_disp.png";

	$rootScope.urlClassIndicIndispArray = [];
	$rootScope.urlClassIndicIndispArray[3] = $rootScope.localUrl+"img/Class_Indic_00_indisp.png";
	$rootScope.urlClassIndicIndispArray[4] = $rootScope.localUrl+"img/Class_Indic_10_indisp.png";
	$rootScope.urlClassIndicIndispArray[5] = $rootScope.localUrl+"img/Class_Indic_12_indisp.png";
	$rootScope.urlClassIndicIndispArray[6] = $rootScope.localUrl+"img/Class_Indic_14_indisp.png";
	$rootScope.urlClassIndicIndispArray[7] = $rootScope.localUrl+"img/Class_Indic_16_indisp.png";
	$rootScope.urlClassIndicIndispArray[8] = $rootScope.localUrl+"img/Class_Indic_18_indisp.png";

});