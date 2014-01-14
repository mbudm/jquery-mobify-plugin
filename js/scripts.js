$(function() {

	if(jQuery().mobify){
		$(".mobify").mobify({
			accordionMode:true,
			enable_width: 320,
			trigger_element: "hgroup h6, h2" /* must exist otherwise plugin will abort. If unsure use optional syntax, e.g: 'el, .className, :pseudo' */
		});
		
		/* pass any of the defaults as options:
		
		trigger_element: ":first",
		enable_width: 480, /* make false to avoid resource hungry binding to resize - will just mobify all matched elements
		isEnabled: false,
		isOpen: true,
		accordionMode: false,
		animateClosables: false, /* you can use of slide anim but it will be slow if there are lots of nested elements. I prefer snappy show/hide
		summaryCls:'mobify-summary'
		
		*/
	}
});