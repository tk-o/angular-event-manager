import angular from 'angular';
import ngstorage from 'ngstorage';
import moment from 'moment';
import 'moment-range';
import shortid from 'shortid';

import calendarConfig from './calendar.config.js';

let _localStorageService;
let _$q;
let _lsPrefix;
let _lsEvents;
let _lsLastSelectedDate;

moment.locale('pl');

class CalendarService {
  constructor(CalendarConfig, LocalStorageService, $q) {
    _localStorageService = LocalStorageService;
    _$q = $q;

    this.loadConfiguration(CalendarConfig);
  }

  loadConfiguration(calendarConfig) {
    let { localStorageNs, selectedDateKey, eventsKey } = calendarConfig;

    _lsPrefix = localStorageNs;
    _lsLastSelectedDate = `${_lsPrefix}.${selectedDateKey}`;
    _lsEvents = `${_lsPrefix}.${eventsKey}`;
  }

  getLastSelectedDate() {
    const lastSelectedDate = _localStorageService[_lsLastSelectedDate] || new Date();
    const plainDate = moment(lastSelectedDate).toDate()

    return plainDate;
  }

  setLastSelectedDate(plainDate) {
    const date = this.removeTimezoneOffset(plainDate);
    const isDateValid = moment(date).isValid();

    if(!isDateValid) {
      throw Error('Date is not valid');
    }

    _localStorageService[_lsLastSelectedDate] = date;
  }

  getMonthData(plainDate) {
    const date = moment(plainDate);
    const monthData = [];
    const startDate = this.getCardStartDate(date);
    const monthOrderNumber = date.month();

    let currentDate = startDate.clone();
    let isDone = () => monthData.length > 1 && monthOrderNumber !== currentDate.month();

    do {
      let weekData = this.getWeekData(currentDate);      
      monthData.push.apply(monthData, weekData);

      currentDate.add(7, 'd');      
    } while(!isDone());

    this.mergeMonthDataWithEvents(monthData);

    return monthData;
  }

  getWeekData(date) {
    const weekData = [];
    let currentDate = date.clone();

    for(let i = 0; i < 7; i++) {
      let dayData = this.getDayData(currentDate, i);
      
      weekData.push(dayData);

      currentDate = currentDate.clone();
      currentDate.add(1, 'd');
    }

    return weekData;
  }

  getDayData(date, orderNumber) {
    const dayNumber = date.date();
    const dateFormat = dayNumber === 1 ? 'D MMM' : 'D';
    const formattedDayName = date.format(dateFormat);
    const plainDate = date.toDate();

    const dayData = {
      name: formattedDayName,
      date: plainDate,
      order: orderNumber
    };

    return dayData;
  }

  getCardStartDate(date) {
    let startDate = date.clone().date(1);

    const isStartDateSunday = startDate.day() === 0;

    if(isStartDateSunday) {
      startDate.subtract(6, 'day');
    } else {
      startDate.day(1);
    }

    return startDate;
  }

  getAllEvents() {    
    let lsEventCollection = _localStorageService[_lsEvents];
    let eventCollection = lsEventCollection ? JSON.parse(lsEventCollection) : [];

    eventCollection.forEach(ev => {
      ev.startDate = new Date(ev.startDate);
      ev.endDate = new Date(ev.endDate);
    })

    return eventCollection;
  }

  updateEvents(eventData, deleteEvent = false) {
    const eventCollection = this.getAllEvents();

    if(deleteEvent) {
      const eventToDeleteIndex = eventCollection.findIndex(x => x.id === eventData.id);

      eventCollection.splice(eventToDeleteIndex, 1);
    } else {      
      eventCollection.push(eventData);
    }

    _localStorageService[_lsEvents] = JSON.stringify(eventCollection);

    return eventCollection;
  }

  createEvent(eventData) {
    const deferred = _$q.defer();
    const newEvent = angular.copy(eventData);

    newEvent.id = shortid.generate();
    
    const validationErrorMessage = this.validateEventData(newEvent);
    if(validationErrorMessage) {
      deferred.reject({
        message: validationErrorMessage
      });
    } else {
      newEvent.startDate = this.removeTimezoneOffset(newEvent.startDate);
      newEvent.endDate = this.removeTimezoneOffset(newEvent.endDate);

      const eventCollection = this.updateEvents(newEvent);

      deferred.resolve({
        message: 'Zapisano wydarzenie'
      });
    }

    return deferred.promise;
  }

  deleteEvent(eventData) {
    const deferred = _$q.defer();
    const deleteEvent = true;

    const eventCollection = this.updateEvents(eventData, deleteEvent);

    deferred.resolve({
      message: 'Usunięto wydarzenie'
    });

    return deferred.promise;
  }

  validateEventData(eventData) {
    const isFormDataIncomplete = !eventData.isValid;
    const isDateToBeforeDateFrom = moment(eventData.endDate).isBefore(eventData.startDate);
    const eventRange = moment.range(eventData.startDate, eventData.endDate);
    const isEventOverlappingOtherOne = this.getAllEvents().some(e => {
      let currentRange = moment.range(e.startDate, e.endDate);

      return eventRange.overlaps(currentRange);
    });
    let validationError = null;

    if(isFormDataIncomplete) {
      validationError = 'Proszę wypełnić wszystkie pola formularza.'
    } else if(isDateToBeforeDateFrom) {
      validationError = 'Data końcowa nie może być przed datą początkową.'
    } else if(isEventOverlappingOtherOne) {
      validationError = 'Nie zapisano. Istnieją już inne zdarzenia w wybranym przedziale czasu.'
    }

    return validationError
  }

  removeTimezoneOffset(plainDate) {
    let date = moment(plainDate);
    let offset = plainDate.getTimezoneOffset()/-60;

    date.add(offset, 'hour');

    return date.toDate();
  }

  mergeMonthDataWithEvents(monthData) { 
    const mergedMonthData = [];   
    const firstDayOnCard = monthData[0].date;
    const lastDayOnCard = monthData[monthData.length - 1].date;
    const cardRange = moment.range(firstDayOnCard, lastDayOnCard);

    const cartEventCollection = this.getAllEvents()
      .filter(eventData => cardRange.contains(eventData.startDate) || cardRange.contains(eventData.startDate));

    let setAsDayOfEvent = false;
    for(let eventData of cartEventCollection) {
      const eventRange = moment.range(eventData.startDate, eventData.endDate);

      monthData.forEach(day => {
        const isDayOfEvent = eventRange.contains(day.date);
        const isStartOfRange = eventRange.start.isSame(day.date);
        const isEndOfRange = eventRange.end.isSame(day.date);

        if(isDayOfEvent) {
          day.eventData = eventData;
          day.isStartOfRange = isStartOfRange;
          day.isEndOfRange = isEndOfRange;
          day.displayName = day.isStartOfRange || day.date.getDay() === 1;
        }
      });
    }
  }
}

CalendarService.$inject = ['CalendarConfig', '$localStorage', '$q'];

export default angular.module('app.calendar.services', [calendarConfig, 'ngStorage'])
  .service('CalendarService', CalendarService)
  .name;