import angular from 'angular';
import moment from 'moment';

moment.locale('pl');

function getWeekDayNames() {
  const localeData = moment.localeData();
  const weekDayNames = localeData._weekdaysShort;
  const sunday = weekDayNames.shift();
  
  weekDayNames.push(sunday);

  return weekDayNames;
}

function calendarCardDirective() {
  return {
    restrict: 'E',
    scope: {
      days: '='
    },
    link: (scope, element, attrs, controllers) => {
      scope.weekDayNames = getWeekDayNames();
    },
    template: require('./calendarCard.html')
  };
}

export default angular.module('app.calendar.directives', [])
  .directive('calendarCard', calendarCardDirective)
  .name;