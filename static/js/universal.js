/* Helper function to focus an input field */
function focusField(elem) {
  window.setTimeout(function () {
    elem.focus();
  }, 0);
}

/* Sidebar display for mobile devices */
function displaySidebar() {
  if ($(".sidebar").length > 0)
    return false;
  else {
    $(".icon").addClass("close");
    var buttons = [$("#dash-btn"), $("#profile-btn"), $("#devices-btn"), $("#barcode-btn"), $("#logout-btn")];
    var contents = "<ul class='side sidenav-list'>";
    for (var button of buttons)
      if (button.length > 0)
        contents += "<li class='side sidenav-holder'>" + button.prop('outerHTML') + "</li>";
    contents += "</ul>";
    $("body").append("<div class='side sidebar'>" + contents + "</div>");
    $(".sidebar").find("button").attr("class", "navbtn side");
    $(".sidebar").animate({ left: "0px" }, 300,
      function () {
        $(".sidebar-mobile-icon-holder").unbind('click');
        $(".sidebar-mobile-icon-holder").click(hideSidebar);
      });
  }
}

function hideSidebar() {
  if ($(".sidebar").length == 0)
    return false;
  else {
    $(".icon").removeClass("close");
    $(".sidebar").animate({ left: "-325px" }, 300,
      function () {
        $(".sidebar").remove();
        $(".sidebar-mobile-icon-holder").unbind('click');
        $(".sidebar-mobile-icon-holder").click(displaySidebar);
      });
  }
}