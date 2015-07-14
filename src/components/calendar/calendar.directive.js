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
    replace: true,
    scope: {
      days: '=',
      selectedDate: '='
    },
    link: (scope, element, attrs, controllers) => {
      scope.weekDayNames = getWeekDayNames();
      scope.selectDay = selectDay(scope);

      scope.$watch('selectedDate', selectedDate => scope.selectDay(selectedDate));
    },
    template: require('./calendarCard.html')
  };
}

function selectDay(scope) {
  return day => {
    const selectDate = day._isAMomentObject ? day : moment(day.date);

    scope.days.forEach(d => {
      const currentDate = moment(d.date);
      let isToday = selectDate.isSame(currentDate);
      d.isToday = isToday;

      if(isToday) { 
        scope.$parent.selectedDate = selectDate;
      }
    });
  }
}

export default angular.module('app.calendar.directives', [])
  .directive('calendarCard', calendarCardDirective)
  .name;