
/* Get college and high school data */

jQuery.ui.autocomplete.prototype._resizeMenu = function () {
  var ul = this.menu.element;
  ul.outerWidth(this.element.outerWidth());
}

/* Helper function to focus an input field */
function focusField(elem) {
  window.setTimeout(function()
  {
    elem.focus();
  }, 0);
}

/* Sidebar display for mobile devices */
function displaySidebar() {
  if ($(".sidebar").length > 0)
    return false;

  var buttons = [$("#profile-btn"), $("#devices-btn"), $("#logout-btn")];
  var contents = "<ul class='side sidenav-list'>";
  for (var button of buttons)
    if (button.length > 0)
      contents += "<li class='side sidenav-holder'>" + button.prop('outerHTML') + "</li>";
  contents += "</ul>";
  $("body").append("<div class='side sidebar'>" + contents + "</div>");
  $(".sidebar").find("button").attr("class","gtbtn side");
  $("body").append("<div class='side navcolor'></div>");
  $(".navcolor").css({left: (-document.documentElement.clientWidth) + "px", background: $(".sidebar").css("background"), display: "block", width: document.documentElement.clientWidth + "px"});
  $(".sidebar-mobile-icon-holder").find('path').css('fill','#ffffff');
  $(".navcolor").animate({left: "0px"}, 300);
  $(".sidebar").animate({left: "0px"}, 300, function(){
    $(".sidebar-mobile-icon-holder").unbind('click');
    $(".sidebar-mobile-icon-holder").click(hideSidebar);
  });
}

function hideSidebar() {
  if ($(".sidebar").length == 0)
    return false;
  $(".sidebar-mobile-icon-holder").find('path').css('fill','#ffffff');
  $(".navcolor").animate({left: (-document.documentElement.clientWidth) + "px"}, 300, function() {
    $(".navcolor").remove();
  });
  $(".sidebar").animate({left: "-325px"}, 300, function(){
    $(".sidebar").remove();
    $(".sidebar-mobile-icon-holder").unbind('click');
    $(".sidebar-mobile-icon-holder").click(displaySidebar);
  });
  
}