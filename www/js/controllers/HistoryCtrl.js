angular.module('starter')
.controller('HistoryCtrl', function($ionicPlatform, $scope, $rootScope, $ionicLoading, $ionicHistory, TrilhasService, PoiService, $ionicPopup, $state) {
	console.log("HistoryCtrl");
	var pois = [];
	var trackPath = '';

	$ionicPlatform.registerBackButtonAction(function() {
		console.log($state.current.name);
      if ($state.current.name === "app.trilhas") {
        ionic.Platform.exitApp();
      }
      else if($state.current.name === "app.history"){
        $state.go('app.trilhas');
      }else{
      	$ionicHistory.goBack();
      }
    }, 100);

	PoiService.getCapturedPois(function(poisRows){
		console.log(poisRows);
		poisAux = poisRows;
		for (var i = 0; i < poisRows.length; i++) {
			console.log(poisRows.item(i));
			poisRows.item(i).CAPTURED_ON = new Date(poisRows.item(i).CAPTURED_ON);
			pois.push(poisRows.item(i));
			trackPath = trackPath + poisRows.item(i).TRACK + ',';
		}
		//remove last colon
		trackPath = trackPath.slice(0,-1);
		console.log(pois);
		console.log(trackPath);

		TrilhasService.getTracksByIDs(trackPath, function(tracks){
			for (var i = 0; i < tracks.length; i++) {
				tracks.item(i).ICON = $rootScope.serverUlr+"default/download/"+tracks.item(i).ICON;
				tracks[tracks.item(i).ID] = tracks.item(i);
			}
			console.log(tracks);
			for (var i = 0; i < pois.length; i++) {
				pois[i].TRACK_NAME = tracks[pois[i].TRACK].TRACK_NAME;
			}
			$scope.tracks = tracks;
			$scope.pois = pois;
		});

	});

	$scope.poiClick = function(pontoClicked){
		if ((pontoClicked.STATUS == 'CAPTURED') || (pontoClicked.STATUS == 'CAN CAPTURE')) {
			$rootScope.currentTrack = $scope.tracks[pontoClicked.TRACK];
			$rootScope.currentPoi = pontoClicked;
			$state.go('app.ponto',{trilhaId: pontoClicked.TRACK, pontoId: pontoClicked.ID});
		}
	}
});	