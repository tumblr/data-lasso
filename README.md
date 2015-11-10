#Data Lasso

Data Lasso is a visualization tool that allows exploration of arbitrary set of data. It is built to be agnostic to the structure and formatting of data.

**Note**
Data Lasso is on track to be open sourced, so it tries to minimize amount of things it uses that are Tumblr-specific, such as base view and various other helpers.

## Usage

_To be added_

## Data formatting

Any CSV, TSV or JSON will do. Data Lasso will try to silently parse field with name `ip` into ip subnets on file upload. Field named `email` will be parsed to extract domain. Field named `geo` will be broken down onto city and country.

## Visualization

Visualization makes use of 3 spatial spatial dimensions and color. Any attribute associated with a data entry can be used for plotting in any of the 4 dimensions.

## Support

_To be added_
