//Source: How to get the dom contents of a page for manipulation
//https://stackoverflow.com/questions/11684454/getting-the-source-html-of-the-current-page-from-chrome-extension

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function getHarcourtsListingDetails(url, html, callback){
  var detailString = '';

  var $srcHtml = $(html);

  //check if this is a listing page
  var $listingDetail = $srcHtml.find('#listingDetail');

  if(!$listingDetail.length)
  {
    callback('No listing found on this Harcourts page!');
    return;
  }

  //add url 
  detailString = url + '\n';

  //add price
  var listingDisplayPrice = $listingDetail.find('#listingViewDisplayPrice');
  listingDisplayPrice.find('span').remove();

  var displayPrice = $.trim(listingDisplayPrice[0].innerHTML);
  if(displayPrice !== ''){
    detailString += displayPrice + '\n';
  }

  //add place details
  var listingDetailFeatures = $listingDetail.find('#detailFeatures li');

  if(listingDetailFeatures.length){
    //cycle through the features found on the page
    listingDetailFeatures.each(function(index, li){
      //console.log('detail features li: ' + li);
      detailString += $(li).attr('data-original-title') + '\n';
    });      
  }

  //add agent details
  var agentInfo = '';
  var agentDetails = $listingDetail.find('.agentContent');

  var agentName = agentDetails.find('h3');
  agentName.find('span').remove();

  if($.trim(agentName[0].innerHTML) != ''){
    agentInfo += 'Agent: ' + $.trim(agentName[0].innerHTML);
  }

  var agentContact = agentDetails.find('dd a');
  agentContact.each(function(index, a){
    agentInfo += ', ' + a.href;
  })

  if(agentInfo != ''){
    detailString += agentInfo +'\n';
  }


  callback(detailString);

  //var successful = document.execCommand('copy');
}

function getHouseDeets(url, html, callback){

  var detailString = 'Nothing found!'; 

  //TODO: add logic for different real estate sites
  //Below logic only works on harcourts site as of now
  if(url.indexOf('harcourts') != -1){
    getHarcourtsListingDetails(url, html, callback);
  }
  else{
    console.log('error!');
    callback(detailString);
  }
}

function onWindowLoad() {

  chrome.tabs.executeScript(null, {
    file: "getPageSource.js"
  }, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      renderStatus('There was an error injecting script : \n' + chrome.runtime.lastError.message);
    }
  });

}

//add a listener to chrome
chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {
    //run our function below
    getHouseDeets(request.url,request.source,renderStatus);
  }
  else{
    renderStatus('Something went wrong!');
  }
});

//hookup to the window onload event
window.onload = onWindowLoad;