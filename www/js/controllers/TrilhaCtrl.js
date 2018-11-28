angular.module('starter')
.controller('TrilhaCtrl', function($scope, $rootScope, $ionicLoading, TrilhasService, PoiService, $ionicPopup, $state, $stateParams) {
	console.log("TrilhaCtrl");
	console.log($rootScope.currentTrack);

	$scope.isIPad = ionic.Platform.isIPad();
	console.log($scope.isIPad);

	$scope.titlePage = $rootScope.TRACK_NAME;
	$scope.descClass = "sml-desc clear";
	$scope.descToggleArrow = "img/seta_down.png";
	$scope.descToggleEl = "desc-el-hide";
	$scope.currentPoi = null;
	$scope.pathPois = '[';
	$scope.pathPoisArray = [];

	urlCaptured = "img/ico1_ponto_capturado.png";
	urlCanCaptured = "img/ico2_ponto_disponivel.png";
	urlNotCaptured = "img/ico3_ponto_indisp.png";
	urlPinCaptured = "img/Target_Captured.png";
	urlPinCanCaptured = "img/Target_Next.png";
	urlPinNotCaptured = "img/Target_Unavailable.png";

	var trackID = $stateParams.trilhaId;
	TrilhasService.getTrackByID(trackID, function(track){
		$rootScope.currentTrack = track;
		if(track){
			$scope.titlePage = track.TRACK_NAME;
			$scope.trilha = track;
			$scope.pontos = [];
			$scope.trackIcon = $rootScope.serverUlr+"default/download/"+track.ICON;
			if(track.TAGS){
				var tagArray = track.TAGS.split(';');
				tagArray.pop();
				$scope.tags = tagArray;
			}
			var trackID = $scope.trilha.ID;

			PoiService.loadPois(trackID, function(pontos){
				var auxArray = [];
				orderAux = -1;
				if(pontos.length >= 0){
					for (var i = 0; i < pontos.length; i++) {
						auxArray.push(pontos.item(i));
						console.log(pontos.item(i));
						if(pontos.item(i).PLACING > orderAux){
							$rootScope.lastPoiID = pontos.item(i).ID;
						}
						$scope.pathPoisArray.push([parseFloat(pontos.item(i).LATITUDE),parseFloat(pontos.item(i).LONGITUDE)]);
						$scope.pathPois = $scope.pathPois + '[' + pontos.item(i).LATITUDE + ',';
						$scope.pathPois = $scope.pathPois + pontos.item(i).LONGITUDE + ']';
					}
					$scope.pathPois = $scope.pathPois + ']';
					console.log($scope.pathPoisArray);
					if($rootScope.currentTrack.STATUS == "FINISHED"){
						$scope.pontos = addControlFakePoi(setPoiImages(auxArray));
					}else{
						$scope.pontos = setPoiImages(auxArray);
					}

					//last row
					$scope.pontosLen = $scope.pontos.length;
					$scope.indexLastRow = $scope.pontosLen - ($scope.pontosLen % 3);
					initMaps();
				}
				$ionicLoading.hide();
			})
		}
	})

	function setPoiImages(pontos){
		for(i=0; i < pontos.length; i++){
			if(pontos[i].STATUS == 'CAPTURED'){
				pontos[i].imgUrl = urlCaptured;
				pontos[i].pinCaptured = urlPinCaptured;
			}else if (pontos[i].STATUS == 'CAN CAPTURE') {
				pontos[i].imgUrl = urlCanCaptured;
				pontos[i].pinCaptured = urlPinCanCaptured;
			}else{
				pontos[i].imgUrl = urlNotCaptured;
				pontos[i].pinCaptured = urlPinNotCaptured;
			}
		}
		return pontos;
	}
	function addControlFakePoi(pontos){
		var likeFakePoi = new Object();
		likeFakePoi.PLACING = "-2";
		likeFakePoi.imgUrl = "img/Like_Disable.png";
		if($rootScope.currentTrack.MY_SCORE > 0)
			likeFakePoi.imgUrl = "img/Like_Enable.png";
		likeFakePoi.STATUS = "LIKE";
		pontos.unshift(likeFakePoi);
		var newPlacing = 0;
		for (var i = pontos.length - 1; i >= 0; i--) {
			newPlacing = parseInt(pontos[i].PLACING);
			newPlacing++;
			pontos[i].PLACING = newPlacing;
		}
		return pontos;
	}

	$scope.descriptionToggle = function($event){
		if($scope.descClass == "sml-desc clear"){//show
			$scope.descClass = "full-desc clear";
			$scope.descToggleArrow = "img/seta_up.png";
			$scope.descToggleEl = "desc-el-show";
			$scope.expanded = "expanded";

		}else{//hide
			$scope.descClass = "sml-desc clear";
			$scope.descToggleArrow = "img/seta_down.png";
			$scope.descToggleEl = "desc-el-hide";
			$scope.expanded = "not-expanded";
		}
	}

	$scope.poiClick = function(pontoClicked){
		console.log(pontoClicked);
		if ((pontoClicked.STATUS == 'CAPTURED') || (pontoClicked.STATUS == 'CAN CAPTURE')) {
			$rootScope.currentPoi = pontoClicked;
			$state.go('app.ponto',{trilhaId: pontoClicked.TRACK, pontoId: pontoClicked.ID});
		}else if(pontoClicked.STATUS == 'LIKE'){
			if($rootScope.userEmail){
				function resUpdateMyScore(res){
					if(res){
						$scope.pontos[0].imgUrl = "img/Like_Enable.png";
						$rootScope.clearTrackCache = true;
					}
				}
				if($rootScope.currentTrack.MY_SCORE > 0){
					TrilhasService.updateMyScore($rootScope.currentTrack.ID, 0, $rootScope.userEmail, resUpdateMyScore);
				}else{
					TrilhasService.updateMyScore($rootScope.currentTrack.ID, 1, $rootScope.userEmail, resUpdateMyScore);
				}
			}else{
				$scope.login();
				return $scope.poiClick(pontoClicked);
			}
		}else{
			$ionicPopup.alert({
				title: 'Ponto não acessível',
				template: '<img ng-src="" src="img/ico3_ponto_indisp.png" class="my-loading" style="width:50%; text-align: center;"><p class="load-text-popup">O ponto anterior precisa ser capturado antes</p>',
			});
		}
	}

	var map;
	function initMaps() {
		if(!$scope.pathPoisArray){
			console.log("no points");
		}else{
			map = new google.maps.Map(document.getElementById('map'), {
				center: {lat: $scope.pathPoisArray[0][0], lng: $scope.pathPoisArray[0][1]},
				zoom: 8,
				draggable: true,
				fullscreenControl: false,
				mapTypeControl: false,
				zoomControl: true,
				mapTypeControl: false,
				scaleControl: false,
				streetViewControl: false,
				rotateControl: false,
				mapTypeControlOptions: {
			        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'tehgrayz']
			    }
			});

			var stylez = [
			    {
			      featureType: "all",
			      elementType: "all",
			      stylers: [
			        { saturation: -100 } // <-- THIS
			      ]
			    }
			];
			var mapType = new google.maps.StyledMapType(stylez, { name:"Grayscale" }); 

		    var trackCoords = [];
		    var auxLatLng;

		    var marker;
			var latLng;
			var bounds = new google.maps.LatLngBounds();
			
			for (var i = $scope.pathPoisArray.length - 1; i >= 0; i--) {
				auxLatLng = new google.maps.LatLng($scope.pathPoisArray[i][0],$scope.pathPoisArray[i][1]); 
				trackCoords.push(auxLatLng);

				if($rootScope.currentTrack.STATUS == "FINISHED"){
					urlMarker = $scope.pontos[i+1].pinCaptured;
					if($scope.pontos[i+1].STATUS == "CAN CAPTURE"){
						$scope.pontos[i+1].pinZIndex = 9;
					}else if($scope.pontos[i+1].STATUS == "CAPTURED"){
						$scope.pontos[i+1].pinZIndex = 2;
					}else if($scope.pontos[i+1].STATUS == "NOT CAPTURED"){
						$scope.pontos[i+1].pinZIndex = 1;
					}
				}else{
					urlMarker = $scope.pontos[i].pinCaptured;
					if($scope.pontos[i].STATUS == "CAN CAPTURE"){
						$scope.pontos[i].pinZIndex = 9;
					}else if($scope.pontos[i].STATUS == "CAPTURED"){
						$scope.pontos[i].pinZIndex = 2;
					}else if($scope.pontos[i].STATUS == "NOT CAPTURED"){
						$scope.pontos[i].pinZIndex = 1;
					}
				}

				marker = new google.maps.Marker({
					position: auxLatLng,
					map: map,
					icon: {
						url: urlMarker,
						scaledSize: new google.maps.Size(20, 24),
						size: new google.maps.Size(20, 24),
						origin: new google.maps.Point(0, 0),
						anchor: new google.maps.Point(0, 24)
					},
					zIndex: $scope.pontos[i].pinZIndex
				});
				bounds.extend(marker.position);
			}
			var trackPath = new google.maps.Polyline({
				path: trackCoords,
				strokeColor: '#131540',
				strokeOpacity: 0.6,
				strokeWeight: 6
			});

			trackPath.setMap(map);
			map.fitBounds(bounds);
			map.mapTypes.set('tehgrayz', mapType);
			map.setMapTypeId('tehgrayz');
		}
	}

});