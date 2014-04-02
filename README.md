Band Ratio Client
=================

A web based drag-drop client for producing complex band algorithm for use with the WCPS standard interface

Super Basic Launching
===================

 * clone repo
 * type `python -m SimpleHTTPServer` (should work on any os where Python is installed)
 * open a browser and navigate to http://localhost:8000/

Configuration
=============

When instatiating the BandRatioClient object you can pass in a configuration object.  The currently available options are :-

```js
   {
      petascopeURL_GET      : "This is the url used for making GET requests to petascope",
      petascopeURL_POST     : "This is the url used for making POST requests to petascope",
      drop_panel            : "The ID of the HTML element to be used as the main dropping panel",
      wcps_response_element : "The ID of the HTML element to be used to display teh image returned by the generated WCPS query",
      drop_text_element     : "The ID of the HTML element to be used for displaying help text in the drop panel",
      run_query_element     : "The ID of the HTML element (normally a button) that when clicked will run the generated WCPS query",
      show_query_element    : "The ID of the HTML element (normally a button) that when clicked will show the generated WCPS query",
      min_query             : "The template WCPS query for obtaining the minimum value for use in the WCPS query",
      max_query             : "The template WCPS query for obtaining the maximum value for use in the WCPS query",
      avg_query             : "The template WCPS query for obtaining the average value for use in the WCPS query",
      allowed_freqs         : "An array of string values representing the allowed bandwidths/freqencies, i.e. ['412','555','670']"
   }
```
