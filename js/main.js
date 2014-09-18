$(document).ready(function(){
	// Bind the touch handler
	$('#slider')
	.bind('touchstart', startSlideNav)
	.bind('touchmove', slideNavMove)
	.bind('touchend', stopSlideNav)
	
	// Resize using actual values, not %
	resizeAll();
	$(window).on('resize', resizeAll);
});

function startSlideNav(e) {
	e.preventDefault();
	
	var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
	
	if (window.touchEnabled === false) {
		$(document).bind('mousemove', slideNavMove);
	}
	
	$(this)
	.data('firstTouch', touch)
	.data('startPos', $(this).css('left').substring(0, $(this).css('left').length - 2))
	.css({
		transform: 'translate3d('+ $(this).css('left') +', 0, 0)',
		left: 0
	});
	raiseSlideNav();
}

function raiseSlideNav() {
	$('#slide-nav').addClass('up');
}

function slideNavMove(e) {
	e.preventDefault();
	
	var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
	
	var $this = $(this);
	
	$this
	.data('lastTouch', touch.pageX)
	.css('transform', 'translate3d('+ (touch.pageX - ($this.data('firstTouch').pageX - $this.data('startPos'))) +'px,0,0)');
	
	// Check if over nav
	var $nearest = isOverNav();
	if ($nearest && !$nearest.hasClass('active')) {
		// Switch to the active nav
		$('.slide-nav').removeClass('active');
		$nearest.addClass('active');
		changeView($($nearest.data('view')));
	}
}

function stopSlideNav(e) {
	// Snap circle to nearest menu item
	var nearestX = isOverNav().position().left;
	var $slider = $('#slider');
	
	$slider
	.data('endPos', nearestX)
	.css('top', 100)
	.animate({
		top: 0
	}, {
		duration: 150,
		step: function(now, tween) {
			$slider.css('transform', 'translate3d('+
				(
					$slider.data('endPos')
					+
					(
						(
							$slider.data('lastTouch')
							-
							($slider.data('firstTouch').pageX - $slider.data('startPos'))
						)
						-
						$slider.data('endPos')
					)
					*
					now/100
				)
			+'px,0,0)');
			
		},
		complete: function() {
			// After animating, set actual left value and lower the nav
			$slider.css({
				'transform': 'translate3d(0,0,0)',
				'left': $slider.data('endPos'),
				'top': 'auto'
			});
			
			setTimeout(lowerSlideNav, 350);
		}
	});
}

function lowerSlideNav() {
	$('#slide-nav').removeClass('up');
}

function isOverNav() {
	// return nearest nav based on slider pos
	var $lastX = $('#slider').data('lastTouch');
	var nearest = false;
	$('.slide-nav').each(function(){
		var $this = $(this);
		if ($lastX > $this.position().left && $lastX < $this.position().left + $this.width()) {
			nearest = $this;
			return;
		}
	});
	
	return nearest;
}

function changeView($nextView) {
	var $currentView = $('.view.active');
	var currentIndex = $('.view').index($currentView);
	var nextIndex = $('.view').index($nextView);
	
	if (currentIndex > nextIndex) {
		// Moving screens from right to left
		$currentView.css({
			left: '100%',
			transform: 'rotateY(-45deg) translateZ('+ ($currentView.width() * (75/200)) +'px) translateX('+ ($currentView.width() * (34/200)) +'px)'
		});
		$nextView.css({
			left: 0,
			transform: 'rotateY(0deg)'
		});
	} else {
		// Moving screens from left to right
		$currentView.css({
			left: '-100%',
			transform: 'rotateY(45deg) translateZ('+ ($currentView.width() * (-75/200)) +'px) translateX('+ ($currentView.width() * (-34/200)) +'px)'
		});
		$nextView.css({
			left: 0,
			transform: 'rotateY(0deg) translateZ(0px) translateX(0px)'
		});
	}
	$currentView.removeClass('active');
	$nextView.addClass('active');
	
	// Change the icon on the circle
	$('#slider-circle').css('background-position', nextIndex*-50 + 'px 0');
}

function resizeAll() {
	$('#slide-nav').css('width', $(window).width());
	
	$('#slider').css({
		'width': $(window).width()/$('.slide-nav').length,
		'left': $('.slide-nav.active').position().left
	});
	
	$('.slide-nav').each(function(){
		$(this).css({
			'width': $(window).width()/$('.slide-nav').length,
			'left': $('.slide-nav').index(this) * $(window).width()/$('.slide-nav').length
		})
	});
}