import angular from 'angular';
import uiRouter from 'angular-ui-router';
import ngDialog from 'ng-dialog';

import routing from './calendar.routes';
import calendarController from './calendar.controller';
import calendarService from './calendar.service';
import calendarCardDirective from './calendar.directive';

import 'ng-dialog/css/ngDialog.css';
import 'ng-dialog/css/ngDialog-theme-default.css';
import './styles.scss';

const component = angular.module('app.calendar', [uiRouter, calendarService, calendarCardDirective, 'ngDialog'])
  .config(routing)
  .controller('CalendarController', calendarController)
  .name;

export default component;