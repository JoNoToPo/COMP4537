const http = require('http');
http.createServer(function (req, res) {
    console.log("The server recieved a request ");
    res.writeHead(200, {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*"
    });
    res.end("server's response");
}).listen(8888)