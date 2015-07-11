function routing($urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');
}
routing.$inject = ['$urlRouterProvider', '$locationProvider'];

export default routing;