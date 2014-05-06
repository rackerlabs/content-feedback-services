package com.rackspace.feedback;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.apache.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;

import com.googlecode.htmlcompressor.compressor.HtmlCompressor;
import com.yahoo.platform.yui.compressor.JavaScriptCompressor;

@Path("/service")
public class FeedbackService {
	private static Logger log = Logger.getLogger(FeedbackService.class);
	private static Map<String, String>feedbackPageHtmlMap;
	private static Map<String, String>feedbackPageJsMap;
	
	static{
		FeedbackService.feedbackPageJsMap=new HashMap<String, String>();
		FeedbackService.feedbackPageHtmlMap=new HashMap<String, String>();
	}

	@GET
	@Produces("application/javascript")
    @Path("/raxfeedbackservice.js")
	public String getHeaderJavascript(@Context HttpServletRequest request, 
			@Context HttpServletResponse response,
			@DefaultValue("raxfeedbackdivid") @QueryParam("feedbackdivid")String feedbackdivid, 	
			@DefaultValue("localhost") @QueryParam("servername") String servername,
			@DefaultValue("false") @QueryParam("debug") String debug){
		String METHOD_NAME="getHeaderJavascript()";
		if(log.isDebugEnabled()){
		    log.debug(METHOD_NAME+": START: feedbackdivid="+feedbackdivid+" "
		    		+ "servername="+servername
		    		+ "debug="+debug);	
		}
		String key=(feedbackdivid+"-"+servername+"-"+debug);
		key=""+(key.hashCode());
		if(log.isDebugEnabled()){
		    log.debug(METHOD_NAME+": key="+key);
		    log.debug(METHOD_NAME+": (!FeedbackService.feedbackPageJsMap.containsKey("+key+"))="+
		    		(!FeedbackService.feedbackPageJsMap.containsKey(key)));
		}		
		allowOrigin(request,response);
		if(!FeedbackService.feedbackPageJsMap.containsKey(key)){
			InputStream inny=FeedbackService.class.getResourceAsStream("feedback.js");
			try {
				String temp=getFileContents(inny);
				String replacedFeedbackDivId=temp.replaceAll("~!@#feedbackdivid#@!~", feedbackdivid);
				String replacedServerName=replacedFeedbackDivId.replaceAll("~!@#servername#@!~", servername);
							
				if(debug.equalsIgnoreCase("true")){
					FeedbackService.feedbackPageJsMap.put(key,replacedServerName);
				}
				else{
					//Compress the javascript
					StringReader strReader=new StringReader(replacedServerName);
					StringWriter strWriter=new StringWriter();
				    JavaScriptCompressor comp=new JavaScriptCompressor(strReader, new SystemOutErrorReporter());
				    comp.compress(strWriter, -1, true, false, false, false);
				    FeedbackService.feedbackPageJsMap.put(key, strWriter.toString());
				}
			} 
			catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		if(log.isDebugEnabled()){
		    log.debug(METHOD_NAME+": END");	
		}
		return FeedbackService.feedbackPageJsMap.get(key);
	}
	
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getFeedbackHtml")
	public String getFeedbackHtml(@Context HttpServletRequest request,
			@Context HttpServletResponse response,
			@DefaultValue("false") @QueryParam("debug") String debug){
		String METHOD_NAME="getFeedbackHtml()";
		JSONObject retVal=new JSONObject();
		if(log.isDebugEnabled()){
		    log.debug(METHOD_NAME+": START:");	
		}
		String key=debug;
		allowOrigin(request,response);
		if(!FeedbackService.feedbackPageHtmlMap.containsKey(key)){
			InputStream inny=FeedbackService.class.getResourceAsStream("feedback.html");
			try{
				String temp=getFileContents(inny);
				if(debug.equals("false")){
				    FeedbackService.feedbackPageHtmlMap.put(key,compressHtml(temp));
				}
				else{
					 FeedbackService.feedbackPageHtmlMap.put(key,temp);
				}
			}
			catch(IOException e){
				e.printStackTrace();
			}
		}			
		if(log.isDebugEnabled()){
		    log.debug(METHOD_NAME+": END");	
		}
		try {
			retVal.put("html", FeedbackService.feedbackPageHtmlMap.get(key));
		} 
		catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return retVal.toString();		
	}
	
	
	private String compressHtml(String html){
		String retVal="";
		if(null!=html){
			HtmlCompressor compressor=new HtmlCompressor();
			compressor.setEnabled(true);
			compressor.setRemoveComments(true);
			compressor.setRemoveMultiSpaces(true);
			compressor.setRemoveIntertagSpaces(true);
			compressor.setCompressCss(true);
			compressor.setCompressJavaScript(true);		

			retVal=compressor.compress(html);
		}
		return retVal;
	}
		
	private String getFileContents(InputStream inny)throws IOException{
	    String retVal="";
	    if(null!=inny){
	    	int readInt=-1;
	    	char readChar;
	    	StringBuffer tempBuff=new StringBuffer("");
	    	while(-1!=(readInt=inny.read())){
	    		readChar=(char)readInt;
	    		if(readChar=='"'){
	    			tempBuff.append('\"');
	    		}
	    		else{
	    			tempBuff.append(readChar);
	    		}
	    	}
	    	inny.close();
	    	retVal=tempBuff.toString();
	    }
		return retVal;
	}
	
	private void allowOrigin(HttpServletRequest request, HttpServletResponse response){
		String METHOD_NAME="allowOrigin()";
		if(log.isDebugEnabled()){
		    log.debug(METHOD_NAME+": START:");	
		}		
		String headerOrigin=request.getHeader("Origin");
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": headerOrigin="+headerOrigin);
		}
		if(null!=headerOrigin ){//&& (headerOrigin.toLowerCase()).endsWith("rackspace.com")){
			response.setHeader("Access-Control-Allow-Origin", headerOrigin);
		}
		else{
			String serverName=request.getServerName();
			if(log.isDebugEnabled()){
				log.debug(METHOD_NAME+": serverName="+serverName);				
			}
			response.setHeader("Access-Control-Allow-Origin", serverName);
		}
		if(log.isDebugEnabled()){
		    log.debug(METHOD_NAME+": END:");	
		}
	}
}
