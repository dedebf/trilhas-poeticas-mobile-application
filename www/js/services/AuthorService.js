angular.module('starter')
.factory("AuthorService", function ($http, TrilhasService){

	return{
		getAuthorByID: function(authoID, callback){
			TrilhasService.getAuthorInfo(authoID, function(author){
				if(author){
					callback(author[0]);
				}else{ //get author from server
					callback(null);
				}
			});
		}
	}
});