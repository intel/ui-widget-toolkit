import {
    ChangeDetectionStrategy, Component, Input, NgModule, OnChanges, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import * as UWT from 'ui-widget-toolkit';

@Component({
    selector: 'uwt-chart',
    styles: [`
        .axis path,
        .axis line {
            fill: none;
            stroke: grey;
            stroke-width: 1;
            shape-rendering: crispEdges;
        }
        .axis text {
            font-size: larger;
        }
        .axis .lane-axis-label {
            font-size: .8em;
        }
        .lane-title {
            font-size: larger;
            font-style: italic;
        }
        .chart-title {
            padding-top: 1px;
        }
        .chart-background {
            stroke: white;
            fill: white;
        }
        .brush .extent {
            stroke: #fff;
            shape-rendering: crispEdges;
            fill-opacity: 0.125;
        }
        .zoom-region {
            fill: black;
            stroke: #fff;
            shape-rendering: crispEdges;
            fill-opacity: 0.125;
        }
        .legendCells .cell .label {
            font-size: 12px;
            font-family: Arial;
        }
        .chart-flame.labels {
            font-size: 12px;
            font-family: Arial;
            font-weight: bold;
            background-color: transparent;
            color: black;
        }
        .no-pointer-events {
            pointer-events: none;
        }
    `],
    template: `
        <div *ngIf='chartTitle' class='chart-title'>{{chartTitle}}</div>
        <div #chart id='chart'></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UWTChart implements OnChanges {
    @Input() chartTitle: string;
    @Input() chartDef: UWT.ICartesianChart;
    @Input() renderOptions: UWT.IOptions;
    @Input() colorManager: UWT.ColorManager;
    @Input() renderer: UWT.UIRenderer;
    @Input() onRender: () => void;

    @ViewChild('chart', { static: true }) chartElem: any;

    ngOnChanges(changes: any) {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.colorManager);
        }

        if (this.chartDef) {
            this.renderer.setDiv(this.chartElem.nativeElement);
            UWT.Chart.finalize(this.chartDef);
            this.renderer.invalidate(this.chartDef, this.renderOptions);
        }
    }
}

@Component({
    selector: 'uwt-swimlane-chart',
    template: `
        <div *ngIf='chartTitle' class='chart-title'>{{chartTitle}}</div>
        <ng-container *ngFor='let chartDef of chartDefs; let i = index'>
            <uwt-chart *ngIf='!chartDef.hide' [chartDef]='chartDef'
            [renderOptions]='getChartOptions(i)' [colorManager]='colorManager'
            [onRender]='onRender' [renderer]='renderer'></uwt-chart>
        </ng-container>
    `
})

export class UWTSwimlaneChart {
    @Input() chartTitle: string;
    @Input() chartDefs: UWT.ICartesianChart[];
    @Input() renderOptions: UWT.IOptions;
    @Input() colorManager: UWT.ColorManager;
    @Input() renderer: UWT.UIRenderer;
    @Input() onRender: () => void;

    @ViewChild('chart', { static: true }) chartElem: any;

    private chartOptions: UWT.IOptions[] = [];
    getChartOptions = function (index: number) {
        if (index >= this.chartOptions.length) {
            this.chartOptions[index] = UWT.copy(this.renderOptions);
        }
        return this.chartOptions[index];
    }

    ngOnChanges(changes: any) {
    }
}

@Component({
    selector: 'uwt-pie-chart',
    styles: [`
        .legendCells .cell .label {
            font-size: 12px;
            font-family: Arial;
        }

        .chart {
            margin: auto;
            width: inherit;
        }

        .no-pointer-events {
            pointer-events: none;
        }
    `],
    template: `
        <div *ngIf='chartTitle' class='chart-title'>{{chartTitle}}</div>
        <div #chart id='chart'></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UWTPieChart implements OnChanges {
    @Input() chartTitle: string;
    @Input() chartDef: UWT.IPieChart;
    @Input() renderOptions: UWT.IOptions;
    @Input() colorManager: UWT.ColorManager;
    @Input() renderer: UWT.UIRenderer;
    @Input() onRender: () => void;

    @ViewChild('chart', { static: true }) chartElem: any;

    ngOnChanges(changes: any) {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.colorManager);
        }

        while (this.chartElem.firstChild) {
            this.chartElem.remove(this.chartElem.firstChild);
        }
        if (this.chartDef) {
            this.renderer.setDiv(this.chartElem.nativeElement);
            this.renderer.invalidate(this.chartDef, this.renderOptions);
        }
    }
}

