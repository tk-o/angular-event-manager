import angular from 'angular';
import ngstorage from 'ngstorage';
import moment from 'moment';
import 'moment-range';
import shortid from 'shortid';

import calendarConfig from './calendar.config.js';

const _eventCollection = [];

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
    this.loadEvents();
  }

  loadConfiguration(calendarConfig) {
    let { localStorageNs, selectedDateKey, eventsKey } = calendarConfig;

    _lsPrefix = localStorageNs;
    _lsLastSelectedDate = `${_lsPrefix}.${selectedDateKey}`;
    _lsEvents = `${_lsPrefix}.${eventsKey}`;
  }

  getLastSelectedDate() {
    const lastSelectedDate = _localStorageService[_lsLastSelectedDate] || new Date();

    return moment(lastSelectedDate);
  }

  setLastSelectedDate(date) {
    const isDateValid = moment(date).isValid();

    if(!isDateValid) {
      throw Error('Date is not valid');
    }

    _localStorageService[_lsLastSelectedDate] = date;
  }

  getMonthData(date) {
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

    _eventCollection.forEach(e => {
      
    });

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

  loadEvents() {
    let lsEventCollection = _localStorageService[_lsEvents];
    let eventCollection = lsEventCollection ? JSON.parse(lsEventCollection) : [];

    _eventCollection.push.apply(_eventCollection, eventCollection);
  }

  saveEvents() {
    _localStorageService[_lsEvents] = JSON.stringify(_eventCollection);
  }

  createEvent(eventData) {
    const deferred = _$q.defer();

    const eventRange = moment.range(eventData.startDate, eventData.endDate);
    const isEventOverlappingOtherOne = _eventCollection.some(e => {
      let currentRange = moment.range(e.startDate, e.endDate);

      return eventRange.overlaps(currentRange);
    });
    eventData.id = shortid.generate();
    
    if(!eventData.isValid) {
      deferred.reject({
        message: 'Proszę wypełnić wszystkie pola formularza.'
      });
    } else if(isEventOverlappingOtherOne) {
      deferred.reject({
        message: 'Nie zapisano. Istnieją już inne zdarzenia w wybranym przedziale czasu.'
      });
    } else {
      _eventCollection.push(eventData);
      this.saveEvents();

      deferred.resolve({
        message: 'Zapisano wydarzenie'
      });
    }

    return deferred.promise;
  }
}

CalendarService.$inject = ['CalendarConfig', '$localStorage', '$q'];

export default angular.module('app.calendar.services', [calendarConfig, 'ngStorage'])
  .service('CalendarService', CalendarService)
  .name;