(function(){

   $(document).ready(function(){
    	
    	checkIEAjax();
    	getFeedbackHtml("~!@#feedbackdivid#@!~","~!@#servername#@!~");
    	
    	$('#~!@#feedbackdivid#@!~').on('click','#rax-feedback-helpful-btn',function(event){
    		handleYesEvent(event);
    	});
    	
    	$('#~!@#feedbackdivid#@!~').on('click','#rax-feedback-nothelpful-btn',function(event){
    		handleNoEvent(event);
    	});
    	
    	$('#~!@#feedbackdivid#@!~').on('click','#rax-feedback-no-thanks',function(event){
    		handleNoThankYou(event);
    	});
    	 
    	$('#~!@#feedbackdivid#@!~').on('click','#rax-feedback-send',function(event){
    		handleSendFeedback(event);
    	});   	
    });
    
    Date.prototype.yyyymmdd = function() {
    	   var yyyy = this.getFullYear().toString();
    	   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    	   var dd  = this.getDate().toString();
    	   return yyyy + "-"+(mm[1]?mm:"0"+mm[0]) +"-"+ (dd[1]?dd:"0"+dd[0]); // padding
    };
    
    function handleSendFeedback(event){
    	$('#rax-bad-feedback').hide();
    	$('#rax-was-helpful').hide();   	
    	$('#rax-thankyou').show();
    	event.preventDefault();
    	var pageurl=window.location.href; 
    	var error=$('#rax-feedback-error').is(':checked');
    	var moreinfo=$('#rax-feedback-needs-more-info').is(':checked');
    	var email=$('#rax-edit-email-address').val();
    	if(null===email){
    		email='';
    	} 
    	if(email.length>200){
    		email=email.substring(0,200);
    	}
    	var comment=$('#edit-reason-comment').val();
    	if(null==comment){
    		comment='';
    	}
    	if(comment.length>1200){
    		comment=comment.substring(0, 1200);
    	}
    	var today=new Date();
    	var theDate=today.yyyymmdd();
    	var sendData={"pageurl": pageurl,"error":error,"moreinfo":moreinfo,"email":email,"comment":comment,"date":theDate};
    	var jsonSendDataStr=JSON.stringify(sendData);
    	var url=("http://content-services.rackspace.com/rax-feedback-backend/recordFeedback?pageurl="+pageurl+"&error="+
    			 error+"&moreinfo="+moreinfo+"&email="+email+"&comment="+comment+"&date="+theDate);   	
    	ajaxPostCall(url,jsonSendDataStr);  
    }
    
    function handleNoThankYou(event){
		$('#rax-bad-feedback').hide();
		$('#rax-was-helpful').hide();   	
    	$('#rax-thankyou').show();
    	event.preventDefault();    	   	    
    }
    
    function handleYesEvent(event){
		$('#rax-bad-feedback').hide();
		$('#rax-was-helpful').hide();   	
    	$('#rax-thankyou').show();
    	event.preventDefault();
    	var pageurl=window.location.href; 
    	handleYesOrNo(pageurl,"true");
    }
    
    function handleYesOrNo(pageurl, isyes){
        var sendData={"pageurl":pageurl,"isyes":isyes};
        var url=("http://content-services.rackspace.com/rax-feedback-backend/saveOrUpdatePage?pageurl="+pageurl+"&isyes="+isyes);        
        var jsonSendDataStr=JSON.stringify(sendData);
        ajaxPostCall(url,jsonSendDataStr);
    }
    
    function  ajaxPostCall(url, dataStr){
    	$.support.cors = true;
        $.post(url,dataStr,function(data){
            var theData=data;
        })
        .fail(function(data){
            var theData=data;
        });
    }
    
    function handleNoEvent(event){
		$('#rax-bad-feedback').show();
		$('#rax-was-helpful').hide();
		event.preventDefault();
    	var pageurl=window.location.href; 
    	handleYesOrNo(pageurl,"false");
    }
    
    function handleNoThanks(event){
		$('#rax-bad-feedback').hide();
		$('#rax-was-helpful').show();
		event.preventDefault();
    }
    
    function getFeedbackHtml(feedbackdivId, serveName){
    	var theServer=serveName;
    	if(null===serveName || serveName===undefined){
    		theServer="content-services.rackspace.com";
    		//theServer="192.237.212.38";
    	}
    	var url=("http://"+theServer+"/rax-feedback-services/rest/service/getFeedbackHtml");
        $.support.cors = true; 
        $.getJSON(url,{})
        .done(function(data){
            $("#"+feedbackdivId).html(data.html);           	
        })
        .fail(function(jqxhr, textStatus, error){
        	var failure="true";
        	failure+="asdf";
        });	    	
    }
    
    
    function checkIEAjax(){

    	if (!$.support.cors && $.ajaxTransport && window.XDomainRequest) {
    	  var httpRegEx = /^https?:\/\//i;
    	  var getOrPostRegEx = /^get|post$/i;
    	  var sameSchemeRegEx = new RegExp('^'+location.protocol, 'i');
    	  var htmlRegEx = /text\/html/i;
    	  var jsonRegEx = /\/json/i;
    	  var xmlRegEx = /\/xml/i;
    	  
    	  // ajaxTransport exists in jQuery 1.5+
    	  $.ajaxTransport('* text html xml json', function(options, userOptions, jqXHR){
    	    // XDomainRequests must be: asynchronous, GET or POST methods, HTTP or HTTPS protocol, and same scheme as calling page
    	    if (options.crossDomain && options.async && getOrPostRegEx.test(options.type) && httpRegEx.test(options.url) && sameSchemeRegEx.test(options.url)) {
    	      var xdr = null;
    	      var userType = (userOptions.dataType||'').toLowerCase();
    	      return {
    	        send: function(headers, complete){
    	          xdr = new XDomainRequest();
    	          if (/^\d+$/.test(userOptions.timeout)) {
    	            xdr.timeout = userOptions.timeout;
    	          }
    	          xdr.ontimeout = function(){
    	            complete(500, 'timeout');
    	          };
    	          xdr.onload = function(){
    	            var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
    	            var status = {
    	              code: 200,
    	              message: 'success'
    	            };
    	            var responses = {
    	              text: xdr.responseText
    	            };
    	            try {
    	              if (userType === 'html' || htmlRegEx.test(xdr.contentType)) {
    	                responses.html = xdr.responseText;
    	              } else if (userType === 'json' || (userType !== 'text' && jsonRegEx.test(xdr.contentType))) {
    	                try {
    	                  responses.json = $.parseJSON(xdr.responseText);
    	                } catch(e) {
    	                  status.code = 500;
    	                  status.message = 'parseerror';
    	                  //throw 'Invalid JSON: ' + xdr.responseText;
    	                }
    	              } else if (userType === 'xml' || (userType !== 'text' && xmlRegEx.test(xdr.contentType))) {
    	                var doc = new ActiveXObject('Microsoft.XMLDOM');
    	                doc.async = false;
    	                try {
    	                  doc.loadXML(xdr.responseText);
    	                } catch(e) {
    	                  doc = undefined;
    	                }
    	                if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
    	                  status.code = 500;
    	                  status.message = 'parseerror';
    	                  throw 'Invalid XML: ' + xdr.responseText;
    	                }
    	                responses.xml = doc;
    	              }
    	            } catch(parseMessage) {
    	              throw parseMessage;
    	            } finally {
    	              complete(status.code, status.message, responses, allResponseHeaders);
    	            }
    	          };
    	          // set an empty handler for 'onprogress' so requests don't get aborted
    	          xdr.onprogress = function(){};
    	          xdr.onerror = function(){
    	            complete(500, 'error', {
    	              text: xdr.responseText
    	            });
    	          };
    	          var postData = '';
    	          if (userOptions.data) {
    	            postData = ($.type(userOptions.data) === 'string') ? userOptions.data : $.param(userOptions.data);
    	          }
    	          xdr.open(options.type, options.url);
    	          xdr.send(postData);
    	        },
    	        abort: function(){
    	          if (xdr) {
    	            xdr.abort();
    	          }
    	        }
    	      };
    	    }
    	  });
    	}	
    } 
})();