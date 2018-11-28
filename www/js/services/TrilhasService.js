angular.module('starter') //carrega os serviços que essa service utiliza
.factory("TrilhasService", function ($rootScope, $http, SqlUtilsService, InternetUtilsService){
	var lastModifiedRecord;
	var auxDate;
	function addFullSetToDB(fullSet, callback){

		var tracks = fullSet.tracks;
		var pois = fullSet.pois;
		var lastDatetime = fullSet.datetime;
		var authors = fullSet.users;

		angular.forEach(tracks, function(track, key) {
			// console.log(track);
		    if(track.IS_ACTIVE){
		    	// console.log("track.IS_ACTIVE");
		    	SqlUtilsService.saveTrack(track, 'NEW',function(res, trackID){
		    		// console.log(res);
				});
		    }else{
		    	console.log("track.IS_NOT_ACTIVE");
		    	SqlUtilsService.deleteTrack(track);
		    }
		});
		angular.forEach(pois, function(poi, key) {
		    if(poi.IS_ACTIVE){
				SqlUtilsService.savePoi(poi);
		    }else{
		    	SqlUtilsService.deletePoi(poi)
		    }
		});
		angular.forEach(authors, function(author, key){
			SqlUtilsService.saveAuthorAndUpdateTrackAuthor(author);
		});
		if(lastDatetime)
			SqlUtilsService.setSyncDate(lastDatetime);
		callback(true);
	}

	function addScoreInTrack(trackID){
		if(trackID){
			$http.get($rootScope.serverUlr+"default/get_score_by_track/"+trackID).then(function(score,status){
				SqlUtilsService.updateTrackScore(trackID, score.data);
			}, function(error) {
				console.log(error);
			});
		}
	}

	return {
		getFullSetAfterDate: function(date, callback){
			if(date){
				if (isNaN(parseInt(date))) {
					date = 0;
				}
			}
			console.log($rootScope.syncDateMillis);
			if(!$rootScope.syncDateMillis && isNaN($rootScope.syncDateMillis) )
				$rootScope.syncDateMillis = "";
			console.log($rootScope.serverUlr+"default/get_full_set_after_date/"+$rootScope.syncDateMillis);
			$http.get($rootScope.serverUlr+"default/get_full_set_after_date/"+$rootScope.syncDateMillis).then(function(fullSet,status){
				var fullSet = fullSet.data;
				console.log(fullSet);
				addFullSetToDB(fullSet,callback);
			}, function(error){
				callback(false);
				console.log(error);
			});
		},
		getAllTracksAndPois: function(callback){
			$http.get($rootScope.serverUlr+"default/get_tracks").then(function(trilhas,status){
				var trilhas = trilhas.data;
				addTracksToDB(trilhas,callback);
			}, function(error){
				console.log(error);
			});
			$http.get($rootScope.serverUlr+"default/get_full_set").then(function(fullSet,status){
				var fullSet = fullSet.data;
			}, function(error){
				console.log(error);
			});			

		},
		getAllTracksAndPoisAfterDate: function(date,callback){
			if($rootScope.syncDateMillis != NaN){
				SqlUtilsService.getConfig(null);
			}
			$http.get($rootScope.serverUlr+"default/get_new_tracks_after_date/"+$rootScope.syncDateMillis).then(function(trilhas,status){
				var trilhas = trilhas.data;
				addTracksToDB(trilhas,callback);
			}, function(error){
				console.log(error);
			});
			$http.get($rootScope.serverUlr+"default/get_full_set_after_date/"+$rootScope.syncDateMillis).then(function(fullSet,status){
				var fullSet = fullSet.data;
			}, function(error){
				console.log(error);
			});			
		},
		getAuthorInfo: function(authorID, callback){
			$http.get($rootScope.serverUlr+"default/get_author_info_by_id/"+authorID).then(function(author,status){
				var author = author.data;
				callback(author);
			}, function(error){
				console.log(error);
			});
		},
		getTrackByID: function(trackID, callback){
			SqlUtilsService.getTrackByID(trackID, callback);
		},
		getTracksByIDs: function(trackIDs, callback){
			SqlUtilsService.getTracksByIDs(trackIDs, callback);
		},
		getTracksFromDB: function(callback){
			SqlUtilsService.getTracks(callback);
		},
		getTracksFromDBbyAuthor: function(callback, autorId){
			SqlUtilsService.getTracksByAuthor(callback, autorId);
		},
		getTracksFromDBbyTag: function(callback, tag){
			SqlUtilsService.getTracksByTag(callback, tag);
		},
		getTracksFromDBbyParentalRatings: function(callback, clIndic){
			SqlUtilsService.getTracksByParentalRatings(callback, clIndic);
		},
		updateStatus: function(track, status, callback){
			SqlUtilsService.updateTrackStatus(track, status, callback);
		},
		updateMyScore: function(trackID, score, userEmail, callback){
			$http.get($rootScope.serverUlr+"default/set_like_track/"+trackID+"/"+score+"/"+userEmail).then(function(res,status){
				addScoreInTrack(trackID);
				SqlUtilsService.updateTrackMyScore(trackID, score);
				callback(true);
			}, function(error){
				callback(false);
				console.log(error);
			});
		},
		updateUserEmail: function(){
			SqlUtilsService.updateUserEmail();
		},
		sendReport: function(trackID,poiID,reportMsg,callback){
 			$http.post($rootScope.serverUlr+"default/set_report", JSON.stringify({trackID: trackID, poiID: poiID, reportMsg: reportMsg, userEmail: $rootScope.userEmail})).then(function(res,status){
					callback(true);
				}, function(error){
					console.log(error);
					callback(false);
				});
		}
	}
});