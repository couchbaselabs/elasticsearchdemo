// This program receives data from a connection with a browser-based client. The
// data consists of a string that is a beer-style. The program performs a search
// on the beer-sample index within an instance of Elasticsearch, and returns to
// the browser-based client a list of documents, each of which contains a beer
// ID for a beer that corresponds to the beer-style.

var http = require('http');
var url = require('url');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace'
});

http.createServer(function (request, response) 
{
	console.log('New connection');
	
	// Retrieve value to search on. 
	//
	var hits;
	var queryObject = url.parse(request.url, true).query
	console.log(queryObject);
	
	// The key for the ID-value is "foo".
	//
	var luceneString = queryObject.foo;
	console.log(luceneString);
	
	// Create the Elasticsearch query-string.
	//
	var clientSearchStringStart = "{index: 'beer-sample', body: { query: { query_string: { query: ";
	var clientSearchStringEnd = "}}}}"
	var clientSearchStringFull = clientSearchStringStart + "\"" + luceneString + "\"" + clientSearchStringEnd;
	var extendedLuceneString = "\"" + luceneString + "\"";
	
	console.log("Extended lucene string is: " + extendedLuceneString);
	
	// Perform the search, on the beer-sample index.
	//
	client.search({
		index:'beer-sample',
		body: {
			query: {
				query_string: {
					query: luceneString
				}
			}
		}
	}).then(function(resp){
		hits = resp.hits.hits;
		console.log("Hits are: " + JSON.stringify(hits));
		
	// Contact the client, and return data.
	//
    response.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
    response.end(JSON.stringify(hits));
   
	}, function(err){
		console.trace(err.message);
	});
	
 
}).listen(8081);

console.log('Server started');