import moment from 'moment';

let _calendarService;
let _ngDialog;

moment.locale('pl');

class CalendarController {
  constructor(CalendarService, ngDialog) {
    _calendarService = CalendarService;
    _ngDialog = ngDialog;

    this.selectedDate = _calendarService.getLastSelectedDate();
    this.days = _calendarService.getMonthData(this.selectedDate);
    this.localeData = moment.localeData();
  }

  displayCalendarCard(date) {
    _calendarService.setLastSelectedDate(date);

    this.selectedDate = date;
    this.days = _calendarService.getMonthData(date);
  }

  displayCurrentMonth() {
    let dateToSet = moment();
    
    this.displayCalendarCard(dateToSet);
  }

  displayPreviousMonth() {
    let dateToSet = this.selectedDate.clone()
      .subtract(1, 'month')
      .date(1);
    
    this.displayCalendarCard(dateToSet);
  }

  displayNextMonth() {
    let dateToSet = this.selectedDate.clone()
      .add(1, 'month');
    
    this.displayCalendarCard(dateToSet);
  }
  
  openCreateEventDialog() {
    const template = require('./createEventDialog.html');
    const dialog = createDialog(template, createEventController);

    function createEventController($scope) {
      $scope.event = {};
      $scope.createEvent = (eventToSave) => {
        _calendarService.createEvent(eventToSave)
          .then(onEventSaveSuccess, onEventSaveError);
      };

      function onEventSaveSuccess(response) {
        $scope.message = response.message;

        setTimeout(() => dialog.close(), 2000);
      }

      function onEventSaveError(response) {
        $scope.message = response.message;

        setTimeout(() => $scope.message = null, 2000);
      }
    }
  }
}

CalendarController.$inject = ['CalendarService', 'ngDialog'];

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