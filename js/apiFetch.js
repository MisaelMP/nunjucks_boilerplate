var nunjucks = require('nunjucks');


module.exports = $(document).ready(function() {
	if ($('#template').length) {
		$.getJSON('https://jsonplaceholder.typicode.com/todos/1', function(
			results
		) {
			const template = $('#template').html();

			nunjucks.renderString(
				template,
				{
					results: results
				},
				function(err, res) {
					console.log(template);
					$('.list').html(res);
				}
			);
		});
	}
});
