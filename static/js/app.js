var dogApp = angular.module('dogApp',['ui.router', 'ngAnimate']);

dogApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',function($stateProvider, $urlRouterProvider, $locationProvider) {
  	$stateProvider
  	.state('index', {
  		url: "/",
  		templateUrl: "partial/index.html",
  		controller: "MainCtrl"
  	})
    .state('result', {
		url: "/result?name",
		templateUrl: "partial/index.html",
		controller: "MainCtrl"
    });

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

}]);

dogApp.controller('MainCtrl',['$scope', '$location', '$http','$stateParams', '$timeout', '$state', '$rootScope', function($scope, $location, $http, $stateParams, $timeout, $state, $rootScope){
	$scope.tested = false;
	$scope.image = ((data == true) ? 'img/單身狗/' + data.doggie.name + '.jpg' : 'img/doggie.gif');
	$scope.loading = false;

	$http.get('/api/articles').success(function(data){
		$scope.articles = data;
	})

	if($rootScope.first !== false){
		$rootScope.first = true;
	}
	if($state.current.name == "result" && $stateParams.name){
		$scope.name = $stateParams.name;
		$scope.loading = true;
		$http.get('/api/single?name='+$scope.name).success(function(httpData){
			$scope.loading = false;
			$scope.image = 'img/單身狗/' + httpData.doggie.name + '.jpg';
			$scope.doggie = httpData.doggie;
			$scope.tested = true;
		})

	} else if($state.current.name && !$stateParams.name){
		$state.go('index');
	}



	$scope.getDog = function(){
		$scope.loading = true;

		if(!$scope.name){
			return alert('沒名字呀!');
		}
		$http.get('/api/single?name='+$scope.name).success(function(httpData){
			$timeout(function(){
				$scope.loading = false;
				$scope.image = 'img/單身狗/' + httpData.doggie.name + '.jpg';
				$scope.doggie = httpData.doggie;
				$state.go('result', {name: $scope.name});
				$scope.tested = true;
				$rootScope.first = false;
				
			}, 500);	
		})
		
	}

	$scope.retest = function(){
		$scope.first = false;
		$scope.tested = false;
		$scope.image = 'img/單身狗/博美犬.jpg';
		$scope.loading = false;
		$scope.doggie = {};
		$state.go('index');
	}

	$scope.toggleShare = function(){
		$scope.sharing = !$scope.sharing;
	}
}])