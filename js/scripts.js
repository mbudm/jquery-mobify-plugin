$(function() {

	if(jQuery().mobify){
		$(".mobify").mobify({
			accordionMode:true,
			enable_width: 320,
			trigger_element: "hgroup h2"
		});
		
		/* pass any of the defaults as options:
		
		trigger_element: ":first",
		enable_width: 480,
		isEnabled: false,
		isOpen: true,
		accordionMode: false,
		summaryCls:'mobify-summary'
		
		*/
	}
});