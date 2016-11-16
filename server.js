var unirest = require('unirest');
var express = require('express');
var events = require('events');

var app = express();
app.use(express.static('public'));

var getFromApi = function(endpoint, args){
	var emitter = new events.EventEmitter();
	unirest.get('https://api.spotify.com/v1/' + endpoint)
	.qs(args)
	.end(function(response){
		if(response.ok){
			emitter.emit('end', response.body);
		}
		else {
			emitter.emit('error', response.code);
		}
	});
	return emitter;
}

app.get('/search/:name', function(req, res){
	var searchReq = getFromApi('search', {
		q: req.params.name,
		limit: 1,
		type: 'artist'
	});

	searchReq.on('end', function(item){
		var artist = item.artists.items[0];
		var id = artist.id;
		var relatedArtist = getFromApi('artists/' + id + '/related-artists');
		// res.json(relatedArtist);
		relatedArtist.on('end', function(thing){
			console.log(thing);
			artist.related = thing.artists
			res.json(artist);
		})
		relatedArtist.on('error', function(code){
			res.sendStatus(code);
		})
	});

	searchReq.on('error', function(code){
		res.sendStatus(code);
	});
});

// app.get('artists/id/related-artists', function(req,res){   // is this right?
// 	var searchReq = getFromApi('search', {
// 		q: req.params.id,
// 		limit: 1,
// 		type: 'id'
// 	});

// 	searchReq.on('end', function(item){
// 		artist.related = item.artists;
// 		res.json(artist.related);
// 	});

// 	searchReq.on('error', function(code){
// 		res.sendstatus(code);
// 	});
// });

app.listen(process.env.PORT || 8080);