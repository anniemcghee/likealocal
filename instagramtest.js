var Instagram = require('instagram-node-lib');

Instagram.set('client_id', process.env.client_id);
Instagram.set('client_secret', process.env.client_secret);

var gotTags = function(data) {
	var links = data.map(function(element,index){
		return element.images.standard_resolution.url;
	})
	console.log (links);
}

Instagram.tags.recent({
	name: 'magnoliaseattle',
	complete: gotTags
});
