$(document).ready(function(){
  attachClickListeners();
});

// Attaches popup event listener when device result is clicked
function attachClickListeners() {
  $(".result-holder").click(function(e){
    $(".devid").text($(this)[0].id);
    $("#myModal").find(".product").text($(this).find(".product").attr('value'));
    $("#myModal").find(".serialNo").text($(this).find(".serialNo").attr('value'));
    $("#myModal").find(".modelNo").text($(this).find(".modelNo").attr('value'));
    $("#myModal").fadeIn(400);
  });
}

// Update list of devices to devices listed in entries
// Callback function attaches click -> popup event listeners
// Once all device <li> elements are created
function updateEntries(entries, callback=attachClickListeners) {
  const statusColor = {"Connected": "#dcffd7", "RKI In Progress": "#fff1c9", "Offline": "#ffc9c9"};
  $(".results-list").empty();
  for (let i = 0; i < entries.length; ++i) {
    $(".results-list").append('<li class="result-holder" id="' + entries[i].deviceID + '" style="background:' + statusColor[entries[i].lastStatus] + '">' +
      '<span class="result-subtext status">' + entries[i].lastStatus + '</span>' +
      '<span class="result-name">' + entries[i].deviceID + '</span><br>' +
      '<span class="result-subtext">Last Update ' + new Date(entries[i].lastHeartbeat).toDateString() + '</span>' +
      '<div style="display:none" class="serialNo" value="' + entries[i].serialNo + '"></div>' + 
      '<div style="display:none" class="modelNo" value="' + entries[i].modelNo + '"></div>' + 
      '<div style="display:none" class="product" value="' + entries[i].product + '"></div>' + 
      '<div style="display:none" class="lastStatus" value="' + entries[i].lastStatus + '"></div>' + 
      '<div style="display:none" class="lastHeartbeat" value="' + entries[i].lastHeartbeat + '"></div>' + 
      '</li>');
  }
  callback();
}

// Fetch devices via AJAX call and url params
function fetchDevices()
{
  const params = {  query: $("#query")[0].value,
                    sortby: $("#sortby")[0].value,
                    lastStatus: $("#laststatus")[0].value,
                    from: $("#from")[0].value,
                    to: $("#to")[0].value
                  }
  $.get('/d',
        params,
        function(data, textStatus, xhr) {
          updateEntries(data.data);

          // Add URL params to ensure that results will remain if refresh occurs
          window.history.pushState("", "", '/devices?' + $.param(params));
        });
}

// Automatically change sorting method when sort dropdown is changed
$("#sortby").change(function(event) {
  fetchDevices();
});

// Open filters popup when button is clicked
$("#addfilter").click(function(event) {
  $("#filters").fadeIn('400');
  return false;
});

// Close filters popup when button is clicked
$("#closefilters").click(function(event) {
  $("#filters").fadeOut('400');
  return false;
});

// Automatically search when input is changed in search bar
$("#query").on("input", function(e) {
  // Check if input is different than last value (input has changed)
  if ($(this).data("lastval") != $(this).val()) {
    $(this).data("lastval", val);
    fetchDevices();
  }
});

// Apply selected filters when button is clicked
$("#applyfilters").click(function(event) {
  $("#filters").fadeOut('400');
  fetchDevices();
});

// Close device details popup when button is clicked
$("#close-modal").click(function (event) {
  $("#myModal").fadeOut(400);
});