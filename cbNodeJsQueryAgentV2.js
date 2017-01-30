// This program responds to a call from a browser-based client, accepting data
// to be used in a search of the Couchbase Server beer-sample bucket. The data 
// consists of a beer ID, which is used to retrieve a JSON document featuring 
// information on the brewery.

var http = require('http');
var url = require('url');

http.createServer(function (request, response) 
{
    console.log('New connection');
	
    // Grab the URL and parse it.
    //
    var queryObject = url.parse(request.url, true).query
    
    // Grab the array of IDs.
    //
    var receivedArray = new Array();
    receivedArray = JSON.parse(queryObject.array);
    
    // Grab the number of IDs in the array.
    //
    var myNumberOfIds = parseInt(queryObject.count);

    // Contact Couchbase and open the beer-sample bucket.
    //
    var couchbase = require("couchbase");
    var myCluster = new couchbase.Cluster('couchbase://localhost');
    var myBucket = myCluster.openBucket('beer-sample');
    
    // Array to hold documents returned from Couchbase.
    //
    var couchbaseObjectArray = [];
    
    // Function to be recursively called. Takes the ID array, and
    // the current count, plus highest number to count up to.
    //
    function searchCouchbaseForNextID(arrayOfIDs, count, totalCount)
    {
    	// Search Couchbase for the ID that is in the position indicated
    	// by the current value of the count.
    	//
    	myBucket.get(arrayOfIDs[count], function(err, res)  
    	{
    		// Assign the document returned from the search
    		// to the corresponding slot in the document return array.
    		//
        	couchbaseObjectArray[count] = JSON.stringify(res.value);
        	
        	// If we have not yet covered all the slots in the ID
        	// array...
        	//
        	if (count < totalCount)
        	{
        		// Increment the count, and call this function again
        		// with the revised count.
        		//
        		count++;
        		searchCouchbaseForNextID(receivedArray, count, totalCount);
        	} 
        	else 
        	{
        		// But if we have covered all the slots, return to the client
        		// the fully populated document return array.
        		//
        		response.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
        		console.log("Returning...");
    			response.end(JSON.stringify(couchbaseObjectArray));
    		}
        });
    }
    
    // Search Couchbase for each of the IDs in turn, starting at 0.
    //
    searchCouchbaseForNextID(receivedArray, 0, (myNumberOfIds - 1));  
    
}).listen(8080);

// Notify that the server is running and listening.
//
console.log('Server started');