angular.module('starter') //carrega os serviços que essa service utiliza
.factory("GpsUtilsService", function($ionicPopup, $rootScope, $cordovaGeolocation){
	$rootScope.maxDistanceBetwenPoi = 0; //km
	$rootScope.acceptableAccuracy = 25/1000; //km

	$rootScope.currLat = null;
	$rootScope.currLong = null;
	$rootScope.accuracy = $rootScope.acceptableAccuracy;
	
	var posOptions = {maximumAge: 0, timeout: 10000, enableHighAccuracy:true};

	function degToRad(deg){
		return deg * Math.PI / 180;
	}

	return{
		hasGps: function(callback){
			$cordovaGeolocation
				.getCurrentPosition(posOptions)
				.then(function(position){
					$rootScope.lat = position.coords.latitude;
					$rootScope.long = position.coords.longitude;
					if((position.coords.accuracy/1000) <= $rootScope.acceptableAccuracy){
						$rootScope.accuracy = position.coords.accuracy/1000;
					}else{
						$rootScope.accuracy = $rootScope.acceptableAccuracy;
					}
					callback(true);
				}, function(err){
					console.log(err);
					$ionicPopup.alert({
						title: 'Sem conexão de GPS!',
						template: '<img ng-src="" src="img/ico3_ponto_indisp.png" class="my-loading" style="width:50%; text-align: center;"><p class="load-text-popup">Ligue o GPS e tente novamente</p>',
					})
					.then(function(){
						ionic.Platform.exitApp();
					});
				});
		},
		verifyGps: function(callBack){
			$cordovaGeolocation.getCurrentPosition(posOptions)
      			.then(function (position){
      				$rootScope.lat = position.coords.latitude;
        			$rootScope.long = position.coords.longitude;
        			if((position.coords.accuracy/1000) <= $rootScope.acceptableAccuracy){
						$rootScope.accuracy = position.coords.accuracy/1000;
					}else{
						$rootScope.accuracy = $rootScope.acceptableAccuracy;
					}
        			callBack(true);
      			}, function(err){
      				$rootScope.lat = 'err';
      				$ionicPopup.alert({
						title: 'Sem conexão de GPS!',
						template: '<img ng-src="" src="img/ico3_ponto_indisp.png" class="my-loading" style="width:50%; text-align: center;"><p class="load-text-popup">Ligue o GPS e tente novamente</p>',
					})
					.then(function(){
						ionic.Platform.exitApp();
					});
      			});
		},
		watchGps: function(callBack){
			$rootScope.watchId = $cordovaGeolocation.watchPosition(posOptions)
			.then(function(position){
				$rootScope.lat = position.coords.latitude;
    			$rootScope.long = position.coords.longitude;
    			if((position.coords.accuracy/1000) <= $rootScope.acceptableAccuracy){
					$rootScope.accuracy = position.coords.accuracy/1000;
				}else{
					$rootScope.accuracy = $rootScope.acceptableAccuracy;
				}

				if($rootScope.turnOnGpsOnResume){
					$rootScope.turnOnGpsOnResume = false;
				}else{
    				callBack(true, $rootScope.lat, $rootScope.long, $rootScope.accuracy);
				}
			}, function(err){
				callBack(false);
			});

		},
		clearWatchId: function(){
			if($rootScope.watchId != null){
				$cordovaGeolocation.clearWatch($rootScope.watchId);
				$rootScope.watchId = null;
			}
		},
		verifyPoiIsNear: function(lat1,long1,lat2,long2, callBack){
			var R = 6371; // Radius of the earth in km
			var dLat = degToRad(lat2-lat1);  // degToRad below
			var dLon = degToRad(long2-long1); 
			var a = 
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * 
				Math.sin(dLon/2) * Math.sin(dLon/2)
				; 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = R * c; // Distance in km
			callBack(d);
		}
	}
});