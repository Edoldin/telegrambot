const {readFileSync} =  require('fs');
const https = require('https');
//theres a file named token like:
/*
BotName
BotUserName
BotToken
*/

const {token, key, cert, ca} = require('./certificados/get');
if (!key || !cert || !ca) { console.log("Certificados incorrectos", !!key, !!cert, !!ca); process.exit(1); }
var CERTIFICADOS={ key, cert, ca };
//https://api.telegram.org/bot<token>/METHOD_NAME
botMethod={
    me:"/getMe",
}
function botGet(botToken,METHOD_NAME="",cb){
    const baseUrl="https://api.telegram.org/bot"+botToken

    https.get(baseUrl+METHOD_NAME, (resp) => {
      let data = '';
    
      resp.on('data', (chunk) => data += chunk );
    
      resp.on('end', () => {
        if(cb)  cb(JSON.parse(data));
      });
    
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}

botGet(token[2],botMethod.me,console.log)

/*
If you'd like to make sure that the Webhook request comes from Telegram, we recommend using a
secret path in the URL, e.g. https://www.example.com/<token>. Since nobody else knows your bot‘s
token, you can be pretty sure it’s us.
*/

const httpsServer= https.createServer(CERTIFICADOS, recibe);
httpsServer.listen (PUERTOSSL); // 443
function recibe(){
    var ip = request.connection.remoteAddress;
	var host = request.headers.host; 
	var path = decodeURIComponent(request.url); 
	console.log("< " +ip+' '+host+path+(esHttps?' HTTPS':''));

	//var dominio= host.split(":")[0]; // Quitar puerto
	//var camino= path.split('?')[0].split('/'); camino.shift(); // Quitar parámetros y '/' inicial

	if (request.method === 'POST') {
		var data=""; 
		stream.on("error", function(err) { console.error(err); });
		stream.on("data", function(chunk) { data+=chunk; }); 
		stream.on("end", function() { responde({text:data,response}); });
	}
	else {
		responde({text:path,response});
	}
}
function responde(request, response){

}
function responde ({text, code=200, headers={}, response})	// 200 OK; 201 Creado; 202 Aceptada	
{
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
}