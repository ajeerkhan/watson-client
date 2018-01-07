
//Router, has holds all routes for services.
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var Twilio = require('twilio');
//var MessagingResponse = require('twilio').twiml.MessagingResponse;
var bodyParser = require('body-parser');

var conversation = new Conversation({
    version_date: Conversation.VERSION_DATE_2016_09_20 
});
var workspaceId= process.env.ICeCream_WORKSPACE_ID;
var contexts = [];
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();
var appRouter = function(app) {
app.use("/api/sms",jsonParser, function(req,res){
 console.log(req.body);
 console.log(req);
 //const twiml = new MessagingResponse();
 //Watson call
 var message = process.env.default_Message;
 var number = process.env.default_From;
 var twilioNumber = process.env.default_To; 

 if(req.query && req.query.Body && req.query.From && req.query.To){
    
    message = req.query.Body;
    number = req.query.From;
    twilioNumber = req.query.To;
 }
 else  if(req.body && req.body.Body && req.body.From && req.body.To){
    message = req.body.Body;
    number = req.body.From;
    twilioNumber = req.body.To;
}


 const twilioRequest = {
    Message: message,
    From: number,
    Twilio: twilioNumber
};

console.log("Request received-> ", twilioRequest);

var conversationReq = {
   input: { text: message },
   workspace_id: workspaceId,
   context: context
};

console.log("Conversation Request -> ", conversationReq);


 var context = null;
 var index = 0;
 var contextIndex = 0;
 contexts.forEach(function(value) {
   console.log(value.from);
   if (value.from == number) {
     context = value.context;
     contextIndex = index;
   }
   index = index + 1;
 });

 console.log("Current Context -> " + JSON.stringify(context));
 console.log("Contexts length -> " + contexts.length);

 conversation.message(conversationReq, function(err, response) {
  //res.writeHead(200, {'Content-Type': 'text/xml'});
    if (err) {
      console.error("Conversation Error ->" + err);
      /*twiml.message('Sorry! we are not able to process your message currently, please try after sometime.');
      //console.error("Conversation Error Message ->" + twiml);
      res.set({
        'Content-Type' : 'text/xml'
      }); */
      res.send('Sorry! we are not able to process your message currently, please try after sometime.');
    } 
    else {
      console.log(response.output.text[0]);
      if (context == null) {
        contexts.push({'from': number, 'context': response.context});
      } else {
        contexts[contextIndex].context = response.context;
      }

      var intent = response.intents[0].intent;
      console.log(intent);
      if (intent == "done") {
        //contexts.splice(contexts.indexOf({'from': number, 'context': response.context}),1);
        contexts.splice(contextIndex,1);
        // Call REST API here (order pizza, etc.)
      }

   //twilio integration
    //version type 1
    /* var client = new Twilio(process.env.twilioaccountSid,process.env.twilioAuth);
      client.messages.create({
        from: twilioNumber,
        to: number,
        body: response.output.text[0]
      }, function(err, message) {
        if(err) {
          console.error(err.message);
        }
      });
      */

      //Type -2 twilio conversation
      //twiml.message(response.output.text[0]);
      //console.log("Conversation success response back to customer -> " + response.output.text[0]);
      //console.log("Conversation success response back to twilio -> " + twiml);
      /*res.set({
        'Content-Type' : 'text/xml'
      }); 
      res.send(twiml); */
      res.send(response.output.text[0]);
    }
});


//Reply to twilio. 
/*
 const sms = new MessagingResponse();
 const smsJson = {
   input : {
       Body: req.body.Body,
       From : req.body.From,
       To: req.body.To
   },
   output: "Thank you, message is relayed."
 };
 sms.message();
 res.send(req.body); */

});

}
module.exports = appRouter;