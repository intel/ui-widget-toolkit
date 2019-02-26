
ui-widget-toolkit
===============

The ui-widget-toolkit is a library designed with goal of helping tool developers quickly create useful tools.  The library provides views commonly required for tools like various trace views, line charts, area charts, scatter plots, grid views, flame chart views and connected graph views.

The library helps users focus on pushing data and managing what happens when the user interacts with the views instead of worrying about how to render the data.

The library supports several of the most popular javascript frameworks like AngularJS, Angular, Polymer, Polymer 2, React and Vue.js.  It also uses web workers to try to ensure reasonable UI responsiveness.  It is designed to be extended so users can write different view plugins to extend existing functionality.

# Building the library:

Run the following commands (assuming NPM is installed)

	npm install
	node_modules\.bin\webpack

# Running Examples:

To build most examples run:

	node_modules\.bin\tsc -p examples

All of the non-framework tests will be built and you can access them by opening the html files for the respective examples.

## Vue Framework Example:
To compile and view the vue example run:

	node_modules\.bin\webpack --config example\vue\webpack.config.js

and then open the example\vue\vue.html

## React Framework Example:
To compile and view the vue example run:

	node_modules\.bin\webpack --config example\react\webpack.config.js

and then open the example\react\react.html

## Angular2 Framework Example:
To compile and view the angular2 example run:

	node_modules\.bin\webpack --config example\angular2\webpack.config.js

and then open the example\angular2\angular2Test.html

## Polymer Framework Examples:
To compile and view the polymer example you must run:

	polymer serve

and then connect via whatever port polymer serve output gives you in your browser.  For example you would go to:

	localhost:8081/example/polymer2/polymer2Test.html

if the polymer serve command runs on port 8081.

## Running tests

1. Make sure there is a chromedriver in the spec/drivers folder for your OS and the spec/drivers folder is in your path.  You can download chromedriver from here:

	http://chromedriver.chromium.org/downloads

2. Unzip the spec/data.zip into the spec/data directory.
3. Run

	- npm run build-test
	- npm run test
