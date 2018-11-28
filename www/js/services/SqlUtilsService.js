angular.module('starter')
.factory("SqlUtilsService", function ($rootScope, $cordovaSQLite, $ionicPopup, $timeout){
	var db = null;

	function treatStringToSqlValue(string){
		return string.replace(/'/g, "''");
	}

	function checkDB(){
		if(!db){
			db = $rootScope.db;
		}
	}

	function toJSDate(strDate){
		// 20/12/2016 17:00:52
		// 20/12/2016, 17:00:52
		// 20/12/2016, 05:00:52 PM
		if(strDate.indexOf(", ") != -1){
			var datetime = strDate.split(", ");
		}else{
			var datetime = strDate.split(" ");
		}
		var date = datetime[0].split("-");
		var time = datetime[1].split(":");

		if(time[2].indexOf("PM")){
			time[2] = time[2].split(" ")[0];
			time[0] = parseInt(time[0]) + 12;
			time[2] = String(time[2]);
		}else if(time[2].indexOf("AM")){
			time[2] = time[2].split(" ")[0];
			time[2] = String(time[2]);
		}

		return new Date(date[2], date[1], date[0], time[0], time[1], time[2], 0);
	}

	return {
		setupTables: function(callback){
			checkDB();

			var sqlCreateTableConfig = "CREATE TABLE IF NOT EXISTS `CONFIG`(`CodConfig` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `SYNC_DATE` VARCHAR(100) NOT NULL, `TUTORIAL` VARCHAR(5) NOT NULL, `USER_EMAIL` VARCHAR(300), `ACCEPTED_TERMS` VARCHAR(5))";
			var sqlCreateTableTracks = "CREATE TABLE IF NOT EXISTS `TRACKS`(`CodCapturedTrack` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,`ID` INTEGER UNIQUE NOT NULL, `TRACK_NAME` VARCHAR(100) NOT NULL, `DESCRIPTION` VARCHAR(2500) NOT NULL, `ICON` VARCHAR(1000),`A_F_NAME` VARCHAR(100) NOT NULL, `A_L_NAME` VARCHAR(100) NOT NULL, `A_ID` VARCHAR(100) NOT NULL, `PARENTAL_RATING` VARCHAR(100) NOT NULL, `MY_SCORE` INTEGER DEFAULT 0, `SCORE` INTEGER DEFAULT 0, `TAGS` VARCHAR(500), `CAPTURED_ON` VARCHAR(100), `STATUS` VARCHAR(100) NOT NULL, `MODIFIED_ON` VARCHAR(100) NOT NULL)";
			var sqlCreateTablePois =   "CREATE TABLE IF NOT EXISTS `POIS`(`CodPoi` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `ID` INTEGER UNIQUE NOT NULL, `TRACK` VARCHAR(100) NOT NULL, `PLACING` VARCHAR(100) NOT NULL, `LATITUDE` VARCHAR(100) NOT NULL, `LONGITUDE` VARCHAR(100) NOT NULL, `NAME` VARCHAR(100) NOT NULL, `CONTENT` VARCHAR(65536) NOT NULL, `CAPTURED_ON` VARCHAR(100) , `STATUS` VARCHAR(100) NOT NULL, `MODIFIED_ON` VARCHAR(100) NOT NULL )";
			var sqlCreateTableAuthor=  "CREATE TABLE IF NOT EXISTS `AUTHOR`(`CodAuthor` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `ID` INTEGER UNIQUE NOT NULL, `FIRST_NAME` VARCHAR(100), `LAST_NAME` VARCHAR(100), `DESCRIPTION` VARCHAR(1000), `ICON`VARCHAR(1000))";

			$cordovaSQLite.execute(db, sqlCreateTableConfig);
		    $cordovaSQLite.execute(db, sqlCreateTableTracks);
		    $cordovaSQLite.execute(db, sqlCreateTablePois);
		    $cordovaSQLite.execute(db, sqlCreateTableAuthor);

		    callback(true);
		},
		getConfig: function(callback){
			var sql = "SELECT * FROM CONFIG";
			if(!db){
				this.setupTables();
			}
			$cordovaSQLite.execute(db, sql, [])
				.then(function(res){
					console.log("select from config:");
					console.log("rows size: "+res.rows.length);
					if(res.rows.length > 0){
						console.log(res.rows.item(0));
						$rootScope.hasSyncDate = true;
						var syncDate = res.rows.item(0).SYNC_DATE;

						$rootScope.syncDateMillis = +syncDate;

						if(res.rows.item(0).USER_EMAIL)
							$rootScope.userEmail = res.rows.item(0).USER_EMAIL;
						if(callback)
							callback(res.rows.item(0));
					}else{
						var sqlSyncDate = "INSERT OR REPLACE INTO CONFIG (SYNC_DATE, TUTORIAL) VALUES ('0','SHOW')";	
						$cordovaSQLite.execute(db,sqlSyncDate,[])
							.then(function(res){
								console.log("no config row; INSERT now");
								console.log(res);
								if(res.insertId)
									$cordovaSQLite.execute(db, sql, [])
										.then(function(res){
											if(res.rows.length > 0){
												console.log(res.rows.item(0));
												$rootScope.hasSyncDate = true;
												var syncDate = res.rows.item(0).SYNC_DATE;

												$rootScope.syncDateMillis = +syncDate;

												if(callback)
													callback(res.rows.item(0));
											}
										});
							});
					}
				});
		},
		setSyncDate: function(dateString){
			checkDB();
			var syncOn = new Date(dateString);
			syncOnMillis = syncOn.getTime();

			$rootScope.syncDateMillis = syncOnMillis;

			var sqlSyncDate = "INSERT OR REPLACE INTO CONFIG (CodConfig, SYNC_DATE) VALUES (1,'"+syncOnMillis+"')";
			if($rootScope.hasSyncDate){
				var sqlSyncDate = "UPDATE CONFIG SET SYNC_DATE = '"+syncOnMillis+"' WHERE CodConfig = 1";
			}else{
				var sqlSyncDate = "INSERT OR REPLACE INTO CONFIG (SYNC_DATE, TUTORIAL) VALUES ('"+syncOnMillis+"','SHOW')";		
			}
			if(syncOnMillis)
				$cordovaSQLite.execute(db, sqlSyncDate);
		},
		setShowTutorial: function(status){
			checkDB();
			if(status){
				var sqlTutorial = "UPDATE CONFIG SET TUTORIAL = 'SHOW' WHERE CodConfig = 1";
			}else{
				var sqlTutorial = "UPDATE CONFIG SET TUTORIAL = 'NSHOW' WHERE CodConfig = 1";
			}
			$cordovaSQLite.execute(db, sqlTutorial)
			.then(function(res){
				console.log(res);
			},function(error){
				console.log(error);
			});

		},
		setAcceptedTerms: function(){
			console.log("SQLUtils - setAcceptedTerms")
			checkDB();
			var sqlAcceptedTerms = "UPDATE CONFIG SET ACCEPTED_TERMS = 'ACCEPTED' WHERE CodConfig = 1";
			$cordovaSQLite.execute(db, sqlAcceptedTerms)
			.then(function(res){
				console.log(res);
			},function(error){
				console.log(error);
			});

		},
		saveTrack: function(track, status, callback){
			checkDB();
			if(track){
				var sqlSaveTrack = "INSERT OR REPLACE INTO TRACKS ( ID, TRACK_NAME, DESCRIPTION, ICON, A_F_NAME, A_L_NAME, A_ID, PARENTAL_RATING, MY_SCORE, SCORE, TAGS, CAPTURED_ON, STATUS, MODIFIED_ON) VALUES ( "+track.ID+", '"+treatStringToSqlValue(track.TRACK_NAME)+"', '"+treatStringToSqlValue(track.DESCRIPTION)+"', '"+track.ICON+"', '"+treatStringToSqlValue(track.A_F_NAME)+"', '"+treatStringToSqlValue(track.A_L_NAME)+"', '"+track.A_ID+"', '"+track.PARENTAL_RATING+"', (SELECT MY_SCORE FROM TRACKS WHERE ID = "+track.ID+"), '"+track.SCORE+"', '"+track.TAGS+"', (SELECT CAPTURED_ON FROM TRACKS WHERE ID = "+track.ID+"), COALESCE((SELECT STATUS FROM TRACKS WHERE ID = "+track.ID+" ),'"+status+"'), '"+track.MODIFIED_ON+"')";

				$cordovaSQLite.execute(db, sqlSaveTrack,[])
				.then(function(res){
					callback(res,track.ID);
				}, function(error){
					console.log(error);
				});
			}
		},
		saveAuthorAndUpdateTrackAuthor: function(author){
			checkDB();
			var sqlUpdateTrackAuthor = "UPDATE TRACKS SET A_F_NAME = '"+ author.F_NAME+"', A_L_NAME = '"+ author.L_NAME +"' WHERE A_ID = "+author.ID;
			// @TODO - usar a tabela auth_user
			var sqlSaveAuthor = "INSERT OR REPLACE INTO AUTHOR ( ID, FIRST_NAME, LAST_NAME, DESCRIPTION, ICON) VALUES ("+author.ID+", "+author.A_F_NAME+", "+author.A_L_NAME+", "+author.DESCRIPTION+", "+author.AVATAR+")";
		},
		updateTrackStatus: function(track, status, callback){
			checkDB();
			var sqlUpdateTrackStatus = "UPDATE TRACKS SET STATUS = '"+status+"' WHERE ID = "+track.ID;
			$cordovaSQLite.execute(db, sqlUpdateTrackStatus);
		},
		updateTrackScore: function(trackID, score){
			checkDB();
			var sqlUpdateTrackScore = "UPDATE TRACKS SET SCORE = '"+score+"' WHERE ID = "+trackID;
			$cordovaSQLite.execute(db, sqlUpdateTrackScore);
		},
		updateTrackMyScore: function(trackID, myScore){
			checkDB();
			var sqlUpdateTrackMyScore = "UPDATE TRACKS SET MY_SCORE = '"+myScore+"' WHERE ID = "+trackID;
			$cordovaSQLite.execute(db, sqlUpdateTrackMyScore);
		},
		updateUserEmail: function(userEmail){
			checkDB();
			$rootScope.userEmail = userEmail;
			if($rootScope.userEmail){
				var sqlUpdateUserEmail = "UPDATE CONFIG SET USER_EMAIL = '"+$rootScope.userEmail+"' WHERE CodConfig = 1";
				$cordovaSQLite.execute(db, sqlUpdateUserEmail);
			}
		},
		updateTrackTags: function(trackID, tags){
			var tagsString = "";
			for (var i = 0; i < tags.length; i++) {
				tagsString = tags[i].f_name+";"+tagsString;
			}

			tagsString.replace(/\s+/g, '');

			var sqlUpdateTrackTag = "UPDATE TRACKS SET TAGS = '"+treatStringToSqlValue(tagsString)+"' WHERE ID = "+trackID;
			
			$cordovaSQLite.execute(db, sqlUpdateTrackTag,[])
			.then(function(res){
				console.log(res);
			},function(error){
				console.log(error);
			});
		},
		updateTrackModifiedOnServer: function(track, callback){
			var sqlUpdateTrackModified = "UPDATE TRACKS SET TRACK_NAME = '"+treatStringToSqlValue(track.t_tracks.f_name)+"', DESCRIPTION = '"+treatStringToSqlValue(track.t_tracks.f_description)+"', ICON = '"+track.t_tracks.f_icon+"', PARENTAL_RATING = '"+track.t_tracks.f_parental_rating+"', MODIFIED_ON = '"+track.t_tracks.modified_on+"' WHERE ID = "+track.t_tracks.id;

			$cordovaSQLite.execute(db, sqlUpdateTrackModified,[])
			.then(function(res){
				callback(true, track.t_tracks.id);
			}, function(error){
				console.log(error);
			});


		},
		deleteTrack: function(track){
			checkDB();
			if(track){
				var sqlDeleteTrack = "DELETE FROM TRACKS WHERE ID = "+track.ID;
				var sqlDeletePois = "DELETE FROM POIS WHERE TRACK = "+track.ID; 

				$cordovaSQLite.execute(db, sqlDeleteTrack,[])
				.then(function(res){
					// console.log(res);
					$cordovaSQLite.execute(db, sqlDeletePois);
				},function(error){
					console.log(error);
				});
			}
		},
		getTrackByID: function(trackID, callback){
			checkDB();
			var sqlGetTrackByID = "SELECT * FROM TRACKS WHERE ID = " + trackID;

			$cordovaSQLite.execute(db, sqlGetTrackByID, [])
				.then(function(track){
					if(track.rows.length > 0){
						callback(track.rows.item(0));
					}else{

					}
				});
		},
		getTracksByIDs: function(trackIDs, callback){
			checkDB();
			var sqlGetTrackByID = "SELECT * FROM TRACKS WHERE ID IN (" +trackIDs+ ")";

			$cordovaSQLite.execute(db, sqlGetTrackByID, [])
				.then(function(track){
					if(track.rows.length > 0){
						callback(track.rows);
					}else{

					}
				});
		},
		getTracks: function(callback){
			checkDB();
			var sqlGetTracks = "SELECT * FROM TRACKS ORDER BY datetime(MODIFIED_ON) DESC";
		
			$cordovaSQLite.execute(db, sqlGetTracks, [])
				.then(function(tracks){
					if(tracks.rows.length > 0){
						var tracksItens = [];
						for (var i = 0; i < tracks.rows.length; i++) {
							tracksItens[i] = tracks.rows.item(i);
						}
						callback(tracksItens);
					}else{
						// no tracks on DB
					}
				}, function(error){
					console.log(error);
					callback(false);
				});
		},
		getTracksByAuthor: function(callback, autorId){
			checkDB();
			var sqlGetTracks = "SELECT * FROM TRACKS WHERE A_ID = "+autorId+" ORDER BY datetime(MODIFIED_ON) DESC";
		
			$cordovaSQLite.execute(db, sqlGetTracks, [])
				.then(function(tracks){
					if(tracks.rows.length > 0){
						var tracksItens = [];
						for (var i = 0; i < tracks.rows.length; i++) {
							tracksItens[i] = tracks.rows.item(i);
						}
						callback(tracksItens);
					}else{
						// no tracks on DB
					}
				}, function(error){
					console.log(error);
					callback(false);
				});
		},
		getTracksByTag: function(callback, tag){
			checkDB();
			var sqlGetTracks = "SELECT * FROM TRACKS WHERE TAGS LIKE '%"+treatStringToSqlValue(tag)+"%' ORDER BY datetime(MODIFIED_ON) DESC";
		
			$cordovaSQLite.execute(db, sqlGetTracks, [])
				.then(function(tracks){
					if(tracks.rows.length > 0){
						var tracksItens = [];
						for (var i = 0; i < tracks.rows.length; i++) {
							tracksItens[i] = tracks.rows.item(i);
						}
						callback(tracksItens);
					}else{
						// no tracks on DB
					}
				}, function(error){
					console.log(error);
					callback(false);
				});
		},
		getTracksByParentalRatings: function(callback, clIndic){
			checkDB();
			var sqlGetTracks = "SELECT * FROM TRACKS WHERE PARENTAL_RATING = "+clIndic+" ORDER BY datetime(MODIFIED_ON) DESC";
		
			$cordovaSQLite.execute(db, sqlGetTracks, [])
				.then(function(tracks){
					if(tracks.rows.length > 0){
						var tracksItens = [];
						for (var i = 0; i < tracks.rows.length; i++) {
							tracksItens[i] = tracks.rows.item(i);
						}
						callback(tracksItens);
					}else{
						callback(null);
					}
				}, function(error){
					console.log(error);
					callback(false);
				});
		},
		savePoi: function(poi){
			checkDB();
			if(poi){
				if(poi.PLACING == '-1')
					var sqlSavePoi = "INSERT OR REPLACE INTO POIS (ID, TRACK, PLACING, NAME, CONTENT, LATITUDE, LONGITUDE, CAPTURED_ON, STATUS,MODIFIED_ON) VALUES ("+poi.ID+", "+poi.TRACK+", "+poi.PLACING+", '"+treatStringToSqlValue(poi.NAME)+"', '"+treatStringToSqlValue(poi.CONTENT)+"', '"+poi.LATITUDE+"', '"+poi.LONGITUDE+"', (SELECT CAPTURED_ON FROM POIS WHERE ID = "+poi.ID+"), COALESCE((SELECT STATUS FROM POIS WHERE ID = "+poi.ID+" ),'CAPTURED'), '"+poi.MODIFIED_ON+"')";
				else if(poi.PLACING == '0')
					var sqlSavePoi = "INSERT OR REPLACE INTO POIS (ID, TRACK, PLACING, NAME, CONTENT, LATITUDE, LONGITUDE, CAPTURED_ON, STATUS,MODIFIED_ON) VALUES ("+poi.ID+", "+poi.TRACK+", "+poi.PLACING+", '"+treatStringToSqlValue(poi.NAME)+"', '"+treatStringToSqlValue(poi.CONTENT)+"', '"+poi.LATITUDE+"', '"+poi.LONGITUDE+"', (SELECT CAPTURED_ON FROM POIS WHERE ID = "+poi.ID+"), COALESCE((SELECT STATUS FROM POIS WHERE ID = "+poi.ID+" ),'CAN CAPTURE'), '"+poi.MODIFIED_ON+"')";
				else
					var sqlSavePoi = "INSERT OR REPLACE INTO POIS (ID, TRACK, PLACING, NAME, CONTENT, LATITUDE, LONGITUDE, CAPTURED_ON, STATUS,MODIFIED_ON) VALUES ("+poi.ID+", "+poi.TRACK+", "+poi.PLACING+", '"+treatStringToSqlValue(poi.NAME)+"', '"+treatStringToSqlValue(poi.CONTENT)+"', '"+poi.LATITUDE+"', '"+poi.LONGITUDE+"', (SELECT CAPTURED_ON FROM POIS WHERE ID = "+poi.ID+"), COALESCE((SELECT STATUS FROM POIS WHERE ID = "+poi.ID+" ),'NOT CAPTURED'), '"+poi.MODIFIED_ON+"')";
				// console.log(sqlSavePoi);
				$cordovaSQLite.execute(db,sqlSavePoi)
				.then(function(res){
					// console.log(res);
				}, function(error){
					console.log(error);
				});
			}
		},
		updatePoiCaptured: function(poi, callback){
			checkDB();
			var capturedOn = new Date();
			var sqlUpdateCapturedPoi = "UPDATE POIS SET STATUS = 'CAPTURED', CAPTURED_ON = '"+capturedOn+"' WHERE ID = "+poi.ID;
			
			//set next POI as "CAN CAPTURE"
			var nextPoi = parseInt(poi.PLACING);
			nextPoi++;
			
			var sqlUpdateNextPoi = "UPDATE POIS SET STATUS = 'CAN CAPTURE' WHERE PLACING = "+nextPoi+" AND TRACK = "+poi.TRACK;

			$cordovaSQLite.execute(db,sqlUpdateCapturedPoi,[])
			.then(function(res){
				$cordovaSQLite.execute(db,sqlUpdateNextPoi,[])
				.then(function(res){
					callback(true);
				},function(error){
					callback(error);
				});
			},function(error){
				callback(error);
			});
		},
		updatePoiModifiedOnServer: function(poi){
			var sqlUpdatePoiModified = "UPDATE POIS SET PLACING = '"+poi.PLACING+"', LATITUDE = '"+poi.LATITUDE+"', LONGITUDE = '"+poi.LONGITUDE+"', NAME = '"+treatStringToSqlValue(poi.NAME)+"', CONTENT = '"+treatStringToSqlValue(poi.CONTENT)+"', MODIFIED_ON = '"+poi.MODIFIED_ON+"' WHERE ID = '"+poi.ID+"' ";

			$cordovaSQLite.execute(db, sqlUpdatePoiModified,[])
			.then(function(res){
				// console.log(res);
			}, function(error){
				console.log("updatePoiModifiedOnServer error");
				console.log(error);
			});

		},
		deletePoi: function(poi){
			checkDB();
			if(poi){
				var sqlDeletePoi = "DELETE FROM POIS WHERE ID = "+poi.ID;
				$cordovaSQLite.execute(db, sqlDeletePoi);
			}
		},
		getPoisByTrackID: function(trackID, callback){
			checkDB();
			if(trackID){
				var sqlGetPoisByID = "SELECT * FROM POIS WHERE TRACK ="+trackID+" ORDER BY CAST(PLACING AS INTEGER) ASC";

				$cordovaSQLite.execute(db, sqlGetPoisByID, []).
				then(function(res){
					callback(res.rows);
				},function(error){
					console.log(error);
				});
			}
		},
		getCapturedPois: function(callback){
			checkDB();
			var sqlGetCapturedPois = "SELECT * FROM POIS WHERE STATUS = 'CAPTURED' ORDER BY DATETIME('CAPTURED_0N') DESC";
			$cordovaSQLite.execute(db, sqlGetCapturedPois, []).
			then(function(res){
				callback(res.rows);
			},function(error){
				console.log(error);
			});
		},
		getCanCapturePoisByTracksID: function(tracksID, callback){
			checkDB();
			var sqlGetCanCapturePoiByTrack = "SELECT TRACK, PLACING, STATUS, LATITUDE, LONGITUDE FROM POIS WHERE TRACK IN ("+tracksID+") AND STATUS = 'CAN CAPTURE'";
			
			$cordovaSQLite.execute(db, sqlGetCanCapturePoiByTrack, []).
			then(function(res){
				callback(res.rows);
			}, function(error){
				console.log(error);
			});
		}

	}
});