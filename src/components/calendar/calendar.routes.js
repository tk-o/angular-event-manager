routes.$inject = ['$stateProvider'];

function routes($stateProvider) {
  const template = require('./calendarManager.html');

  $stateProvider
    .state('calendar', {
      url: '/',
      template: template,
      controller: 'CalendarController',
      controllerAs: 'calendar'
    });
}

export default routes;