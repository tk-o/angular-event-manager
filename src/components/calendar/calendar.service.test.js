import angular from 'angular';
import angularMocks from 'angular-mocks';
import moment from 'moment';
import CalendarServiceModule from './calendar.service.js';

describe('Calendar Service', () => {
  let CalendarService;

  beforeEach(angular.mock.module(CalendarServiceModule));

  beforeEach(angular.mock.inject(_CalendarService_ => {
    CalendarService = _CalendarService_;
  }));
  
  describe('Constructor', () => {
    it('initializes service properites', () => {
      expect(CalendarService).toBeDefined();
    });
  });

  describe('Last selected date', () => {
    let validDate = new Date(2000, 0, 1);
    let invalidDate = 'fakeDate';

    it('Is set if valid', () => {
      CalendarService.setLastSelectedDate(validDate);

      expect(CalendarService.getLastSelectedDate().toDate()).toEqual(validDate);
    });

    it('Is not set if invalid', () => {
      try {
        CalendarService.setLastSelectedDate(invalidDate);
      } catch(e) {
        expect(CalendarService.getLastSelectedDate().toDate()).not.toEqual(invalidDate);
      }
    });
  });

  describe('Month data', () => {
    it('gets data about days for selected month', () => {
      let date = moment(new Date(2015, 2, 1));
      let daysInMonth = 30;
      let daysInCard = (Math.ceil(daysInMonth / 7) + 1) * 7;
      let daysCount = CalendarService.getMonthData(date).length;

      expect(daysCount).toBeGreaterThan(daysInMonth);
      expect(daysCount).not.toBeGreaterThan(daysInCard);
    });
  });
});