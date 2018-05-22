var express = require('express'),
    fs = require('fs'),
    https = require('https'),
    request = require('request'),
    cache = require('apicache').middleware
var app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
})

app.get('/brain.js', cache('60 minutes'), function(req, res) {
    res.sendFile(__dirname + "/brain.js");
})

app.get('/tts', cache('60 minutes'), function(req, res){
    let endpoint = "https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=" + req.query.q;
    request.get(endpoint).pipe(res);
});

app.post('/talk/', function(req, res){
    var phrase = decodeURI(req.body.phrase);
    request.get('https://api.wit.ai/message?v=20170307&q=' + phrase, function(err, witres, body){
        if(err !== null) console.error(err);
        if(body !== null) {
            let intent;
            body = JSON.parse(body);
            if(body.entities.intent != null) intent = body.entities.intent[0].value;
            res.write(JSON.stringify({entities: body.entities, intent: intent, phrase: phrase}));
            res.end();
        }
    }).auth(null, null, true, process.env.WIT_TOKEN);
})

let host = process.env.HOST || '127.0.0.1';
let port = process.env.PORT || '8080';

console.log("Listening on https://" + host + ":" + port)

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')}, app)
.listen(port, host);