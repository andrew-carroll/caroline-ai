"use strict";

class Caroline {
    constructor(hotword=/Caroline/) {
        this.playlist = [];
        this.traits = [];
        this.hotword = hotword;
    }

    addTrait(test={}, cb) {
        if(typeof(test)==="string") test = {intent: test};
        this.traits.push((entities, intent, phrase) => {
            if((test.intent instanceof RegExp) && !test.intent.test(intent)) return;
            if(typeof(test.intent)==="string" && test.intent !== intent) return;
            if((test.phrase instanceof RegExp) && !test.phrase.test(phrase)) return;
            if(typeof(test.phrase)==="string" && testphrase !== phrase) return;
            cb.bind(this)(entities);
        });
    }

    _splitPhrase(phrase, limit) {
        let phraseParts = phrase
            .replace(/([\.!?])$/g,"$1|")
            .replace(/([\.!?])\s+([A-Z])/g,"$1|$2")
            .replace(/^\s*$/g,"|")
            .replace("\n"," ")
            .split("|")
            .map((a) => a.trim());
        
        phraseParts.forEach((part, i) => {
            if(part.length >= limit) {
                let pparts = part.replace(/[,;]/g,"|").replace(/\s+-\s+/g,"|").split("|");
                phraseParts.splice(i, 1, pparts.shift());
                pparts.forEach((ppart, j) => phraseParts.splice(i+j+1, 0, ppart));
            }
        });

        return phraseParts;
    }

    _sleep (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static hear(phrase) {
        if(phrase instanceof Array) phrase = phrase[0];
        if(typeof(phrase) !== "string") return;
        if(phrase.trim()==="") return;
        if(this.speaking) return;
        if(!this.listening && phrase.search(this.hotword) < 0) return;
        phrase = phrase.replace("+", "plus").replace("-", "minus").replace("/","divided by").replace("*", "times")
        fetch("/talk", {
            method: "POST",
            body: JSON.stringify({phrase: phrase}),
            headers: {"Content-Type": "application/json"}
        }).then((res) => res.json()).then((data) => {
            console.log(data);
            this.traits.forEach(async (trait) => {
                trait(data.entities, data.intent, data.phrase);
            });
        });
    }

    speak(phrase) {
        if(phrase == null) return;
        const TTSCHARLIMIT = 100;
        let fmtPhrase = this._splitPhrase(phrase, TTSCHARLIMIT).filter((a) => a.length > 0).map(
            (phrase) => phrase.charAt(0).toUpperCase() + phrase.substr(1).replace(/\s+/g, "+")
        );
        this.playlist = fmtPhrase.map(async (item, i) => { 
            await this._sleep(500 * i);
            let audio = new Audio("/tts?q=" + item);
            audio.onended = () => {
                if(this.playlist.length <= 0) {
                    this.speaking = false;
                    return;
                }
                this.playlist.shift().then((audio) => audio.play());
            }
            return audio;
        });
        if(this.playlist.length > 0) {
            this.speaking = true;
            this.playlist.shift().then((audio) => audio.play());
        }
    }
}