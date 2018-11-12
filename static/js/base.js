console.log('base.js found')
$(document).ready(function() {
  console.log('base.js document ready')

  /* Resize elements based on viewport size */
  $(window).resize(function() {
    if ($(".navcolor").length > 0)
      $(".navcolor").width(document.documentElement.clientWidth)
    if (document.documentElement.clientWidth <= 975) {
      if ($(".sidebar").length > 0)
        hideSidebar();
    }
  });

  /* Event handler for showing sidebar */
  $(".sidebar-mobile-icon-holder").click(displaySidebar);

  /* Hide sidebar when user clicks away */
  $("body").click(function(e){
    if (!$(e.target).hasClass('side'))
      hideSidebar();
  });
  $(".navbar, .navbar-list, .side, .gtbtn, div.side.sidebar").click(function(e){e.stopPropagation();});

  $(window).on('load', function() {
    console.log('base.js window loaded');
  });
});