@Component({
    selector: 'uwt-radar-chart',
    styles: [`
        .legendCells .cell .label {
            font-size: 12px;
            font-family: Arial;
        }

        .chart {
            margin: auto;
            width: inherit;
        }

        .no-pointer-events {
            pointer-events: none;
        }
    `],
    template: `
        <div *ngIf='chartTitle' class='chart-title'>{{chartTitle}}</div>
        <div #chart id='chart'></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UWTRadarChart implements OnChanges {
    @Input() chartTitle: string;
    @Input() chartDef: UWT.IPieChart;
    @Input() renderOptions: UWT.IOptions;
    @Input() colorManager: UWT.ColorManager;
    @Input() renderer: UWT.UIRenderer;
    @Input() onRender: () => void;

    @ViewChild('chart', { static: true }) chartElem: any;

    ngOnChanges(changes: any) {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.colorManager);
        }

        while (this.chartElem.firstChild) {
            this.chartElem.remove(this.chartElem.firstChild);
        }
        if (this.chartDef) {
            this.renderer.setDiv(this.chartElem.nativeElement);
            this.renderer.invalidate(this.chartDef, this.renderOptions);
        }
    }
}

@Component({
    selector: 'uwt-grid',
    styles: [`
        div#grid {
            height: 400px
        }
    `],
    template: `
        <div *ngIf='gridTitle' class='grid-title'>{{gridTitle}}</div>
        <div #grid id='grid' [ngClass]='gridClass' [ngStyle]='gridStyle'></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UWTGrid implements OnChanges {
    @Input() gridTitle: string;
    @Input() gridDef: UWT.IGrid;
    @Input() gridStyle: any;
    @Input() gridClass: string[];
    @Input() colorManager: UWT.ColorManager;
    @Input() renderer: UWT.UIRenderer;
    @Input() onRender: () => void;

    @ViewChild('grid', { static: true }) gridElem: any;

    ngOnChanges(changes: any) {
        if (!this.renderer) {
            this.renderer = new UWT.AgGridRenderer(undefined, undefined, this.colorManager);
        }
        this.renderer.setOnRenderCallback(this.onRender);

        if (this.gridDef) {
            this.renderer.setDiv(this.gridDef, this.gridElem.nativeElement);
            this.renderer.invalidate(this.gridDef);
        }
    }
}

