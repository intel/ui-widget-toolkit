
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  UWTChart, UWTSwimlaneChart, UWTGrid, UWTPieChart, UWTFlowDiagram, UWTGraph,
  UWTSunburstChart, UWTCheckboxTreeModule
} from '../../dist/framework/angular2';
import { TestApp } from './angular2Test';

@NgModule({
  imports: [BrowserModule, UWTCheckboxTreeModule],
  declarations: [UWTChart, UWTSwimlaneChart, UWTGrid, UWTPieChart, UWTFlowDiagram, UWTGraph, UWTSunburstChart, TestApp],
  bootstrap: [TestApp]
})
export class TestModule { }


/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/