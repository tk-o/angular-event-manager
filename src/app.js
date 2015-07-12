import angular from 'angular';
import uiRouter from 'angular-ui-router';

import routing from './app.routing';
import calendarComponent from './components/calendar';

import 'normalize.css';
import './assets/styles.scss';

angular.module('app', [uiRouter, calendarComponent])
  .config(routing);