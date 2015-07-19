import moment from 'moment';

let _calendarService;
let _ngDialog;

moment.locale('pl');

class CalendarController {
  constructor($scope, CalendarService, ngDialog) {
    _calendarService = CalendarService;
    _ngDialog = ngDialog;


    this.selectedDate = _calendarService.getLastSelectedDate();
    $scope.$watch(angular.bind(this, () => this.selectedDate),
      nv => this.displayCalendarCard(nv)
    );
    
    this.eventCollection = CalendarService.getAllEvents();

    this.localeData = moment.localeData();
  }

  getSelectedMonthFullName(date) {
    const monthName = this.localeData.months(moment(date));

    return monthName;
  }

  displayCalendarCard(date) {
    _calendarService.setLastSelectedDate(date);
    this.days = _calendarService.getMonthData(date);
  }

  displayCurrentMonth() {
    let dateToSet = moment();
    
    this.displayCalendarCard(dateToSet);
  }

  displayPreviousMonth() {
    let dateToSet = moment(this.selectedDate)
      .subtract(1, 'month')
      .date(1);
    
    this.displayCalendarCard(dateToSet);
  }

  displayNextMonth() {
    let dateToSet = moment(this.selectedDate)
      .add(1, 'month');
    
    this.displayCalendarCard(dateToSet);
  }
  
  openCreateEventDialog() {
    const template = require('./createEventDialog.html');
    const dialog = createDialog(template, createEventController);

    function createEventController($scope) {
      $scope.event = {};
      $scope.createEvent = (eventToSave) => {
        eventToSave.isValid = $scope.createEventForm.$valid;

        _calendarService.createEvent(eventToSave)
          .then(onEventSaveSuccess, onEventSaveError);
      };

      function onEventSaveSuccess(response) {
        $scope.message = response.message;

        setTimeout(() => dialog.close(), 1500);
      }

      function onEventSaveError(response) {
        $scope.message = response.message;

        setTimeout(() => {
          $scope.message = null; 
          $scope.$apply();
        }, 3000);
      }
    }
  }
}

CalendarController.$inject = ['$scope', 'CalendarService', 'ngDialog'];

function createDialog (template, controller) {
  const dialog = _ngDialog.open({ 
    template: template,
    plain: true,
    className: '',
    controller: ['$scope', controller]
  });

  return dialog;
}

export default CalendarController;