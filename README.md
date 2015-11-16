# Data Lasso

Data Lasso is a visualization tool that allows exploration of arbitrary set of data. It is built to be agnostic to the structure and formatting of data.


### Imagine this.

You have a set of multi-dimensional data - thousands of entries, each entry having multiple attributes. You might have made a snapshot from your logs, or a slice of your database records, or some other kind of a very rich data.

And you want to get a sense of that data. Explore it, understand it, and get a clear picture of it in your head. You have data in your hands, now all you need is to visualize it. You don't want to spend hours setting up R; You don't want to see OpenOffice spreadsheets take down your CPU trying to build a scatter plot; You just want to see your data.

That is what Data Lasso is for. There is no setup. You don't need to prepare your data. It can visualize half a million entries easily. All of that - in three dimensional space, so you can have complete freedom of looking at your data.


### Usage

It's easy:

- ##### Data input

  Any CSV, TSV or JSON will do. As long as data reminds of a table, you can use it. Rows are entries, columns are attributes of entries.

  Data Lasso will try to silently parse field with name `ip` into ip subnets on file upload. Field named `email` will be parsed to extract domain. Field named `geo` will be broken down onto city and country.

  Once you have your file - just upload it to Data Lasso. Or, just use this [sample data set](https://github.com/tumblr/data-lasso/blob/master/samples/UCS_Satellite_Database.csv).

- ##### 3D space

  There is no configuration necessary. When you upload your data, Data Lasso recognizes attributes in your data. Then you can pick what attribute you want to map to what axis - X, Y, Z or Color.

- ##### Visualize

  Hit 'Go' and that's it. Data is plotted in front of you. Want to select something? Hit spacebar, and you can use polygonal selection tool to select and drill into data.


Finished reading? Head out [here](http://tumblr.github.io/data-lasso/datalasso.html) to use Data Lasso.



### Use Data Lasso on your system

Data Lasso can be be used as a standalone app. Data Lasso runs entirely in a browser, so this repository  contains everything necessary to get started.

Checkout the repository locally, run `npm install` to install necessary dependencies and then run `npm start` to start local server. Data Lasso will be served on your [localhost:3000](http://localhost:3000/).

Why would you do that? Because Data Lasso can be extended:

#### Modules

Modules in Data Lasso allow you to add functionality to Data Lasso. Want to display a custom list of selected entries? Want to plug in Data Lasso in a stream of data? Modules will allow that.

In a nutshell, modules have access to Data Lasso's internal event bus - so you can hook into anything you want.

There is a sample module in the repository for your reference.


#### Use as part of another application

Data Lasso can be used as part of another application, using CommonJS module structure - for example, if you use browserify on your front end stack:

1. Install data lasso as an npm module with `npm install data-lasso --save`
1. Use it in your code with `require('data-lasso');`


### Visualization

Visualization makes use of 3 spatial dimensions and color. Any attribute can be used for plotting in any of the 4 dimensions.

All dimensions are currently plotted on a simple linear scale. There are no ticks on axis with precise values - but you can see exact values for particular graph entries by hovering over them.

Under the hood, Data Lasso is build using wonderful [three.js](http://threejs.org/) library to work with WebGL, uses [d3](http://d3js.org/) for some data parsing niceties, and uses to [browserify](http://browserify.org/) to make development feel one step closer to future.

### Browser Support

Best usage scenario is a desktop browser with a mouse, although trackpad will work too. While Data Lasso does not care what flavor of OS you use, Data Lasso was not tested in browsers other then Chrome and Firefox.

Effectively handling selecting in 3D space without a mouse is hard, so unfortunately usage on mobile devices is out of scope at this point.


### Support

Feel free to open issue on github if you encounter a bug. If you want to get more details on the roadmap of the product, or potentially use it in your stack and need help - contact the [author](https://github.com/tgilan);

### License

Copyright 2015 Tumblr Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
