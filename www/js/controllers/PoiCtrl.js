angular.module('starter')
.controller('PoiCtrl', function($ionicPlatform, $scope, $rootScope, $sce, $ionicLoading, $timeout, $cordovaLaunchNavigator, $ionicScrollDelegate, GpsUtilsService, TrilhasService, PoiService, $cordovaGoogleAnalytics){
	$ionicLoading.show();
	var poi = null;

	$scope.descClass = "sml-desc clear";
	$scope.descToggleArrow = "img/seta_down.png";
	$scope.descToggleEl = "desc-el-hide";

	if($rootScope.currentPoi){
		poi = $rootScope.currentPoi;
		$scope.poi = poi;
		$scope.titlePage = poi.NAME;
		$scope.capturedOn = new Date(poi.CAPTURED_ON).toLocaleDateString();

		$scope.myPos = [];
		$scope.myPos.lat = $rootScope.lat;
		$scope.myPos.long = $rootScope.long;
		var myPosAux = [];
		myPosAux.lat = $scope.myPos.lat;
		myPosAux.long = $scope.myPos.long;

		var content = poi.CONTENT;
		$scope.content = $sce.trustAsHtml(content).toString();
		$scope.showContent = false;
		$scope.showCompass = false;
		$scope.content = hrefToJs($scope.content);

		if(poi.STATUS == 'CAPTURED'){
			$scope.showContent = true;
			$scope.showCompass = false;
			if(screen.orientation)
      			screen.orientation.unlock();
			$ionicLoading.hide();
		}else{
			$scope.showContent = false;
			$scope.showCompass = true;
			isNear();
			$ionicLoading.hide();
		}
	}else{
		//@TODO go back to track
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

	function watchGps(){
		if ($rootScope.watchId == null){
			$ionicLoading.show();
			GpsUtilsService.watchGps(function(){

			});
			$timeout(watchGps(), 1000);
		}else{
			$ionicLoading.hide();
			$rootScope.watchId.then(null, function(err){console.log},
				function(position){
					if((myPosAux.lat != position.coords.latitude) || (myPosAux.long != position.coords.longitude)){
						myPosAux.lat = position.coords.latitude;
						myPosAux.long = position.coords.longitude;
						if((position.coords.accuracy/1000) <= $rootScope.acceptableAccuracy){
							$rootScope.accuracy = position.coords.accuracy/1000;
						}else{
							$rootScope.accuracy = $rootScope.acceptableAccuracy;
						}
						updateMaps();
						isNear();
					}
				});
		}
	}

	function removeSoundCloudMaxWidthWidget(content){
		console.log(content);
		if(typeof content == "string"){
			var sdString = "max-width:320px";
			var newString = content.replace(sdString, "");
		}else{
			newString = "content error";
		}
		console.log(content);
		return $sce.trustAsHtml(newString);
	}

	function hrefToJs(content){
		if(typeof content == "string"){
			var regex = /href="([\S]+)"/g;
			var newString = content.replace(regex, "onClick=\"window.open('$1', '_system', 'location=yes')\"");
		}else{
			newString = "content error";
		}
		return removeSoundCloudMaxWidthWidget(newString);
	}

	function isNear(){
		GpsUtilsService.verifyPoiIsNear(myPosAux.lat, myPosAux.long,
			poi.LATITUDE, poi.LONGITUDE, 
			function(distance){
				$scope.distanceToPoi = distance.toFixed(3).toString().replace('.', ',');

				if(distance <= ($rootScope.maxDistanceBetwenPoi + $rootScope.accuracy)) {
					GpsUtilsService.clearWatchId();
					addCapturedPoi();
					
					$scope.explode = 'explode';
					$ionicScrollDelegate.scrollTop();
					$timeout(function() {
						$scope.showContent = true;
						$scope.showCompass = false;
						$scope.explode = '';
					}, 2000);
				}else{
					watchGps();
					$scope.myPos = myPosAux;
					updateMaps();
					if(!$scope.$$phase) {
					  //$digest or $apply
					  $scope.$apply();
					}
				}
			}
		);
	}

	function addCapturedPoi(){
		PoiService.addCapturedPoi(poi, function(res){
			console.log(res);
			console.log(poi.PLACING);
			$cordovaGoogleAnalytics.startTrackerWithId('UA-106583250-1');
			$cordovaGoogleAnalytics.trackView($location.path()+"/"+$rootScope.currentTrack.TRACK_NAME.replace(/ /g, "_")+"/"+$rootScope.currentTrack.STATUS.replace(/ /g, "_")+"/"+$rootScope.currentPoi.NAME.replace(/ /g, "_")+"/"+$rootScope.currentPoi.STATUS.replace(/ /g, "_"));
			if (res == true) {
				if(poi.PLACING != 0 && poi.ID != $rootScope.lastPoiID)
					$cordovaGoogleAnalytics.trackEvent('POIs', 'POI captured', 'Ponto capturado, o jogo continua', poi.PLACING);
				if(poi.PLACING == 0){
					TrilhasService.updateStatus($rootScope.currentTrack, "STARTED", null);
					$cordovaGoogleAnalytics.trackEvent('POIs', 'POI captured', 'Primeiro ponto capturado, Trilha iniciada', poi.PLACING);
				}
				if(poi.ID == $rootScope.lastPoiID){
					TrilhasService.updateStatus($rootScope.currentTrack, "FINISHED", null);
					$cordovaGoogleAnalytics.trackEvent('POIs', 'POI captured', 'Último ponto capturado, Trilha finalizada', poi.PLACING);
				}
			}
		})
	}

	//launchNavigator
	$scope.launchNavigator = function(){
		var destination = [poi.LATITUDE,poi.LONGITUDE];
		$cordovaLaunchNavigator.navigate(destination)
		.then(function(){
			console.log("Navigator launched");
			$cordovaGoogleAnalytics.trackEvent('POIs', 'POI going', 'App externo lançado, para a navegação GPS', poi.PLACING);
		}, function(err){
			console.log(err);
			$cordovaGoogleAnalytics.trackEvent('POIs', 'POI going', 'App externo NÃO lançado!', poi.PLACING);
		});
	};

	var map;
	var mapType;
	var mapLoaded = false;

	var polyLine;
	
	var myMarker;
	var poiMarker;
	$scope.initMaps = function() {
		myPosLat = parseFloat(myPosAux.lat);
		myPosLong = parseFloat(myPosAux.long);
		poiPosLat = parseFloat(poi.LATITUDE);
		poiPosLng = parseFloat(poi.LONGITUDE);

		map = new google.maps.Map(document.getElementById('map-poi'), {
  			center: {lat: myPosLat, lng: myPosLong},
			zoom: 8,
			draggable: false,
			fullscreenControl: false,
			mapTypeControl: false,
			zoomControl: false,
			mapTypeControl: false,
			scaleControl: false,
			streetViewControl: false,
			rotateControl: false,
			mapTypeControlOptions: {
		        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'tehgrayz']
		    }
		});
		
		myMarker = new google.maps.Marker({
			position: {lat: myPosLat, lng: myPosLong},
			map: map,
			icon: {
				url: "img/00_Trilhas_Oficial_Simbolo.png",
				scaledSize: new google.maps.Size(20, 20),
				size: new google.maps.Size(20, 20),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(10, 10)
			},
			opacity: 0.9,
		});

		poiMarker = new google.maps.Marker({
			position: {lat: poiPosLat, lng: poiPosLng},
			map: map,
			animation: google.maps.Animation.DROP,
			icon: {
				url: "img/Target_Next.png",
				scaledSize: new google.maps.Size(20, 24),
				size: new google.maps.Size(20, 24),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(0, 24)
			},
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
		mapType = new google.maps.StyledMapType(stylez, { name:"Grayscale" }); 

		polyLine = new google.maps.Polyline({
		    strokeColor: '#131540',
		    strokeOpacity: 0.6,
		    strokeWeight: 4
		});
		polyLine.setMap(map);

		var path = [myMarker.position, poiMarker.position];
		polyLine.setPath(path);

		var bounds = new google.maps.LatLngBounds();
		bounds.extend(myMarker.position);
		bounds.extend(poiMarker.position);
		map.fitBounds(bounds);

		map.mapTypes.set('tehgrayz', mapType);
		map.setMapTypeId('tehgrayz');

		mapLoaded = true;
		
	};

	function updateMaps(){
		myPosLat = parseFloat(myPosAux.lat);
		myPosLong = parseFloat(myPosAux.long);
		if(mapLoaded){
			map.setCenter({lat: myPosLat, lng: myPosLong});
			myMarker.setPosition({lat: myPosLat, lng: myPosLong});

			polyLine.setPath([myMarker.position, poiMarker.position]);

			var bounds = new google.maps.LatLngBounds();
			bounds.extend(myMarker.position);
			bounds.extend(poiMarker.position);
			map.fitBounds(bounds);

		}
	}

	var map;
	var mapType;
	$scope.initMapsCaptured = function(){
		poiPosLat = parseFloat(poi.LATITUDE);
		poiPosLng = parseFloat(poi.LONGITUDE);

		map = new google.maps.Map(document.getElementById('map-poi-captured'), {
  			center: {lat: poiPosLat, lng: poiPosLng},
			zoom: 17,
			draggable: false,
			fullscreenControl: false,
			mapTypeControl: false,
			zoomControl: false,
			mapTypeControl: false,
			scaleControl: false,
			streetViewControl: false,
			rotateControl: false,
			mapTypeControlOptions: {
		        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'tehgrayz']
		    }
		});

		poiMarker = new google.maps.Marker({
			position: {lat: poiPosLat, lng: poiPosLng},
			map: map,
			icon: {
				url: "img/Target_Next.png",
				scaledSize: new google.maps.Size(20, 24),
				size: new google.maps.Size(20, 24),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(0, 24)
			},
			animation: google.maps.Animation.DROP
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
		mapType = new google.maps.StyledMapType(stylez, { name:"Grayscale" }); 

		map.mapTypes.set('tehgrayz', mapType);
		map.setMapTypeId('tehgrayz');
	}

	$scope.capturarPontoDebug = function(){
		GpsUtilsService.clearWatchId();
		addCapturedPoi();
		$scope.explode = 'explode';
		$ionicScrollDelegate.scrollTop();
		$timeout(function() {
			$scope.showContent = true;
			$scope.showCompass = false;
			$scope.explode = '';
		}, 2000);
		$timeout(function() {
			$scope.$apply();
		});
	};


});