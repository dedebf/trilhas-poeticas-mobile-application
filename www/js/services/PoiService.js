angular.module('starter')
.factory("PoiService", function ($rootScope, $http, SqlUtilsService, GpsUtilsService){

	function getPoiDistance(poiLat,poiLng){
		var R = 6371; // Radius of the earth in km
		var dLat = degToRad($rootScope.lat-poiLat);  // degToRad below
		var dLon = degToRad($rootScope.long-poiLng); 
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(degToRad(poiLat)) * Math.cos(degToRad($rootScope.lat)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2)
			; 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		return d;
	}
	function degToRad(deg){
		return deg * Math.PI / 180;
	}

	return{
		loadPois: function(trackID, callback){
			//@TODO
			//dont pass callback, get the answer and treat here, after execute callback
			SqlUtilsService.getPoisByTrackID(trackID, callback);
		},
		addCapturedPoi: function(poi, callback){
			//@TODO
			//dont pass callback, get the answer and treat here, after execute callback
			SqlUtilsService.updatePoiCaptured(poi, callback);
		},
		getCapturedPois: function(callback){
			SqlUtilsService.getCapturedPois(callback);
		},
		getDistanceFromCanCapturePoiByTracksID: function(tracksID, callback){
			SqlUtilsService.getCanCapturePoisByTracksID(tracksID, function(pois){
				if(pois){
					var trackDistance = [];
					for (var i = 0; i < pois.length; i++) {
						trackDistance[pois.item(i).TRACK] = getPoiDistance(pois.item(i).LATITUDE, pois.item(i).LONGITUDE);
					}
					callback(trackDistance);
				}else{
					callback(false);
				}
			});
		}
	}
});