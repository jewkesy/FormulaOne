# .: FormulaOneStats :.

AngularJS Web Application that shows statistical information for Formula 1 fans

Live version is here: - http://jewkesy.github.io/FormulaOne/

The stats come from http://ergast.com/mrd/ as the intial data source.  

Additional information and pictures are extracted from Wikipedia where possible.

## Technologies Used
[AngularJS with UI Router](https://angularjs.org/) is the primary technology used.  [Bootstrap and Bootstrap UI](http://getbootstrap.com/) is used for styling the application to work on multiple devices.

[Jquery](https://jquery.com/) has come along for the ride.

[NodeJS](https://nodejs.org/) was employed to handle the hosting, but this was moved over to gh-pages for ease.

Ergast can be hit hard for certain queries (constructor tables, for example) and they have requested that developers are mindful of this.  For the [GitHub-hosted version](http://jewkesy.github.io/FormulaOne/), I've cached the data in json files ([./db/cache](https://github.com/jewkesy/FormulaOne/tree/master/db/cache)) for convienence.  [./utils.js](https://github.com/jewkesy/FormulaOne/blob/master/utils.js) is a NodeJS application to download imagery from Wikipedia (or any source you prefer) and to create json files of data queries.

MongoDB can used to store cached versions of data.  I've hosted my queries on MongoLab.  [config.json](https://github.com/jewkesy/FormulaOne/blob/master/config.json) contains typical setting examples should you wish to head that direction.

## Misc.

I've used flags that are hosted on another project, [Colloquail](https://github.com/jewkesy/colloquial).  This project is a dumping ground for reusable content that I use in several other projects.  Feel free to use it or grab your own copies.

## Screenshots

![Screenshot](https://github.com/jewkesy/jewkesy.github.io/blob/master/images/f1_5.png?raw=ture)]