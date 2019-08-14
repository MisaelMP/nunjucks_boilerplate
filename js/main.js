// main.js
// import "bulma/css/bulma.css";

$(document).ready(function() {

	// Check for click events on the navbar burger icon
	$(".navbar-burger").click(function() {

			// Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
			$(".navbar-burger").toggleClass("is-active");
			$(".navbar-menu").toggleClass("is-active");
	});
});

// $.getJSON('https://jsonplaceholder.typicode.com/todos/1', function (results) {
//         nunjucks.render('pages/blog.njk', { results : results }, function (err, res) {
//       		$('.list').html(res);
//
//         });
//     });
