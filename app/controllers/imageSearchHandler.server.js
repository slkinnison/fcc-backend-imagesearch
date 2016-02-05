'use strict';

var url = require('url');
var needle = require('needle');
require('querystring');

var historyArray = [];

function ImageSearchHandler () {
    this.searchImage = function (req, res) {
        var returnObj = [];
        var parsedURL = url.parse(req.url, true);
        var path = parsedURL.pathname;
        var input = path.substr( path.lastIndexOf('/') + 1 );

        if ( input === null ) {
            return returnObj;
        }
        
        var searchUrl = 'https://openclipart.org/search/json/?query='+input;
        if(parsedURL.query.hasOwnProperty('offset')) {
            searchUrl = searchUrl + "&page="+parsedURL.query.offset;
        }
        
        if (historyArray.length > 10) {
            historyArray.pop();
        }
        var historyEntry = {"term": input, "when": new Date().toISOString()};
        historyArray.unshift(historyEntry);
        
        needle.get(searchUrl, function(error, response) {
            if (!error && response.statusCode == 200) {
                for (var i = 0; i < response.body.payload.length; i++) {
                    var retEntry = { 
                        "url": response.body.payload[i].svg.png_2400px,
                        "snippet": response.body.payload[i].title,
                        "thumbnail": response.body.payload[i].svg.png_thumb,
                        "context": response.body.payload[i].detail_link
                    };
                    returnObj.push(retEntry);
                }
            }
            res.json(returnObj);
        });
    };

    this.searchHistory = function (req, res) {
        res.json(historyArray);
    };
    
}

module.exports = ImageSearchHandler;
