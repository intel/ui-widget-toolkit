# DISCONTINUATION OF PROJECT.

This project will no longer be maintained by Intel.

This project has been identified as having known security escapes.

Intel has ceased development and contributions including, but not limited to, maintenance, bug fixes, new releases, or updates, to this project.

Intel no longer accepts patches to this project.

ui-widget-toolkit
=================

The ui-widget-toolkit is a library designed with goal of helping tool developers quickly create useful tools.  It provides views commonly required for tools like various trace views, line charts, area charts, scatter plots, grid views, flame chart views and connected graph views.  The simplified interface helps users focus on pushing data and managing what happens when the user interacts with the views instead of worrying about how to render the data.

Built on top of several popular JavaScript libraries including [d3](https://d3js.org/), [pixi.js](http://www.pixijs.com/) and [ag-grid-community](https://www.ag-grid.com/), the ui-widget-toolkit supports the following JavaScript frameworks:

* [AngularJS](https://angularjs.org/)
* [Angular](https://angular.io/)
* [Polymer](https://www.polymer-project.org/)
* [Polymer 2](https://www.polymer-project.org/)
* [React](https://reactjs.org/)
* [Vue.js](https://vuejs.org/)

The various widgets currently supported by the library are:

* [Area Graph](https://intel.github.io/ui-widget-toolkit/examples/area/areaTest.html)
* [Arrows](https://intel.github.io/ui-widget-toolkit/examples/arrow/arrowTest.html)
* [Bar Chart](https://intel.github.io/ui-widget-toolkit/examples/bar/barTest.html)
* [Box Plot](https://intel.github.io/ui-widget-toolkit/examples/boxPlot/boxPlotTest.html)
* [Sankey Flow Diagrams/Force Graph](https://intel.github.io/ui-widget-toolkit/examples/connectedGraph/connectedGraphTest.html)
* [Flame/Sunburst and Trace Data](https://intel.github.io/ui-widget-toolkit/examples/flameSunburst/flameSunburstTest.html)
* [Grid](https://intel.github.io/ui-widget-toolkit/examples/grid/gridTest.html)
* [Heatmap](https://intel.github.io/ui-widget-toolkit/examples/heatMap/heatMapTest.html)
* [Hierarchy Graph](https://intel.github.io/ui-widget-toolkit/examples/hierarchyGraph/hierarchyGraphTest.html)
* [Line Graph](https://intel.github.io/ui-widget-toolkit/examples/line/lineTest.html)
* [Mark Events](https://intel.github.io/ui-widget-toolkit/examples/marker/markerTest.html)
* [Min Max Value](https://intel.github.io/ui-widget-toolkit/examples/minMaxValue/minMaxValueTest.html)
* [Pie Chart](https://intel.github.io/ui-widget-toolkit/examples/pie/pieTest.html)
* [Port Diagram](https://intel.github.io/ui-widget-toolkit/examples/portDiagram/portDiagramTest.html)
* [Radar/Spider Chart](https://intel.github.io/ui-widget-toolkit/examples/radar/radarTest.html)
* [Rectangle](https://intel.github.io/ui-widget-toolkit/examples/rect/rectTest.html)
* [Scatter Plot](https://intel.github.io/ui-widget-toolkit/examples/scatter/scatterTest.html)
* [Treemap](https://intel.github.io/ui-widget-toolkit/examples/treemap/treemap.html)

# Performance
## Renderer Flexibility
The ui-widget-toolkit has a goal of maximum performance on relatively large data sets.  In order to meet these performance requirements, the library leverages WebGL using pixi.js when it makes sense.  In cases where both SVG and WebGL implementations exist, the ui-widget-toolkit picks the most reasonable default.  A developer may force an alternative renderer by passing the appropriate options to the library.

Visualizations with both SVG and WebGL renderers include:

* Flame/Sunburst (WebGL Default)
* Port Diagrams (WebGL Default)
* Scatter Plots (WebGL Default)

SVG renderings may look slightly sharper than the WebGL counterpart at the cost of some performance.  Note that the heatmap widget provides only a WebGL renderer.

## Web Worker support
Web Workers can be created for charts when extremely large data sets are rendered.  Web Workers are disabled by default because Web Workers are expensive to create and can therefore hurt responsiveness for small to medium size data sets.  They can be useful if there is a large data set with a large amount of view changes that are occurring quickly (a la mouse wheel zooming).  When a view using a Web Worker is updated, it renders whatever data it has and waits to render the rest of the data when it becomes available.  Also it is possible to easily cancel existing operations when Web Workers are used, which allows plugin writers to create schemes that do not need to intrinsically check if they should be cancelled or not.

# Simplicity
## User Interaction
The ui-widget-toolkit provides helper classes to enable designers to create a simple, cohesive user experience.  The widgets share helper items like contexts menu and tooltips, and each widget has a default output that make sense.  If needed, it is possible to override or extend the defaults via up front configuration or dynamic callbacks.  Typical user interaction mechanisms such as:

* Click
* Double Click
* Right Click
* Hover
* Selection
* Mouse Wheel Zoom

all have callbacks for each widget and/or per data series.

## Element Manager and Color Manager
The element manager and color manager helpers go even further enable a cohesive user experience.  The element manager groups widgets together by tooltip group, hover/selection/zoom group and render group.  When a widget in a group receives a given event, all widgets in that group are notified and can respond accordingly.  This simplifies coordination of selection, zooming and resizing of widgets.

Each widget may also have an associated color manager. The color manager maintains a list of colors by keyword and when widgets request a color it returns that color if it exists or a random color defined by the library or a user defined function.  This allows for a unified experience across widgets and a simpler developer implementation.

Note that it is possible to have multiple element managers and color managers but only one of each of these can be associated with a given widget at a time.

# Decimators
Decimation schemes allow the ui-widget-toolkit to take a data set and dynamically adjust how to render the data.  It is possible to reduce the amount of data to render for performance or to render the same data in different ways.  A common decimation scheme is averaging the values within a given pixel for rendering.  The ui-widget-toolkit provides several out of the box decimation schemes to take the same data set and render it differently depending on the usage model.  Some examples:

* Summing the values per X pixel which is useful for rendering [counter data to area graph](https://intel.github.io/ui-widget-toolkit/examples/counterAreaGraph/counterAreaGraphTest.html).
* Rendering the range (min/max) value per X pixel as in the first [step graph](https://intel.github.io/ui-widget-toolkit/examples/line/lineTest.html) example.

In both cases the data is the same, but the rendered output is useful for different use cases.

Another example taking a set of XY data a decimator choosing to render the minimum value, the maximum value or the average value for a given x-axis value.

  * [Scatter Plot](https://intel.github.io/ui-widget-toolkit/examples/scatter/scatterTest.html)

Trace data provides a lot of opportunities to leverage decimators.  Instead of rendering trace data as a series of rectangles, which become hard to distinguish as the amount of data increases, the ui-widget-toolkit can render trace data as a stacked area graph by the duration per X pixel.  This allows one to see not only when a trace element happens, but also allows one to see how much of the time is consumed by trace element.

  * [Trace Data Charts](https://intel.github.io/ui-widget-toolkit/examples/flameSunburst/flameSunburstTest.html)

The residency and stacked area decimators allow one to take multiple XY data sets that have different X values and distribute the Y values to render stacked area graphs.  Once again, the stacked area graph allows one to visualize the relative Y values across multiple data streams.
  * [Area Graph](https://intel.github.io/ui-widget-toolkit/examples/area/areaTest.html)


# Building the library:

Run the following commands (assuming NPM is installed)

	npm install
	npm run build-release

After building the release there is one manual step required to make the library friendly with legacy modules.  Add

	export as namespace UWT;

to `dist/index.d.ts`

	import * as PIXI from 'pixi.js';

	export as namespace UWT;
	export function showContextMenu(event: MouseEvent, data: any, contextMenuItems: IContextMenuItem[], propogateEvent?: boolean): void;

# Running Examples:

To build most examples run:

	node_modules\.bin\tsc -p examples

All of the non-framework tests will be built and you can access them by opening the html files for the respective examples.

## Vue Framework Example:
To compile and view the vue example run:

	node_modules\.bin\webpack --config examples-frameworks\vue\webpack.config.js

and then open the examples-frameworks\vue\vue.html

## React Framework Example:
To compile and view the vue example run:

	node_modules\.bin\webpack --config examples-frameworks\react\webpack.config.js

and then open the examples-frameworks\react\react.html

## Angular2 Framework Example:
To compile and view the angular2 example run:

	node_modules\.bin\webpack --config examples-frameworks\angular2\webpack.config.js

and then open the examples-frameworks\angular2\angular2Test.html

## Polymer Framework Examples:
To compile and view the polymer example you must run:

	polymer serve

and then connect via whatever port polymer serve output gives you in your browser.  For example you would go to:

	localhost:8081/examples-frameworks/polymer2/polymer2Test.html

if the polymer serve command runs on port 8081.

## Running tests

1. Make sure there is a chromedriver in the spec/drivers folder for your OS and the spec/drivers folder is in your path.  You can download chromedriver from here:

	http://chromedriver.chromium.org/downloads

2. Unzip the spec/data.zip into the spec/data directory.
3. Run

	- npm run build-test
	- npm run test

## Upgraded from version 1.x to version 2.x
Please see the notes on what has changed between 1.x and 2.x [here](https://github.com/intel/ui-widget-toolkit/blob/master/v1tov2.md)

# Reference
[API Documentation](https://intel.github.io/ui-widget-toolkit)

[GitHub](https://github.com/intel/ui-widget-toolkit)

[npm](https://www.npmjs.com/package/ui-widget-toolkit)