@Component({
    selector: 'uwt-flow-diagram',
    styles: [`
        div#graph {
            height: 400px
        }

        .node rect {
            cursor: move;
            fill-opacity: .9;
            shape-rendering: crispEdges;
        }

        .node text {
            pointer-events: none;
            text-shadow: 0 1px 0 #fff;
        }

        .link {
            fill: none;
            stroke: #888;
            stroke-opacity: .4;
        }
    `],
    template: `
        <div *ngIf='diagramTitle' class='diagram-title'>{{diagramTitle}}</div>
        <div #diagram id='diagram'></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UWTFlowDiagram implements OnChanges {
    @Input() diagramTitle: string;
    @Input() diagramDef: UWT.IConnectedGraph;
    @Input() renderOptions: UWT.IOptions;
    @Input() colorManager: UWT.ColorManager;
    @Input() renderer: UWT.UIRenderer;
    @Input() onRender: () => void;

    @ViewChild('diagram', { static: true }) diagramElem: any;

    ngOnChanges(changes: any) {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.colorManager);
        }
        this.renderer.setOnRenderCallback(this.onRender);

        if (this.diagramDef) {
            this.renderer.setDiv(this.diagramElem.nativeElement);
            this.renderer.invalidate(this.diagramDef, this.renderOptions);
        }
    }
}

@Component({
    selector: 'uwt-graph',
    styles: [`
        div#graph {
            height: 400px
        }

        .nodes circle {
            stroke: #fff;
            stroke-width: 1.5px;
        }

        .link {
            fill: none;
            stroke: #888;
            stroke-opacity: .4;
        }
    `],
    template: `
        <div *ngIf='graphTitle' class='graph-title'>{{graphTitle}}</div>
        <div #graph id='graph'></div>
    `
})

export class UWTGraph implements OnChanges {
    @Input() graphTitle: string;
    @Input() graphDef: UWT.IConnectedGraph;
    @Input() renderOptions: UWT.IOptions;
    @Input() colorManager: UWT.ColorManager;
    @Input() renderer: UWT.UIRenderer;
    @Input() onRender: () => void;

    @ViewChild('graph', { static: true }) graphElem: any;

    ngOnChanges(changes: any) {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.colorManager);
        }
        this.renderer.setOnRenderCallback(this.onRender);

        if (this.graphDef) {
            this.renderer.setDiv(this.graphElem.nativeElement);
            this.renderer.invalidate(this.graphDef, this.renderOptions);
        }
    }
}

@Component({
    selector: 'uwt-hierarchy-graph',
    styles: [`
        .h-node {
            cursor: pointer;
        }
        .h-node rect {
            shape-rendering: crispEdges;
        }
        .h-link {
            cursor: pointer;
            stroke-opacity: .4;
        }
        .link {
            fill: none;
            stroke: #888;
            stroke-opacity: .4;
        }
    `],
    template: `
        <div *ngIf='graphTitle' class='graph-title'>{{graphTitle}}</div>
        <div #graph id='graph'></div>
    `
})

export class UWTHierarchyGraph implements OnChanges {
    @Input() graphTitle: string;
    @Input() graphDef: UWT.IConnectedGraph;
    @Input() renderOptions: UWT.IOptions;
    @Input() colorManager: UWT.ColorManager;
    @Input() renderer: UWT.UIRenderer;
    @Input() onRender: () => void;

    @ViewChild('graph', { static: true }) graphElem: any;

    ngOnChanges(changes: any) {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.colorManager);
        }
        this.renderer.setOnRenderCallback(this.onRender);

        if (this.graphDef) {
            this.renderer.setDiv(this.graphElem.nativeElement);
            this.renderer.invalidate(this.graphDef, this.renderOptions);
        }
        if (!this.graphDef) {
            while (this.graphElem.firstChild) {
                this.graphElem.remove(this.graphElem.firstChild);
            }
        }
    }
}

@Component({
    selector: 'uwt-sunburst-chart',
    styles: [`
        .legendCells .cell .label {
            font-size: 12px;
            font-family: Arial;
        }

        .chart {
            margin: auto;
            width: inherit;
        }

        .no-pointer-events {
            pointer-events: none;
        }
    `],
    template: `
        <div *ngIf='chartTitle' class='chart-title'>{{chartTitle}}</div>
        <div #chart id='chart'></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UWTSunburstChart implements OnChanges {
    @Input() chartTitle: string;
    @Input() chartDef: UWT.ICartesianChart;
    @Input() renderOptions: UWT.IOptions;
    @Input() colorManager: UWT.ColorManager;
    @Input() renderer: UWT.UIRenderer;
    @Input() onRender: () => void;

    @ViewChild('chart', { static: true }) chartElem: any;

    ngOnChanges(changes: any) {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('', this.colorManager);
        }
        this.renderer.setOnRenderCallback(this.onRender);

        while (this.chartElem.firstChild) {
            this.chartElem.remove(this.chartElem.firstChild);
        }
        if (this.chartDef) {
            this.renderer.setDiv(this.chartElem.nativeElement);
            this.renderer.invalidate(this.chartDef, this.renderOptions);
        }
    }
}


@Component({
    selector: 'uwt-axis',
    styles: [`
        .axis path,
        .axis line {
            fill: none;
            stroke: grey;
            stroke-width: 1;
            shape-rendering: crispEdges;
        }
        .axis text {
            font-size: larger;
        }
        .axis .lane-axis-label {
            font-size: .8em;
        }
        .lane-title {
            font-size: larger;
            font-style: italic;
        }
        .chart-background {
            stroke: white;
            fill: white;
        }
        .brush .extent {
            stroke: #fff;
            shape-rendering: crispEdges;
            fill-opacity: 0.125;
        }
        .zoom-region {
            fill: black;
            stroke: #fff;
            shape-rendering: crispEdges;
            fill-opacity: 0.125;
        }
        .no-pointer-events {
            pointer-events: none;
        }
    `],
    template: `
        <div #axis id='axis'></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UWTAxis implements OnChanges {
    @Input() axisDef: UWT.IAxis;
    @Input() renderOptions: UWT.IOptions;
    @Input() renderer: UWT.UIRenderer;
    @Input() onRender: () => void;

    @ViewChild('axis', { static: true }) axisElem: any;

    ngOnChanges(changes: any) {
        if (!this.renderer) {
            this.renderer = new UWT.D3Renderer('');
        }

        if (this.axisDef) {
            this.renderer.setDiv(this.axisElem.nativeElement);
            this.renderer.invalidate(this.axisDef, this.renderOptions);
        }
    }
}

@NgModule({
    imports: [BrowserModule, CommonModule],
    declarations: [UWTAxis, UWTChart, UWTSwimlaneChart, UWTPieChart, UWTGrid, UWTFlowDiagram,
        UWTGraph, UWTSunburstChart, UWTHierarchyGraph, UWTAxis, UWTRadarChart],
    exports: [UWTAxis, UWTChart, UWTSwimlaneChart, UWTPieChart, UWTGrid, UWTFlowDiagram,
        UWTGraph, UWTSunburstChart, UWTHierarchyGraph, UWTRadarChart]
})
export class UWTModule { }
