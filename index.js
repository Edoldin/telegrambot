const https = require('https');
const {readFileSync,writeFileSync} =  require('fs');
//theres a file named token like:
/*
BotName
BotUserName
BotToken
*/
const tokenTelegram=readFileSync(__dirname+"/certificados/token", 'utf8').split("\n")[2]

//https://api.telegram.org/bot<token>/METHOD_NAME
const Bot={
	baseOptions:function(jsonData){
		var theobj={
			host: "api.telegram.org",
			path: "/bot"+tokenTelegram,
			method:"GET"
		}
		if (jsonData){
			theobj.headers={
				'Content-Type': 'application/json',
				'Content-Length': jsonData.length
			}
			theobj.method="POST"
		}
		return theobj
	},
	request:function(options,cb=console.log){

		const theRequest=https.request(options,(resp)=>{
			let data = '';
			resp.on('data', (chunk) => data += chunk );
			resp.on('end', () => {
				cb(JSON.parse(data));
			});
		}).on("error", (err) => {
			cb("Error: " + err.message);
		})
		return theRequest
	},
	sslPort:88,
	serverURL:"raza.ingra.es",
	//https://core.telegram.org/bots/api#getme
	//A simple method for testing your bot's auth token. Requires no parameters. Returns basic information about the bot in form of a User object.
	command:{
		me:function (cb){
			let options=Bot.baseOptions();
			options.path+="/getMe"
			Bot.request(options,cb).end()
		},
		setWebhook:function (cb){
			const data=JSON.stringify({
				/*
				Parameter		Type			Required	Description
				url				String			Yes			HTTPS url to send updates to. Use an empty string to remove webhook integration
				certificate		InputFile		optional	Upload your public key certificate so that the root certificate in use can be checked
				max_connections	Integer			optional	Maximum allowed number of simultaneous HTTPS connections to the webhook 
				allowed_updates	Array of String	optional	A JSON-serialized list of the update types you want your bot to receive. 
				*/
				//Only this ports are suported 443, 80, 88 and 8443.
				url:Bot.serverURL+":"+Bot.sslPort+"/"+tokenTelegram
				});
			let options=Bot.baseOptions(data);
			options.path+="/setWebhook"
			var myRequest=Bot.request(options,cb)
			myRequest.write(data)
			myRequest.end()
		},
		getWebhookInfo:function(cb){
			let options=Bot.baseOptions();
			options.path+="/getWebhookInfo"
			Bot.request(options,cb).end()
		},
		deleteWebhook:function(cb){
			let options=Bot.baseOptions();
			options.path+="/deleteWebhook"
			Bot.request(options).end()
		},
		sendMessage:function(id=279542,text="ok",optional={},cb){
			var obj={
				chat_id:id,
				text:text,
				parse_mode:					optional.parse_mode,
				disable_web_page_preview:	optional.disable_web_page_preview,
				disable_notification:		optional.disable_notification,
				reply_to_message_id:		optional.reply_to_message_id,
				reply_markup:				optional.reply_markup,
			}
			const data=JSON.stringify(obj)
			let options=Bot.baseOptions(data);
			options.path+="/sendMessage"
			var myRequest=Bot.request(options,cb)
			myRequest.write(data)
			myRequest.end()
		},
		/*
		https://core.telegram.org/bots/api#sendmessage
		Required parameters:
		chat_id		Integer or String	Unique identifier for the target chat or username of the target channel (in the format @channelusername)
		text		String				Text of the message to be sent, 1-4096 characters after entities parsing
	*/
	},
	// just doc
	type:{
		KeyboardButton:function(text,optional={}){
			return {
				text:text,
				//THS 3 ARE MUTUALLY EXCLUSIVE
				request_contact:	optional.request_contact,
				request_location:	optional.request_location,
				request_poll:		optional.request_poll,
			}
		},
		ReplyKeyboardMarkup:function(keyboard,optional={}){
			return {
				/*https://core.telegram.org/bots/api/#replykeyboardmarkup*/
				keyboard:keyboard,
				resize_keyboard:	optional.resize_keyboard||false,
				one_time_keyboard:	optional.one_time_keyboard||false,
				selective:			optional.selective
			};
		},
		ReplyKeyboardRemove:function(remove_keyboard,optional){
			return {
				remove_keyboard:remove_keyboard,
				selective:		optional.selective?optional.selective:optional
			}
		},
		InlineKeyboardMarkup:function(InlineKeyboard){
			return {
				InlineKeyboard:InlineKeyboard
			}
		},
		InlineKeyboardButton:function(text,optional){
			var o={
				text:text
			}
			const [key,value]=Object.entries(optional)[0]
			o[key]=value
			return o
		}

	},
	server:{
		open:function(){
			const CERTIFICADOS={
				key  : readFileSync(__dirname+"/certificados/wasd.key"),
				cert : readFileSync(__dirname+"/certificados/certificate.crt"),
				ca   : readFileSync(__dirname+"/certificados/certificate.ca-crt")
			}
			const httpsServer= https.createServer(CERTIFICADOS, Bot.server.receive);
			httpsServer.listen (Bot.sslPort);
			console.log("httpsServer listening on port "+Bot.sslPort)
			return httpsServer
		},
		receive:function(request,response){
			var path = decodeURIComponent(request.url);
			var camino= path.split('?')[0].split('/'); camino.shift(); camino=camino.join("");// Quitar parámetros y '/' inicial

			if (request.method === 'POST' && camino==tokenTelegram) {
				var data=""; 
				request.on("error", function(err) { console.error(err); });
				request.on("data", function(chunk) { data+=chunk; }); 
				request.on("end", function() { 
					//console.log(data);
					Bot.server.receivemsg(data);
					//Bot.server.response({text:"ok",response}); 
					response.end();
				});
				
			}
			else {
				//Bot.server.response({text:camino,response});
				response.end();
			}
		},
		//a response isn't needed, but end it is mandatory or telegram won't know that the msg was receive
		/*response:function({text, code=200, headers={},response}){
			console.log("> " + text);

			if (!headers["Content-Type"]) headers["Content-Type"]="text/plain; charset=utf-8";
			headers["Access-Control-Allow-Origin"]="*"; // permite ser llamado desde otros dominios
			headers["Content-Length"]=text.length;
		
			try {
				response.writeHead(code,headers);
				response.write(text); 
				response.end();
			}
			catch(err) {
				console.error(err); 
			}
		}*/
		receivemsg:function(data){
			let dataObj=JSON.parse(data).message;
			const {id}=dataObj.from
			console.log(dataObj)
			if(!Bot.awesomeDB) 		Bot.awesomeDB=JSON.parse(readFileSync(__dirname+"/clients.txt", 'utf8'));
			if(!Bot.awesomeDB[id])	Bot.awesomeDB[id]=dataObj.from;
			if(Bot.awesomeDB[id].start==true){
				if(Bot.awesomeDB[id].code==dataObj.text){
					Bot.command.sendMessage(id,"Felicidades, tu cuenta ha sido vinculada, te enviaremos las nuevas actualizaciones directas a telegram, para dejar de recibir notificaciones escribe /stop o date de baja en la aplicación");
					Bot.awesomeDB[id].link=true;
					Bot.awesomeDB[id].notificaciones=true;
				}else{
					Bot.command.sendMessage(id,"Error el código no ha sido bien escrito, prueba otra vez");
				}
			}
			if(dataObj.entities){
				dataObj.entities.forEach(info => {
					var command=false
					if(info.type=="bot_command") command=dataObj.text.substring(info.offset,info.offset+info.length)
					if(command && command=="/start"){
						Bot.awesomeDB[id].start=true;
						Bot.awesomeDB[id].code="0000";
						Bot.command.sendMessage(id,"Introduce tu código personal")
					}
					if(command && command=="/stop"){
						Bot.awesomeDB[id].notificaciones=false;
						if(!Bot.awesomeDB[id].link)Bot.command.sendMessage(id,"Tu cuenta no está vinculada, escribe /start para vincularla y busca en la app tu código de vinculación")
					}
				});
			}
			writeFileSync(__dirname+"/clients.txt",JSON.stringify(Bot.awesomeDB),'utf8');
		}
	},
	awesomeDB:null,
}

//Bot.me();
//Bot.setWebhook();
//Bot.getWebhookInfo();
//Bot.deleteWebhook();
Bot.server.open()
