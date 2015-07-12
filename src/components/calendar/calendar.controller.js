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
    let dateToSet = this.selectedDate.clone().add(1, 'month');
    
    this.displayCalendarCard(dateToSet);
  }
  
  openCreateEventDialog() {
    _ngDialog.open({ 
      template: require('./createEventDialog.html'),
      plain: true,
      controller: ['$scope', ($scope) => {
        $scope.event = {};
        $scope.createEvent = (eventToSave) => {
          _calendarService.createEvent(eventToSave);
        };
      }]
    });
  }
}

CalendarController.$inject = ['CalendarService', 'ngDialog'];

export default CalendarController;