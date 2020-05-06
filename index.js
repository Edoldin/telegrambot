const https = require('https');
const {readFileSync} =  require('fs');
//theres a file named token like:
/*
BotName
BotUserName
BotToken
*/
const tokenTelegram=readFileSync(__dirname+"/certificados/token", 'utf8').split("\n")[2]

const PUERTOSSL=88
//https://api.telegram.org/bot<token>/METHOD_NAME
var Bot={
	baseOptions:function(Method="GET"){
		return {
			host: "api.telegram.org",
			path: "/bot"+tokenTelegram,
			method:Method
		}
	},
	request:function(options,cb=console.log){

		const theRequest=https.request(options,(resp)=>{
			let data = '';
			resp.on('data', (chunk) => data += chunk );
			resp.on('end', () => {
				cb(JSON.parse(data));
			});
		}).on("error", (err) => {
			console.log("Error: " + err.message);
		})
		return theRequest
	},
	//https://core.telegram.org/bots/api#getme
	//A simple method for testing your bot's auth token. Requires no parameters. Returns basic information about the bot in form of a User object.
	me:function (cb){
		let options=Bot.baseOptions();
		options.path+="/getMe"
		Bot.request(options).end()
	},

	setWebhook:function (cb){
		const data=JSON.stringify({
			/*
			Parameter		Type			Required	Description
			url				String			Yes			HTTPS url to send updates to. Use an empty string to remove webhook integration
			certificate		InputFile		Optional	Upload your public key certificate so that the root certificate in use can be checked
			max_connections	Integer			Optional	Maximum allowed number of simultaneous HTTPS connections to the webhook 
			allowed_updates	Array of String	Optional	A JSON-serialized list of the update types you want your bot to receive. 
			*/
			//Only this ports are suported 443, 80, 88 and 8443.
			url:"raza.ingra.es:"+PUERTOSSL+"/"+tokenTelegram
			});
		let options=Bot.baseOptions("POST");
		options.path+="/setWebhook"
		options.headers={
			'Content-Type': 'application/json',
			'Content-Length': data.length
		  }
		var myRequest=Bot.request(options)
		myRequest.write(data)
		myRequest.end()
	},
	getWebhookInfo:function(){
		let options=Bot.baseOptions();
		options.path+="/getWebhookInfo"
		Bot.request(options).end()
	},
	deleteWebhook:function(){
		let options=Bot.baseOptions();
		options.path+="/deleteWebhook"
		Bot.request(options).end()
	},
	/*
	https://core.telegram.org/bots/api#sendmessage
	Required parameters:
	chat_id		Integer or String	Unique identifier for the target chat or username of the target channel (in the format @channelusername)
	text		String				Text of the message to be sent, 1-4096 characters after entities parsing
	*/
	sendMessage:function(){

	}
}

//Bot.me();
//Bot.setWebhook();
Bot.getWebhookInfo();
//Bot.deleteWebhook();

/*
If you'd like to make sure that the Webhook request comes from Telegram, we recommend using a
secret path in the URL, e.g. https://www.example.com/<token>. Since nobody else knows your bot‘s
token, you can be pretty sure it’s us.
*/
