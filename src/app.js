import angular from 'angular';
import uiRouter from 'angular-ui-router';

import routing from './app.routing';
import calendarComponent from './components/calendar';

import 'vc-reset-css/reset.css';
import './assets/styles/styles.scss';

angular.module('app', [uiRouter, calendarComponent])
  .config(routing);