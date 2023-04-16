import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { chatbotMessages } from './Dialogue';
import { DialogueTurn } from './DialogueTurns';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{

  title = 'chatbot';
  page = 1;
  setting: string | null = 'rephrase'; // 'baseline', 'acknowledge', 'repeat', 'rephrase'

  constructor(public http: HttpClient, private router: ActivatedRoute) {
    const queryString = window.location.search;
    console.log('WINDOWS', queryString);
    const urlParams = new URLSearchParams(queryString);
    console.log('caseToken', urlParams.get('caseToken'));
    const caseToken = urlParams.get('caseToken');
    if (caseToken != null) { this.sosciCaseToken = urlParams.get('caseToken'); }
    console.log('setting', urlParams.get('setting'));
    this.setting = urlParams.get('setting') || 'rephrase';
  }

  sosciCaseToken: string | null = 'TESTTEST';

  dialogueHistory: Array<DialogueTurn> = [];
  backendTargets = ["purpose","price","display","storage","ram","battery"];
  currentTarget = "";

  inputMessage = "";

  requirements: any = {"purpose":[],"price":[],"display":[],"storage":[],"ram":[],"battery":[]};
  filterfields: any = {"price":"price_filter","display":"screenSize_filter","storage":"totalStorageCapacity_filter","ram":"systemMemoryRam_filter","battery":"batteryLife_filter"}
  filtertypes: any = {"price":"interval","display":"interval","storage":"interval","ram":"interval","battery":"interval"}

  laptopRecs: any = [];
  numLaptopRecs: number = 0;

  serverDownCounter: number = 0;
  restarts: number = 0;

  showScenario: boolean = true;

  log: any = {'dialogue':[]};
  logTrials: number = 0;
  loggingInProcess: boolean = false;
  logStart: any;

  ngOnInit(): void {
    this.startConversation();
  }

  startConversation(): void {
  	for (let dT of chatbotMessages["greeting"]["start"]) {
      this.addDialogueTurn(dT);
    }
    this.startNewTarget();
    const currTime = new Date(Date.now());
    this.logStart = currTime;
  }

  startNewTarget(): void {
    console.log("startNewTarget", this.currentTarget, this.backendTargets.indexOf(this.currentTarget));
    if (this.currentTarget == "") {
      this.currentTarget = this.backendTargets[0];
      for (let dT of chatbotMessages[this.currentTarget]["start"]) {
        this.addDialogueTurn(dT);
      }
    } else if (this.backendTargets.includes(this.currentTarget) && this.backendTargets.indexOf(this.currentTarget) < this.backendTargets.length - 1) {
      this.currentTarget = this.backendTargets[this.backendTargets.indexOf(this.currentTarget)+1];
      for (let dT of chatbotMessages[this.currentTarget]["start"]) {
        this.addDialogueTurn(dT);
      }
    } else {
      this.currentTarget = "goodbye";
      for (let dT of chatbotMessages["goodbye"]["start"]) {
        this.addDialogueTurn(dT);
      }
      console.log("FINAL REQUIREMENTS:", this.requirements);
      const finalRequirements = this.buildFilterRequest();
      this.sendFilterRequest(finalRequirements);
    }
    console.log("new target:", this.currentTarget);
  }

  shouldSendToBackend(): boolean {
    this.currentTarget = "";
    for (let i = 0; i < this.dialogueHistory.length; i++) {
      let j = this.dialogueHistory.length-1-i;
      if (this.dialogueHistory[j].agent == 'bot') {
        if (this.dialogueHistory[j].messageReplyType == 'open') {
          this.currentTarget = this.dialogueHistory[j].target;
        }
        break;
      }
    };
    if (this.backendTargets.includes(this.currentTarget)) {
      return true
    }
    return false
  }

  shouldSendToYesNo(): boolean {
    this.currentTarget = "";
    for (let i = 0; i < this.dialogueHistory.length; i++) {
      let j = this.dialogueHistory.length-1-i;
      if (this.dialogueHistory[j].agent == 'bot') {
        if (this.dialogueHistory[j].messageReplyType == 'yesno') {
          this.currentTarget = this.dialogueHistory[j].target;
        }
        break;
      }
    };
    if (this.backendTargets.includes(this.currentTarget)) {
      return true
    }
    return false
  }

  sendMessage(_m: string): void {
    if (_m.length > 0) {
      this.addDialogueTurn(new DialogueTurn("user", _m));
      this.inputMessage = "";

      if (this.shouldSendToBackend()) {
        this.sendMessage_Backend(_m);
      } else if (this.shouldSendToYesNo()) {
        this.sendMessage_YesNo(_m);
      }
    }

  }

  sendMessage_YesNo(_m: string): void {
    if (_m == "no") {
      this.requirements[this.currentTarget] = [];
      for (let dT of chatbotMessages[this.currentTarget]["no"]) {
        this.addDialogueTurn(dT);
      }
    } else {
      this.startNewTarget();
    }
  }

  sendMessage_Backend(_m: string): void {
    // display waiting message
    if (this.dialogueHistory[this.dialogueHistory.length - 1].agent != 'bot' && this.dialogueHistory[this.dialogueHistory.length - 1].target != 'wait') {
      this.dialogueHistory.push(new DialogueTurn("bot", "", false, "none", "wait"));
    }

    // workaround for purpose
    //if (this.currentTarget =='purpose') {
    //  _m = "for " + _m
    //}

    // log request
    console.log("Send Flask Request", this.currentTarget, _m);

    // send to flask backend
    this.http.post<any>("https://multiweb.gesis.org/vacos6/all?" + this.currentTarget + "&ruleKeyfacts&autoPositives", {text: _m, user_id: this.sosciCaseToken}).subscribe({
      next: data => {
        console.log("RESPONSE", data);
        this.log['dialogue'].push(data);

        // delete waiting message
        if (this.dialogueHistory[this.dialogueHistory.length - 1].agent == 'bot' && this.dialogueHistory[this.dialogueHistory.length - 1].target == 'wait') {
          this.dialogueHistory.pop();
          //console.log(this.dialogueHistory);
        }
        // add actual response
        if (!data["failure"] && data.hasOwnProperty(this.currentTarget + '_text_autoPositives')) {
          // keyfacts could be extracted
          if (this.setting == 'acknowledge') {
            this.addDialogueTurn(new DialogueTurn("bot", data[this.currentTarget + '_text_autoPositives']['acknowledge'], false, "none", this.currentTarget));
          } else if (this.setting == 'repeat') {
            this.addDialogueTurn(new DialogueTurn("bot", data[this.currentTarget + '_text_autoPositives']['repeat'], false, "none", this.currentTarget));
          } else if (this.setting == 'rephrase') {
            this.addDialogueTurn(new DialogueTurn("bot", data[this.currentTarget + '_text_autoPositives']['rephrase'], false, "none", this.currentTarget));
          }

          this.requirements[this.currentTarget] = data[this.currentTarget];
          this.startNewTarget();
          return;
        } else if (data["not_important"]) {
          // user does not have requirements
          for (let dT of chatbotMessages[this.currentTarget]["notImportant"]) {
            this.addDialogueTurn(dT);
          }
          return;
        } else if (data["unkown"]) {
          // user does not have requirements
          for (let dT of chatbotMessages[this.currentTarget]["unsure"]) {
            this.addDialogueTurn(dT);
          }
          return;
        } else {
          // we could not deal with the response
          for (let dT of chatbotMessages[this.currentTarget]["noKeyfacts"]) {
            let idx = this.getRandomInt(0, dT.length);
            this.addDialogueTurn(dT[idx]);
          }
          return;
        }
        // none of the above worked
        console.log("Somehow having problems with the response");
        for (let dT of chatbotMessages[this.currentTarget]["noKeyfacts"]) {
          this.addDialogueTurn(dT);
        }
      },
      error: error => {
        // delete waiting message
        if (this.dialogueHistory[this.dialogueHistory.length - 1].agent == 'bot' && this.dialogueHistory[this.dialogueHistory.length - 1].target == 'wait') {
          this.dialogueHistory.pop();
        }
        console.error('There was an error!', error);
        if (this.serverDownCounter == 0) {
          this.addDialogueTurn(new DialogueTurn("bot","So sorry, the server is not responding at this time. Try restarting the dialogue (button in the top right corner ->).", false, "none", "error"));
        } else if (this.serverDownCounter == 1) {
          this.addDialogueTurn(new DialogueTurn("bot","Sorry for the inconvenience, the server is again not responding. Please restart the dialogue a second time.", false, "none", "error"));
        } else {
          this.addDialogueTurn(new DialogueTurn("bot", "It seems that our servers are down. Please proceed to the questionnaire (button in the top right corner ->). This is a problem on our side - your submission will still be accepted on Prolific.", false, "none", "error"));
        }
        this.serverDownCounter += 1;
      }
    });
  }

  sendFilterRequest(_flaskfilters: Array<any>): void {
    console.log("Start filter request to FLASK");
    this.http.post<any>('https://multiweb.gesis.org/vacos2/filter', {
      'dataset': 'amazon',
      'filter': _flaskfilters,
      'facets': [],
      'sort_by': "ratingAvg_filter",
      'sort_by_order': "descending",
      'top_k': 1
    }).subscribe({
      next: rData => {
        console.log('Flask response:', rData);
        console.log('Flask hits:', rData['hits']);
        this.laptopRecs = rData['hits'];
        this.numLaptopRecs = rData['num_hits'];
      },
      error: error => {
        console.log("ERROR in retrieving laptops");
      }
    });
  }

  buildFilterRequest(): any {
    let filterRequest = [];
    for (var key in this.requirements) {
      const value: any = this.requirements[key];
      console.log(key, value);
      if (value.length > 0 && key in this.filterfields) {
        let req = {
          "filterfield": this.filterfields[key],
          "filtertype": this.filtertypes[key],
          "negation": false,
          "values": [value]
        };
        filterRequest.push(req);
      }
    }
    console.log("final filter request:", filterRequest);
    return filterRequest;
  }

  addDialogueTurn(_turn: DialogueTurn): void {
    this.dialogueHistory.push(_turn);
    this.log['dialogue'].push(_turn.outputify());
  }

  goToNextPage(): void {
    this.page++;
  }

  goToQuestionnaire():void {
    //this.page = 3;
    window.location.href = 'https://www.soscisurvey.de/LapDiag/?q=02&i=' + this.sosciCaseToken + '&server=' + this.serverDownCounter;
  }

  opencloseScenario(): void {
    this.showScenario = !this.showScenario;
  }

  restartDialogue(): void {
    this.restarts += 1;
    this.page = 1;
    this.dialogueHistory = [];
    this.backendTargets = ["purpose","price","display","storage","ram","battery"];
    this.currentTarget = "";
    this.inputMessage = "";
    this.requirements = {"purpose":[],"price":[],"display":[],"storage":[],"ram":[],"battery":[]};
    this.log = {'dialogue':[]};
    this.logTrials = 0;
    this.loggingInProcess = false;
    this.startConversation();
  }

  scrollDown(): void {
    let cb = document.getElementById("chatbox")!;
    cb.scrollTop = cb.scrollHeight;
  }

  beforeSameAgent(_i: number): boolean {
    if (_i > 0 && _i-1 < this.dialogueHistory.length) {
      if (this.dialogueHistory[_i].agent == this.dialogueHistory[_i-1].agent) {
        return true;
      }
    }
    return false;
  }

  logLogs(): void {
    /**
     * Sends log data to server
     */

    // Make nice log file
    this.log['ID'] = this.sosciCaseToken;
    this.log['setting'] = this.setting;
    this.log['start'] = this.logStart;
    const currTime = new Date(Date.now());
    this.log['end'] = currTime;
    this.log['requirements'] = this.requirements;
    this.log['serverErrors'] = this.serverDownCounter;
    this.log['restarts'] = this.restarts;
    //console.log("Log File:", this.log);

    // Send logs to server
    this.loggingInProcess = true;
    this.http.post<any>('https://multiweb.gesis.org/vacos6/log?client_id=' + this.sosciCaseToken, this.log).subscribe({
      next: rData => {
        this.loggingInProcess = false;
        console.log('logLogs(): SUCCESS log data accepted by server');
        this.goToQuestionnaire();
      },
      error: error => {
        console.error('logLogs(): ERROR received error response from flask:', error);
        this.logTrials += 1;
        if (this.logTrials <= 3) {
          this.logLogs();
        } else {
          this.goToQuestionnaire();
        }
      }
    });
  }




  // --------------------------------------------------------------- UTILITIES
  getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }


}
