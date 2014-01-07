/* 
   Mobify for jQuery v1.0.1.
   Written by Steve Roberts using a design pattern from Keith Wood (kwood{at}iinet.com.au) http://keith-wood.name/maxlength.html May 2009.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

var PROP_NAME = 'mobify';

/* mobify manager. */
function Mobify() {
	this._defaults = {
		trigger_element: ":first",
		enable_width: 480,
		isEnabled: false,
		isOpen: true,
		accordionMode: false,
		summaryCls:'.mobify-summary'
	};
	
	this._instances = [];
}

$.extend(Mobify.prototype, {
	/* Class name added to elements to indicate already configured with mobify. */
	markerClassName: 'hasMobify',
	isOpenClass: 'mobifyIsOpen',
	isClosedClass: 'mobifyIsClosed',
	triggerClassName: 'mobifyTrigger',
	summaryClassName: 'mobifyPreview',
	closableClassName: 'mobifyClosable',
	
	
	/* Override the default settings for all mobify instances.
	   @param  settings  (object) the new settings to use as defaults
	   @return  (MaxLength) this object */
	setDefaults: function(settings) {
		$.extend(this._defaults, settings || {});
		return this;
	},

	/* Attach the mobify functionality to an element.
	   @param  target    (element) the control to affect
	   @param  settings  (object) the custom options for this instance */
	_attachMobify: function(target, settings) {
		target = $(target);
		if (target.hasClass(this.markerClassName)) {
			return;
		}
		target.addClass(this.markerClassName);
		
		//merge the passed settings with the defaults and store in $.data	
		var inst = {settings: $.extend({}, this._defaults)};
		$.data(target[0], PROP_NAME, inst);
		
	
		this._instances.push(target);
	
		this._changeMobify(target, settings);
	},

	/* Reconfigure the settings for a mobify control.
	   @param  target    (element) the control to affect
	   @param  settings  (object) the new options for this instance or
	                     (string) an individual property name
	   @param  value     (any) the individual property value (omit if settings is an object) */
	_changeMobify: function(target, settings, value) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		settings = settings || {};
		if (typeof settings == 'string') {
			var name = settings;
			settings = {};
			settings[name] = value;
		}
		var inst = $.data(target[0], PROP_NAME);
		$.extend(inst.settings, settings);
		
		/* bind to resize event */
		$(window).bind('resize.mobify' ,{t: target},function(event) {
		 	$.mobify._enableMobify(event.data.t);
		 });
		
		/* store the trigger element */
		inst.settings.trigElt = target.find(inst.settings.trigger_element);
		
		inst.settings.closables = inst.settings.trigElt.siblings();
		
		if(!inst.settings.trigElt.parent().is(target)){
			/* the trigger element is nested so: 
			   - identify the trigger element ancestors up until the mobify element
			   - add the siblings of all these to the closables set of elements
			*/
			inst.settings.trigElt.parentsUntil(target).each(function(i,el){
				inst.settings.closables = inst.settings.closables.add($(this).siblings());
			});
		}

		/* create the summary preview element - populating it with comma delimited strings from this.summaryCls elements */
		var sumStr = '';
		target.find(inst.settings.summaryCls).each(function(el){
			var prefix = sumStr.length === 0 ? '' : ', ' ;
			sumStr += prefix + $(this).html()
		});
		inst.settings.sumElt = $('<span class="'+ this.summaryClassName+ '">'+sumStr+'</span>');
		inst.settings.trigElt.append(inst.settings.sumElt);
		//inst.settings.sumElt.addClass(this.summaryClassName)
		
		/* store a ref to the target in the trigElt data object */
		var trigInst = {mobifyTarget: target};
		$.data(inst.settings.trigElt[0], PROP_NAME, trigInst);
		
		if(!inst.settings.trigElt.hasClass(this.triggerClassName)){
			inst.settings.trigElt.addClass(this.triggerClassName);
		}
		
		/* apply bind to trigger element */
		inst.settings.trigElt.bind('click.mobify',{t: target},function(event) { 
				$.mobify._updateMobify(event.data.t);
				//$(this).siblings().slideToggle(); 
		});
		$.mobify._enableMobify(target);
	},
	/* bound to the resize event - each instance does an enable check
	   @param  target  (element) the control to check */
	_enableMobify: function(target) {
		target = $(target);
		var inst = $.data(target[0], PROP_NAME);
		var enableCheck = $(window).width() <= inst.settings.enable_width ? true : false ;
		if(enableCheck !== inst.settings.isEnabled){
			inst.settings.isEnabled = enableCheck;
			$.mobify._updateMobify(target);
		}else{
			
		}
	},
	
	/* slidetoggle wrapper function 
	   @param  target  (element) the control to check
	   @param  showOrhide  (Boolean) control the hide/show state  */
	_updateMobify: function(target,showOrhide) {
		target = $(target);
		var inst = $.data(target[0], PROP_NAME);
		
		/* opening or closing ? */
		if(inst.settings.isEnabled){
			if(showOrhide === undefined){ 
				inst.settings.isOpen = !inst.settings.isOpen
			}else{
				inst.settings.isOpen = showOrhide;
			}
		}else{
			//show 
			inst.settings.isOpen = true;
		}
			
		/* do open/close and set class */
		if(inst.settings.isOpen){
			inst.settings.closables.slideDown('fast'); 
			if (!target.hasClass(this.isOpenClass)) {
				target.addClass(this.isOpenClass);
			}
			if (target.hasClass(this.isClosedClass)){
				target.removeClass(this.isClosedClass);	
			}
			if(inst.settings.accordionMode){
				//close everything but this one
				$.mobify._accordionMobify(target);
			}
		}else{
			inst.settings.closables.slideUp('fast'); 
			if (target.hasClass(this.isOpenClass)){
				target.removeClass(this.isOpenClass);	
			}
			if (!target.hasClass(this.isClosedClass)) {
				target.addClass(this.isClosedClass);
			}
		}
	},
	/* Close all instances except for target.
	   @param  target  (element) the control to affect */
	_accordionMobify: function(target) {
		target = $(target);
		for(var inst in this._instances){
			if(this._instances[inst][0] != target[0]){
				$.mobify._updateMobify(this._instances[inst],false);
			}
		}
	},
	/* Remove the mobify functionality from a control.
	   @param  target  (element) the control to affect */
	_destroyMobify: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).
			unbind('.mobify');
		$.removeData(target[0], PROP_NAME);
	},

	/* Retrieve the current instance settings.
	   @param  target  (element) the control to check
	   @return  (object) the current instance settings */
	_settingsMobify: function(target) {
		var inst = $.data(target, PROP_NAME);
		return inst.settings;
	}
});

// The list of commands that return values and don't permit chaining
var getters = ['settings'];

/* Attach the mobify functionality to a jQuery selection.
   @param  command  (string) the command to run (optional, default 'attach')
   @param  options  (object) the new settings to use for these instances (optional)
   @return  (jQuery) for chaining further calls */
$.fn.mobify = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if ($.inArray(options, getters) > -1) {
		return $.mobify['_' + options + 'Mobify'].
			apply($.mobify, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			$.mobify['_' + options + 'Mobify'].
				apply($.mobify, [this].concat(otherArgs));
		}
		else {
			$.mobify._attachMobify(this, options || {});
		}
	});
};

/* Initialise the mobify functionality. */
$.mobify = new Mobify(); // singleton instance

})(jQuery);
