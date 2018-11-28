angular.module('starter') //carrega os serviços que essa service utiliza
.factory("InternetUtilsService", function($ionicPlatform, $ionicPopup, $rootScope, $cordovaNetwork, $http){
	//mock function
	function mockGetJsonFromSystem(callBack){
		$http.get($rootScope.localUrl+"userDB/mockGetTracks.json").success(function(data,status){
			// persist new data
			// get data from dataBank
			callBack(data);
		}).error(function(data,status){
			callBack("mockError");
		});
	}
	return {
		hasInternet: function(callback){
			$ionicPlatform.ready(function(){
				if($cordovaNetwork.isOnline()){
					callback(true);
				}else{
					$ionicPopup.alert({
						title: 'Sem conexão de internet!',
						template: '<img ng-src="" src="img/ico3_ponto_indisp.png" class="my-loading" style="width:50%; text-align: center;"><p class="load-text-popup">Verifique a conexão e tente novamente</p>',
					})
					.then(function(){
						ionic.Platform.exitApp();
					});
				}
			});
		},
		// @TODO rever este método
		getTracksFromServer: function(date, callback){
			
		},
		getPoisByTrackFromServer: function(trackID, callBack){
		
		},
		getAuthorByID: function(authorID, callback){
		
		}
	}
});