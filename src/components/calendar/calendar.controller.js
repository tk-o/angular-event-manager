import moment from 'moment';

let _calendarService;
let _ngDialog;

moment.locale('pl');

class CalendarController {
  constructor($scope, CalendarService, ngDialog) {
    _calendarService = CalendarService;
    _ngDialog = ngDialog;


    this.selectedDate = _calendarService.getLastSelectedDate();
    $scope.$watch(angular.bind(this, () => this.selectedDate), fetchDataForDate.bind(this));
    
    this.eventCollection = CalendarService.getAllEvents();

    this.localeData = moment.localeData();
  }

  refreshCalendarCard() {
    fetchDataForDate.call(this, this.selectedDate);
  }

  getSelectedMonthFullName(date) {
    const monthName = this.localeData.months(moment(date));

    return monthName;
  }

  displayCalendarCard(date) {
    this.days = _calendarService.getMonthData(date);
  }

  displayCurrentMonth() {
    let dateToSet = moment();

    this.selectedDate = dateToSet.toDate();
  }

  displayPreviousMonth() {
    let dateToSet = moment(this.selectedDate)
      .subtract(1, 'month')
      .date(1);
   
    this.selectedDate = dateToSet.toDate(); 
  }

  displayNextMonth() {
    let dateToSet = moment(this.selectedDate)
      .add(1, 'month')
      .date(1);
    
    this.selectedDate = dateToSet.toDate(); 
  }
  
  openCreateEventDialog() {
    const template = require('./createEventDialog.html');
    const dialog = createDialog(template, createEventController);
    const contollerCtx = this;

    function createEventController($scope) {
      $scope.event = {};
      $scope.createEvent = (eventToSave) => {
        eventToSave.isValid = $scope.createEventForm.$valid;

        _calendarService.createEvent(eventToSave)
          .then(onEventSaveSuccess.bind(contollerCtx), onEventSaveError);
      };

      function onEventSaveSuccess(response) {
        $scope.message = response.message;
        this.refreshCalendarCard.call(this);

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
  
  openEventDetailsDialog(event) {
    if(!event) {
      return;
    }

    const template = require('./openEventDetailsDialog.html');
    const dialog = createDialog(template, eventDetailsController);
    const contollerCtx = this;

    function eventDetailsController($scope) {
      $scope.event = event;
      $scope.deleteEvent = (eventToDelete) => {
        _calendarService.deleteEvent(eventToDelete)
          .then(onEventDeleteSuccess.bind(contollerCtx));
      };

      function onEventDeleteSuccess(response) {
        dialog.close();

        this.refreshCalendarCard();
      }
    }
  }
}

CalendarController.$inject = ['$scope', 'CalendarService', 'ngDialog'];

function fetchDataForDate(date) {
  const normalizedDate = moment(date)
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0)
    .toDate();

  _calendarService.setLastSelectedDate(normalizedDate);

  const newDate = _calendarService.getLastSelectedDate();

  this.displayCalendarCard(newDate);
};

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