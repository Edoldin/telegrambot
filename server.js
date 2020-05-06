const https = require('https');
const {readFileSync} =  require('fs');
const PUERTOSSL=88
const CERTIFICADOS={
	key  : readFileSync(__dirname+"/certificados/wasd.key"),
	cert : readFileSync(__dirname+"/certificados/certificate.crt"),
	ca   : readFileSync(__dirname+"/certificados/certificate.ca-crt")
}
const tokenTelegram=readFileSync(__dirname+"/certificados/token", 'utf8').split("\n")[2]
const httpsServer= https.createServer(CERTIFICADOS, recibe);

httpsServer.listen (PUERTOSSL);	//Only this ports are suported 443, 80, 88 and 8443.
console.log("httpsServer listening on port "+PUERTOSSL)
function recibe(request,response){
    var ip = request.connection.remoteAddress;
	var host = request.headers.host; 
	var path = decodeURIComponent(request.url);
	console.log("funciona Algo")
	//var dominio= host.split(":")[0]; // Quitar puerto
	var camino= path.split('?')[0].split('/'); camino.shift(); camino=camino.join("");// Quitar parámetros y '/' inicial

	if (request.method === 'POST' && camino==tokenTelegram) {
		var data=""; 
		request.on("error", function(err) { console.error(err); });
		request.on("data", function(chunk) { data+=chunk; }); 
		request.on("end", function() { console.log(data);responde({text:"ok",response}); });
		
	}
	else {
		responde({text:camino,response});
	}
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