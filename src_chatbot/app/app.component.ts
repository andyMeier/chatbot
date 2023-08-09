import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {chatbotMessages} from './Dialogue';
import {useValueRecs} from './ValueRecs';
import {DialogueTurn} from './DialogueTurns';
import {firstValueFrom, Observable} from "rxjs";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = 'chatbot';
  setting: string | null = 'rephrase'; // choice from: 'baseline', 'acknowledge', 'repeat', 'rephrase'
  mode: string | null = 'production'; // choice from: 'testing', 'production'
  infoNeedMapMode: string | null = 'none'; // choice from: 'none', 'highlight', 'bubbles

  modalOpen = false;
  showScenario: boolean = false;
  page = 1;

  constructor(public http: HttpClient, private router: ActivatedRoute) {
    const queryString = window.location.search;
    console.log('WINDOWS', queryString);
    const urlParams = new URLSearchParams(queryString);
    console.log('caseToken', urlParams.get('caseToken'));
    const caseToken = urlParams.get('caseToken');
    if (caseToken != null) {
      this.sosciCaseToken = urlParams.get('caseToken');
    }
    console.log('setting', urlParams.get('setting'));
    this.setting = urlParams.get('setting') || 'rephrase';
    console.log('mode', urlParams.get('mode'));
    this.mode = urlParams.get('mode') || 'production';
    console.log('infoNeedMapMode', urlParams.get('infoNeedMapMode'));
    this.infoNeedMapMode = urlParams.get('infoNeedMapMode') || 'none';
  }

  sosciCaseToken: string | null = 'TESTTEST1234';

  dialogueHistory: Array<DialogueTurn> = [];
  backendTargets = ["purpose", "price", "display", "storage", "ram", "battery"];
  currentTarget = "";
  currentUsage = "unknown";
  currentMin = -1;
  currentMax = -1;
  currentMed = -1;
  currentCats = [];
  userIsCurrentlyUnsure = false;

  inputMessage = "";

  requirements: any = {"purpose": [], "price": [], "display": [], "storage": [], "ram": [], "battery": []};
  filterfields: any = {
    "price": "price_filter",
    "display": "screenSize_filter",
    "storage": "totalStorageCapacity_filter",
    "ram": "systemMemoryRam_filter",
    "battery": "batteryLife_filter"
  }
  filtertypes: any = {
    "price": "interval",
    "display": "interval",
    "storage": "interval",
    "ram": "interval",
    "battery": "interval",
    "brand": "categorical",
    "color": "categorical"
  }

  laptopRecs: any = [];
  numLaptopRecs: number = 0;
  laptopRecsIDs: Array<string> = [];

  serverDownCounter: number = 0;
  restarts: number = 0;

  log: any = {'dialogue': []};
  logTrials: number = 0;
  loggingInProcess: boolean = false;
  logStart: any;

  ngOnInit(): void {

    this.http.post<any>('https://multiweb.gesis.org/vacos2/filter', {
      'dataset': 'amazon',
      'filter': [],
      'facets': [],
      'sort_by': "ratingAvg_filter",
      'sort_by_order': "descending",
      'top_k': 1
    }).subscribe({
      next: rData => {
        console.log('Flask response:', rData);
        // console.log('Flask hits:', rData['hits']);
        this.laptopRecs = rData['hits'];
        this.numLaptopRecs = rData['num_hits'];
        this.laptopRecsIDs = rData['hitIDs'];
        this.startConversation();
      },
      error: error => {
        console.log("ERROR in retrieving laptops");
      }
    })
  }

  startConversation(): void {
    for (let dT of chatbotMessages["greeting"]["start"]) {
      this.addDialogueTurn(dT);
    }
    this.startNewTarget();
    const currTime = new Date(Date.now());
    this.logStart = currTime;
  }

  async getMinMaxValues(_aspect: any, _IDs: Array<String>) {
    return this.http.post<any>('https://multiweb.gesis.org/vacos2/minmaxAspect', {
      'IDs': _IDs,
      'aspect': this.filterfields[_aspect],
      'dataset': 'amazon'
    })
  }

  async startNewTarget(): Promise<void> {
    console.log("startNewTarget", this.currentTarget, this.backendTargets.indexOf(this.currentTarget));
    if (this.currentTarget == "") {
      this.currentTarget = this.backendTargets[0];
      for (let dT of chatbotMessages[this.currentTarget]["start"]) {
        this.addDialogueTurn(dT);
      }
    } else if (this.backendTargets.includes(this.currentTarget) && this.backendTargets.indexOf(this.currentTarget) < this.backendTargets.length - 1) {
      // set new target
      this.currentTarget = this.backendTargets[this.backendTargets.indexOf(this.currentTarget) + 1];
      // -----------------------------------
      // Add new messages about the new target.
      if (this.filtertypes[this.currentTarget] == "interval") {
        // display waiting message
        if (this.dialogueHistory[this.dialogueHistory.length - 1].target != 'wait') {
          this.dialogueHistory.push(new DialogueTurn("bot", "", false, "none", "wait"));
        }
        await firstValueFrom(await this.getMinMaxValues(this.currentTarget, this.laptopRecsIDs))
          .then((rData) => {
            console.log('Flask response MINMAX:', rData);
            if (this.filtertypes[this.currentTarget] == "interval") {
              if (rData['max_aspectvalue'] > 100) {
                this.currentMin = this.roundTo(rData['min_aspectvalue'], -1);
                this.currentMax = this.roundTo(rData['max_aspectvalue'], -1);
                this.currentMed = this.roundTo(rData['med_aspectvalue'], -1);
              } else {
                this.currentMin = this.roundTo(rData['min_aspectvalue']);
                this.currentMax = this.roundTo(rData['max_aspectvalue']);
                this.currentMed = this.roundTo(rData['med_aspectvalue']);
              }

            } else if (this.filtertypes[this.currentTarget] == "categorical") {
              this.currentMax = rData['max_aspectValue'];
            }
          });
      }
      // delete waiting message
      if (this.dialogueHistory[this.dialogueHistory.length - 1].agent == 'bot' && this.dialogueHistory[this.dialogueHistory.length - 1].target == 'wait') {
        this.dialogueHistory.pop();
        //console.log(this.dialogueHistory);
      }
      for (let dT of chatbotMessages[this.currentTarget]["start"]) {
        this.addDialogueTurn(dT);
      }
      // ------------------------------------
    } else {
      this.finishNeedsElicitation()
    }
    console.log("new target:", this.currentTarget);
  }

  shouldSendToBackend(): boolean {
    this.currentTarget = "";
    for (let i = 0; i < this.dialogueHistory.length; i++) {
      let j = this.dialogueHistory.length - 1 - i;
      if (this.dialogueHistory[j].agent == 'bot') {
        if (this.dialogueHistory[j].messageReplyType == 'open') {
          this.currentTarget = this.dialogueHistory[j].target;
        }
        break;
      }
    }
    ;
    if (this.backendTargets.includes(this.currentTarget)) {
      return true
    }
    return false
  }

  shouldSendToYesNo(): boolean {
    this.currentTarget = "";
    for (let i = 0; i < this.dialogueHistory.length; i++) {
      let j = this.dialogueHistory.length - 1 - i;
      if (this.dialogueHistory[j].agent == 'bot') {
        if (this.dialogueHistory[j].messageReplyType == 'yesno') {
          this.currentTarget = this.dialogueHistory[j].target;
        }
        break;
      }
    };
    if (this.backendTargets.includes(this.currentTarget)) {
      return true
    };
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
    } else if (_m == "yes" && this.userIsCurrentlyUnsure) {
      this.addDialogueTurn(new DialogueTurn("bot", "Okay, noted.", false, "none", this.currentTarget));
    } else {
      this.startNewTarget();
    }
  }

  sendMessage_Backend(_m: string): void {
    // display waiting message
    if (this.dialogueHistory[this.dialogueHistory.length - 1].agent != 'bot' && this.dialogueHistory[this.dialogueHistory.length - 1].target != 'wait') {
      this.dialogueHistory.push(new DialogueTurn("bot", "", false, "none", "wait"));
    }

    // log request
    console.log("Send Flask Request", this.currentTarget, _m);

    // send to flask backend
    this.http.post<any>("https://multiweb.gesis.org/vacos6/aspectneeds?aspect=" + this.currentTarget + "&ruleKeyfacts&autoPositives&replaceCategories&purposeForAnswer=" + this.currentUsage, {
      text: _m,
      user_id: this.sosciCaseToken
    }).subscribe({
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
          // only for purpose: set usage type for targeted dialogues!
          if (this.currentTarget === "purpose") this.currentUsage = data[this.currentTarget];
          // save newly identified requirement
          this.addRequirements(this.currentTarget, data[this.currentTarget]);
          return;
        } else if (data["not_important"]) {
          // user does not have requirements
          for (let dT of chatbotMessages[this.currentTarget]["notImportant"]) {
            this.addDialogueTurn(dT);
          }
          return;
        } else if (data["unknown"]) {
          // user does not have requirements
          this.userIsCurrentlyUnsure = true;
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
          this.addDialogueTurn(new DialogueTurn("bot", "So sorry, the server is not responding at this time. Try restarting the dialogue (button in the top right corner ->).", false, "none", "error"));
        } else if (this.serverDownCounter == 1) {
          this.addDialogueTurn(new DialogueTurn("bot", "Sorry for the inconvenience, the server is again not responding. Please restart the dialogue a second time.", false, "none", "error"));
        } else {
          this.addDialogueTurn(new DialogueTurn("bot", "It seems that our servers are down. Please proceed to the questionnaire (button in the top right corner ->). This is a problem on our side - your submission will still be accepted on Prolific.", false, "none", "error"));
        }
        this.serverDownCounter += 1;
      }
    });
  }

  sendFilterRequest(_flaskfilters: Array<any>, _verbalize: boolean = true): void {
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
        // console.log('Flask hits:', rData['hits']);
        this.laptopRecs = rData['hits'];
        this.numLaptopRecs = rData['num_hits'];
        this.laptopRecsIDs = rData['hitIDs'];
        // show effect on number of suitable products
        if (_verbalize && this.backendTargets.includes(this.currentTarget) && this.currentTarget != "purpose") {
          if (this.numLaptopRecs > 10) {
            // not relevant when there are still enough laptops to choose from?
            //let idx = this.getRandomInt(0, chatbotMessages["howmany"]["many"].length);
            //let dT: DialogueTurn = chatbotMessages["howmany"]["many"][idx];
            //dT["target"] = this.currentTarget;
            //this.addDialogueTurn(dT);
          } else if (this.numLaptopRecs > 0) {
            let idx = this.getRandomInt(0, chatbotMessages["howmany"]["few"].length);
            let dT: DialogueTurn = chatbotMessages["howmany"]["few"][idx];
            dT["target"] = this.currentTarget;
            this.addDialogueTurn(dT);
          } else {
            for (let dTs of chatbotMessages["howmany"]["none"]) {
              let idx = this.getRandomInt(0, dTs.length);
              let dT: DialogueTurn = dTs[idx];
              dT["target"] = this.currentTarget;
              this.addDialogueTurn(dT);
            }
          }
        }
        // if the current requirements lead to having only one computer being suitable, go straight to end of needs elicitation
        if (this.numLaptopRecs == 1) {
          this.currentTarget = "searchOffer";
        } else if (this.numLaptopRecs == 0) {
          if (this.backendTargets.indexOf(this.currentTarget) == 0) {
            this.currentTarget = "greeting";
          } else {
            this.currentTarget = this.backendTargets[this.backendTargets.indexOf(this.currentTarget)-1];
          }
        }
        // if the current requirements lead to zero choice, start repairing: repeat last step
        // go to next phase in dialogue
        this.startNewTarget();
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
      // console.log(key, value);
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
    // Take care of the personalization and adaptive context information
    if (_turn["message"].includes("XXXMIN")) _turn["message"] = _turn["message"].replace('XXXMIN', "" + this.currentMin)
    if (_turn["message"].includes("XXXMAX")) _turn["message"] = _turn["message"].replace('XXXMAX', "" + this.currentMax)
    if (_turn["message"].includes("XXXMED")) _turn["message"] = _turn["message"].replace('XXXMED', "" + this.currentMed)
    if (_turn["message"].includes("XXXNUM")) _turn["message"] = _turn["message"].replace('XXXNUM', "" + this.numLaptopRecs)
    if (_turn["message"].includes("XXXUSEMIN")) _turn["message"] = _turn["message"].replace('XXXUSEMIN', "" + useValueRecs[this.currentUsage][this.currentTarget]["min"])
    if (_turn["message"].includes("XXXUSEMAX")) _turn["message"] = _turn["message"].replace('XXXUSEMAX', "" + useValueRecs[this.currentUsage][this.currentTarget]["max"])
    if (_turn["message"].includes("XXXUSAGE")) _turn["message"] = _turn["message"].replace('XXXUSAGE', "" + this.currentUsage)
    if (_turn["message"].includes("XXXTARGET")) _turn["message"] = _turn["message"].replace('XXXTARGET', "" + this.currentTarget)

    //
    console.log("%c"+_turn["message"], 'color: green')
    this.dialogueHistory.push(_turn);
    this.log['dialogue'].push(_turn.outputify());
  }

  finishNeedsElicitation(): void {
    this.logLogs();
    //this.goToQuestionnaire(); // uncomment this for sosci user studies without showing results
    if (this.numLaptopRecs > 0) {
      this.currentTarget = "searchOffer";
      for (let dT of chatbotMessages["searchOffer"]["start"]) {
        this.addDialogueTurn(dT);
      }
      // adapt size of chatbox to give more space to result
      this.resizeChatbox('55vh');

      this.goToNextPage();
      this.currentTarget = "presentOffer";
      for (let dT of chatbotMessages["presentOffer"]["start"]) {
        this.addDialogueTurn(dT);
      }
    } else {
      this.goToNextPage(); // jump over page 2 (offer evaluation)
      this.goToNextPage();
    }
  }

  addRequirements(_target: string, _req: Array<any>): void {
    // this is only relevant if the user did not have requirements but was unsure and accepted the requirements of the chatbot
    if (this.userIsCurrentlyUnsure && _req.length <= 0) {
      _req = [useValueRecs[this.currentUsage][this.currentTarget]["min"], useValueRecs[this.currentUsage][this.currentTarget]["max"]];
      console.log("Yippie! The user accepted the suggested requirements!");
    }
    this.requirements[_target] = _req;
    console.log("CURRENT REQUIREMENTS:", this.requirements);
    const currentRequirements = this.buildFilterRequest();
    this.sendFilterRequest(currentRequirements);
  }

  resetUnsure(): void {
    this.userIsCurrentlyUnsure = false;
  }

  goToQuestionnaire(): void {
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
    this.backendTargets = ["purpose", "price", "display", "storage", "ram", "battery"];
    this.currentTarget = "";
    this.inputMessage = "";
    this.requirements = {"purpose": [], "price": [], "display": [], "storage": [], "ram": [], "battery": []};
    this.log = {'dialogue': []};
    this.logTrials = 0;
    this.loggingInProcess = false;
    this.resizeChatbox('70vh');
    this.startConversation();
  }

  beforeSameAgent(_i: number): boolean {
    if (_i > 0 && _i - 1 < this.dialogueHistory.length) {
      if (this.dialogueHistory[_i].agent == this.dialogueHistory[_i - 1].agent) {
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
    this.log['dialogueHistory'] = this.dialogueHistory;
    //console.log("Log File:", this.log);

    // Send logs to server
    this.loggingInProcess = true;
    this.http.post<any>('https://multiweb.gesis.org/vacos6/log?client_id=' + this.sosciCaseToken, this.log).subscribe({
      next: rData => {
        this.loggingInProcess = false;
        console.log('logLogs(): SUCCESS log data accepted by server');
        return
      },
      error: error => {
        console.error('logLogs(): ERROR received error response from flask:', error);
        this.logTrials += 1;
        if (this.logTrials <= 3) {
          this.logLogs();
        } else {
          return
        }
      }
    });
  }


  // --------------------------------------------------------------- UTILITIES

  roundTo(_n: number, _roundTo: number = 0, _mode: string = "math"): number {
    // scale up / down
    if (_roundTo > 0) { _n = _n * _roundTo * 10;
    } else if (_roundTo < 0) { _n = _n / (_roundTo * 10);
    }
    // round
    if (_mode == "ceil") { _n = Math.ceil(_n);
    } else if (_mode == "floor") { _n = Math.floor(_n);
    } else { _n = Math.round(_n);
    }
    // scale back to normal
    if (_roundTo > 0) { _n = _n / (_roundTo * 10);
    } else if (_roundTo < 0) { _n = _n * (_roundTo * 10);
    }
    return _n
  }

  roundShowRating(_rating: number): number {
    let r = Math.round(_rating * 100) / 100;
    return r
  }

  goToNextPage(): void {
    this.page++;
    console.log("new page:", this.page)
  }

  scrollDown(): void {
    let cb = document.getElementById("chatbox")!;
    cb.scrollTop = cb.scrollHeight;
  }

  closeModal(_position: string) {
    this.modalOpen = false;
    console.log('CLOSE MODAL');
    console.log("current page:", this.page, this.laptopRecs.length>0);
  }

  openModal() {
    this.modalOpen = true;
    console.log('OPEN MODAL');
    console.log("current page:", this.page, this.laptopRecs.length>0);
  }

  resizeChatbox(_newsize: string) {
    const chatbox = document.getElementById('chatbox');
    if (chatbox != null) {
      chatbox.style.height = _newsize;
    }
  }

  getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }

  protected readonly JSON = JSON;
}
