# Caroline
A voice assistant written in Javascript, designed to bridge [annyang](https://github.com/TalAter/annyang) and [wit.ai](https://wit.ai), which also exposes a neat wrapper for the unofficial Google Translate TTS API.

## Install
Get the source:
```bash
git clone https://github.com/andrew-carroll/caroline-ai
cd caroline-ai
```
```bash
npm install
```
Or, if you prefer to use Docker:
```bash
echo WIT_TOKEN=your_wit_token > .env
docker-compose build
```

## Start
```bash
# Optional ENV vars: HOST, PORT
node ./index.js
```
Or, with Docker:
```bash
# Default HOST port is 80; edit docker-compose.yml to change this
docker-compose up -d
```

## Usage

Create a new instance with `let caroline = new Caroline()` and supply `Caroline.hear.bind(caroline)` as a callback to your speech recognizer (e.g. annyang). If you want your app to respond to a different hotword than the default `/Caroline/`, you can specify a different `RegExp` in the constructor (e.g. `new Caroline(/Jasper/)`).

Then, add new behaviors with `caroline.addTrait(test, callback)`. Here, `test` can be a `String` against which any recognized `intent` will be matched, a `RegExp` against which a recognized `phrase` will be matched, or an object with the optional keys `intent` and `phrase`, each of which can likewise be a `String` or `RegExp` against which any recognized `intent` and `phrase` will respectively be matched; and `callback` receives an `entities` object (with keys as named in your wit.ai app, and values accessible through the `value` attribute), an `intent` string, and the original `phrase` string. Traits will execute if all their tests match.

See `./index.html` for a working example.

```html
<script src="//cdnjs.cloudflare.com/ajax/libs/annyang/2.6.0/annyang.min.js"></script>
<script src="/brain.js"></script>
<script>
let caroline = new Caroline();
annyang.addCallback('result', Caroline.hear.bind(caroline));
annyang.start();

// Respond to ALL phrases and intents (not recommended)
caroline.addTrait({}, (entities, intent, phrase) => {
    console.log("I hear you.");
});

// Respond to a specific intent, as trained in your wit.ai app
caroline.addTrait("get time", () => {
    let time = new Date();
    caroline.speak("The time right now is " + ((time.getHours() % 12) || 12) + " " + time.getMinutes() +".");
})

// Respond to a phrase matching a regular expression
caroline.addTrait(/what is the weather/i, () => caroline.speak("Sunny, with a chance of showers."))

// Respond to a specific intent with a phrase matching a regular expression, and use trained wit entities
caroline.addTrait({
    intent: "calculate",
    phrase: /\d+ plus \d+/i
}, (entities, intent, phrase) => {
    if(!(entities.number instanceof Array) || entities.number.length != 2) return;
    let num = entities.number.map((e) => e.value);
    caroline.speak("I heard you ask: " + num[0] + " plus " + num[1] + ". My answer is: " + num[0] + num[1] + ".")
})
</script>
```