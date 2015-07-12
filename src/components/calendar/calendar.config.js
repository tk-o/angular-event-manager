import angular from 'angular';

const config = {
  localStorageNs: 'calendarApp',
  selectedDateKey: 'selectedDate',
  eventsKey: 'events'
};

export default angular.module('app.calendar.constants', [])
  .value('CalendarConfig', config)
  .name;