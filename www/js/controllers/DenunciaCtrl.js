angular.module('starter')
.controller('DenunciaCtrl', function($scope, $rootScope, $ionicLoading, $stateParams, TrilhasService, $ionicPopup, $ionicHistory){
	var trackID = $stateParams.trilhaId;
	var poiID = $stateParams.pontoId;

	if(!$rootScope.userEmail){
		$scope.login();
	}

	$scope.reportType = 'Conteúdo ofensivo';
	$scope.contentReport = null;
	$scope.trackName = "";

	if($rootScope.currentTrack){
		var trackName = $rootScope.currentTrack.TRACK_NAME;
	}else{
		var trackName = trackID;
	}

	if(poiID){
		if($rootScope.currentPoi){
			var poiName = $rootScope.currentPoi.NAME;
		}else{
			var poiName = poiID;
		}
	}
	trackName = trackName+"/r/n";
	poiName = poiName+"/r/n";

	$scope.enviarDenuncia = function(){
		if($scope.reportType && $scope.contentReport){
			var reportTypeMsg = "Tipo da denuncia: "+$scope.reportType+"/r/n";
			var contentReportMsg = "Conteúdo: "+$scope.contentReport+"/r/n";

			var wrapperMsg = trackName+poiName+reportTypeMsg+contentReportMsg;
			if($rootScope.userEmail){
				TrilhasService.sendReport(trackID,poiID,wrapperMsg, function(res){
					//@TODO apresentar feedback de envio
					$ionicHistory.goBack();
				});
			}else
				$scope.login();
		}else{
			$ionicPopup.alert({
				title: 'Preencha todos os campos',
				template: '<img ng-src="" src="img/ico3_ponto_indisp.png" class="my-loading" style="width:50%; text-align: center;"><p class="load-text-popup">Selecione o tipo da denúncia e/ou preencha o conteúdo e tente novamente</p>',
			});
		}
	}
});