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

    listingDetailFeatures.each(function(index, li){
      var $li = $(li);
      if(typeof $li.attr('data-original-title') !== 'undefined'){
        detailString += $li.attr('data-original-title') + ', ';
      }      
    }); 
    detailString += '\n';     
  }

  //add agent details
  var agentInfo = '';
  var agentDetails = $listingDetail.find('.agentContent');

  var agentName = agentDetails.find('h3');
  agentName.find('span').remove();

  if($.trim(agentName[0].innerHTML) !== ''){
    agentInfo += 'Agent: ' + $.trim(agentName[0].innerHTML);
  }

  var agentContact = agentDetails.find('dd a');
  if(agentContact.length){
    agentContact.each(function(index, a){
      if(a.href !== ''){
        agentInfo += ', ' + a.href;
      }
    });
  }

  if(agentInfo !== ''){
    detailString += agentInfo +'\n';
  }

  //add url 
  detailString += url + '\n';
  //pass all details to the popup
  callback(detailString);

  //var successful = document.execCommand('copy');
}

function getBayleysListingDetails(url, html, callback){
  var detailString = '';

  var $srcHtml = $(html);

  //check if there is a listing on this page
  var $listingDetail = $srcHtml.find('#listing');

  if(!$listingDetail.length)
  {
    callback('No listing found on this Bayleys page!');
    return;
  }

  //add price
  var displayPrice = $listingDetail.find('div[itemtype="http://schema.org/Offer"]').find('.no-case');

  if(displayPrice.length){
    detailString += displayPrice[0].innerHTML + '\n';
  }
  //add address
  var address = $listingDetail.find('span[itemprop="streetAddress"]');
  if($.trim(address[0].innerHTML) !== ''){
    detailString += $.trim(address[0].innerHTML) + '\n';
  }

  //add place details
  var listingDetailFeatures = $listingDetail.find('.feature-list-listing li p');
  if(listingDetailFeatures.length){
    listingDetailFeatures.each(function(index, p){
      var txt = $.trim($(p)[0].innerHTML);
      if(txt !== ''){
        detailString += txt + ', '
      }
    });
    detailString += '\n';
  }

  //add agent details
  var agentInfo = '';

  var agentDetails = $listingDetail.find('#agents .profile-info');

  if(agentDetails.length){

    agentDetails.each(function(index, div){
      var perAgent = $(div);

      //get name
      var agentName = perAgent.find('h2[itemprop="name"]');

      if(agentName.length){
        agentName.each(function(index, h2){
          var txt = $.trim($(h2)[0].innerHTML);
          if(txt !== ''){
            agentInfo += txt + ', ';
          }
        });
        agentInfo += '\n';
      }
      
      //get contact
      var agentContact = perAgent.find('span[itemprop="telephone"]');
      if(agentContact.length){
        agentContact.each(function(index, span){
          var txt = $.trim($(span)[0].innerHTML);
          if(txt !== ''){
            agentInfo += txt + ', ';
          }
        });
        agentInfo += '\n';      
      }
    });
    
    detailString += agentInfo;
  }
  //add url
  detailString += url;

  callback(detailString);
}

function getHouseDeets(url, html, callback){

  var detailString = 'Nothing found!'; 

  //TODO: add logic for different real estate sites
  //Below logic only works on harcourts site as of now
  if(url.indexOf('harcourts') !== -1){
    getHarcourtsListingDetails(url, html, callback);
  }
  else if(url.indexOf('bayleys' !== -1)){
    getBayleysListingDetails(url, html, callback);
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
  if (request.action === "getSource") {
    //run our function below
    getHouseDeets(request.url,request.source,renderStatus);
  }
  else{
    renderStatus('Something went wrong!');
  }
});

//hookup to the window onload event
window.onload = onWindowLoad;