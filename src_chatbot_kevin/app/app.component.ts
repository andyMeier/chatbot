import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {chatbotMessages} from './Dialogue';
import {useValueRecs} from './ValueRecs';
import {DialogueTurn} from './DialogueTurns';
import {firstValueFrom, Observable} from "rxjs";
import { DialogCommunicationService } from '../dialog-communication.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  sosci_server = 'https://www.soscisurvey.de/chatbotexplanations/?q=ex&i='
  db_server = 'https://multiweb.gesis.org/vacos2' // 'http://127.0.0.1:8090'
  nlu_server = 'https://multiweb.gesis.org/vacos6' // 'http://127.0.0.1:8091'
  highlightColor = 'rgba(72, 138, 199, 0.6)';

  title = 'chatbot';
  botReplyBehavior: string | null = 'baseline'; // choice from: 'baseline', 'acknowledge', 'repeat', 'rephrase'
  devMode: string | null = 'production'; // choice from: 'testing', 'production'
  needsHighlight: boolean | null = false; // toggle for highlighting of attributes according to previously mentioned needs
  needsBubbles: boolean | null = false; // toggle for chatbot bubbles of previously mentioned needs

  showScenario: boolean = true;
  page = 1;

  public snackbarMessage: string = '';

  isLastBotMessage(index: number): boolean {
    if (this.dialogueHistory[index].agent !== 'bot') {
      return false;
    }
  
    if (index === this.dialogueHistory.length - 1) {
      return true;
    }
  
    return this.dialogueHistory[index + 1].agent !== 'bot';
  }

  constructor(public http: HttpClient, private router: ActivatedRoute, private dialogCommunicationService: DialogCommunicationService) {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    console.log('URL param: caseToken', urlParams.get('caseToken'));
    const caseToken = urlParams.get('caseToken');
    if (caseToken != null) {
      this.sosciCaseToken = urlParams.get('caseToken');
    }

    //
    console.log('URL param: botReplyBehavior', urlParams.get('botReplyBehavior'));
    this.botReplyBehavior = urlParams.get('botReplyBehavior') || 'baseline';

    console.log('URL param: devMode', urlParams.get('devMode'));
    this.devMode = urlParams.get('devMode') || 'production';

    console.log('URL param: needsHighlight', urlParams.get('needsHighlight'));
    this.needsHighlight = urlParams.get('needsHighlight') == 'true' || false;

    console.log('URL param: needsBubbles', urlParams.get('needsBubbles'));
    this.needsBubbles = urlParams.get('needsBubbles') == 'true' || false;
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

  bubbleTexts: any = {"purpose": null, "price": null, "display": null, "storage": null, "ram": null, "battery": null};
  requirements: any = {"purpose": [], "price": [], "display": [], "storage": [], "ram": [], "battery": []};
  requirementsFullText: any = {"purpose": "", "price": "", "display": "", "storage": "", "ram": "", "battery": ""};
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
  convStartTime: any;
  recStartTime: any;

  onInputChange() {
    this.isInputEmpty = this.inputMessage.trim() === '';
  }

  isInputEmpty: boolean = true; // Define the property and initialize it with a default value

  ngOnInit(): void {

    this.dialogCommunicationService.dialogResponse$.subscribe(response => {;
      this.sendBackToSurvey(response);
    });

    this.http.post<any>(this.db_server + '/filter', {
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
    this.convStartTime = currTime;
  }

  async getMinMaxValues(_aspect: any, _IDs: Array<String>) {
    return this.http.post<any>(this.db_server + '/minmaxAspect', {
      'IDs': _IDs,
      'aspect': this.filterfields[_aspect],
      'dataset': 'amazon'
    })
  }
  deleteWaitMessage(): void {
    let cleanDialogueHistory: Array<DialogueTurn> = [];
    for (let _t of this.dialogueHistory) {
      if (_t.target != 'wait') {
        cleanDialogueHistory.push(_t);
      }
    }
    if (this.devMode == "testing") console.log("deleted waiting messages:", this.dialogueHistory.length - cleanDialogueHistory.length)
    this.dialogueHistory = cleanDialogueHistory;
  }

  addWaitMessage(): void {
    if (this.dialogueHistory[this.dialogueHistory.length - 1].target != 'wait') {
      this.dialogueHistory.push(new DialogueTurn("bot", "", false, "none", "wait"));
    }
    if (this.devMode == "testing") console.log("added waiting message")
  }

  setNextTarget(): void {
    if (this.backendTargets.indexOf(this.currentTarget) == this.backendTargets.length - 1) {
      this.currentTarget = "searchOffer";
    } else {
      this.currentTarget = this.backendTargets[this.backendTargets.indexOf(this.currentTarget) + 1];
    }
    if (this.devMode == "testing") console.log("new (next) TARGET set:", this.currentTarget)
  }

  setPreviousTarget(): void {
    if (this.backendTargets.indexOf(this.currentTarget) > 0) {
      this.currentTarget = this.backendTargets[this.backendTargets.indexOf(this.currentTarget) + 1];
    }
    if (this.devMode == "testing") console.log("new (previous) TARGET set:", this.currentTarget)
  }

  async startNewTarget(): Promise<void> {
    if (this.devMode == "testing") console.log("startNewTarget", this.currentTarget, this.backendTargets.indexOf(this.currentTarget));
    if (this.currentTarget == "") {
      this.currentTarget = this.backendTargets[0];
      for (let dT of chatbotMessages[this.currentTarget]["start"]) {
        this.addDialogueTurn(dT);
      }
    } else if (this.backendTargets.includes(this.currentTarget) && this.backendTargets.indexOf(this.currentTarget) < this.backendTargets.length - 1) {
      // set new target
      this.setNextTarget();
      // -----------------------------------
      // Add new messages about the new target.
      if (this.filtertypes[this.currentTarget] == "interval") {
        // display waiting message
        this.addWaitMessage();
        await firstValueFrom(await this.getMinMaxValues(this.currentTarget, this.laptopRecsIDs))
          .then((rData) => {
            console.log('Flask response MINMAX:', rData);
            if (this.filtertypes[this.currentTarget] == "interval") {
              this.numLaptopRecs = rData['num_hits'];
              if (rData['max_aspectvalue'] > 100) {
                this.currentMin = this.roundTo(rData['min_aspectvalue'], -1);
                this.currentMax = this.roundTo(rData['max_aspectvalue'], -1);
                this.currentMed = this.roundTo(rData['med_aspectvalue'], -1);
              } else {
                this.currentMin = this.roundTo(rData['min_aspectvalue']);
                this.currentMax = this.roundTo(rData['max_aspectvalue']);
                this.currentMed = this.roundTo(rData['med_aspectvalue']);
              }
              // some special cases:
              // (1) the remaining laptops do not have any information about the current target, i.e., there is no choice to choose from
              if (this.currentMax == -1 && this.currentMin == -1 && this.numLaptopRecs > 0) {
                this.setNextTarget();
              }
              // (2) the remaining laptops all have the same information about the current target, i.e., 5 laptops are left, all of them have 4GB RAM
              if (this.currentMax != -1 && this.currentMin == this.currentMax) {
                this.setNextTarget();
              }
              // (3) the remaining laptops have a very restricted choice of values for the current target, i.e., 5 laptops are left but they all have either 4GB or 8GB RAM

              if (this.devMode == "testing") console.log("MINMAX RESPONSE", this.currentMin, this.currentMed, this.currentMax);
            } else if (this.filtertypes[this.currentTarget] == "categorical") {
              this.currentMax = rData['max_aspectValue'];
            }
          });
      }
      // delete waiting message
      this.deleteWaitMessage();
      // add a message of what values are still in the run - but only if we have very few laptops left
      if (this.numLaptopRecs < 20 && this.numLaptopRecs > 0) {
        for (let dT of chatbotMessages[this.currentTarget]["valueHint"]) {
          this.addDialogueTurn(dT);
        }
      }
      // add normal messages
      for (let dT of chatbotMessages[this.currentTarget]["start"]) {
        this.addDialogueTurn(dT);
      }
      // ------------------------------------
      if (this.currentTarget == "searchOffer") {
        this.finishNeedsElicitation();
      }
    } else {
      this.finishNeedsElicitation();
    }
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

  cleanString(_m: string): string {
    var clean_m = _m;
    clean_m = clean_m.replace("-", "~");
    clean_m = clean_m.replace(" ", "+");
    clean_m = clean_m.replace(/[^a-zA-Z0-9~+]/g, "");
    return clean_m
  }

  sendMessage(_m: string): void {
    if (_m.length > 0) {
      this.addDialogueTurn(new DialogueTurn("user", _m));
      this.inputMessage = "";
      this.isInputEmpty = true;

      if (this.shouldSendToBackend()) {
        this.requirementsFullText[this.currentTarget] = this.cleanString(_m);
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
    this.addWaitMessage();

    console.log("Send Flask Request", this.currentTarget, _m);

    // send to flask backend
    this.http.post<any>(this.nlu_server + "/aspectneeds?aspect=" + this.currentTarget + "&ruleKeyfacts&autoPositives&replaceCategories&purposeForAnswer=" + this.currentUsage, {
      text: _m,
      user_id: this.sosciCaseToken
    }).subscribe({
      next: data => {
        console.log("RESPONSE", data);
        this.log['dialogue'].push(data);

        // delete waiting message
        this.deleteWaitMessage();
        // add actual response
        if (!data["failure"] && data.hasOwnProperty(this.currentTarget + '_text_autoPositives')) {
          // keyfacts could be extracted
          if (this.botReplyBehavior == 'acknowledge') {
            this.addDialogueTurn(new DialogueTurn("bot", data[this.currentTarget + '_text_autoPositives']['acknowledge'], false, "none", this.currentTarget));
          } else if (this.botReplyBehavior == 'repeat') {
            this.addDialogueTurn(new DialogueTurn("bot", data[this.currentTarget + '_text_autoPositives']['repeat'], false, "none", this.currentTarget));
          } else if (this.botReplyBehavior == 'rephrase') {
            this.addDialogueTurn(new DialogueTurn("bot", data[this.currentTarget + '_text_autoPositives']['rephrase'], false, "none", this.currentTarget));
          }
          // only for purpose: set usage type for targeted dialogues!
          if (this.currentTarget === "purpose") this.currentUsage = data[this.currentTarget];
          // save newly identified requirement
          this.addRequirements(this.currentTarget, data[this.currentTarget]);
          this.bubbleTexts[this.currentTarget] = data[this.currentTarget + '_text_autoPositives']['repeatNeeds']
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
        this.deleteWaitMessage();
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
    this.http.post<any>(this.db_server + '/filter', {
      'dataset': 'amazon',
      'filter': _flaskfilters,
      'facets': [],
      'sort_by': "ratingAvg_filter",
      'sort_by_order': "descending",
      'top_k': 1
    }).subscribe({
      next: rData => {
        console.log('Flask response:', rData);
        this.laptopRecs = rData['hits'];
        this.numLaptopRecs = rData['num_hits'];
        this.laptopRecsIDs = rData['hitIDs'];
        // show effect on number of suitable products
        if (_verbalize && this.backendTargets.includes(this.currentTarget) && this.currentTarget != "purpose") {
          if (this.numLaptopRecs > 20) {
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
        // if the current requirements lead to zero choice, start repairing: repeat last step
        } else if (this.numLaptopRecs == 0) {
          if (this.backendTargets.indexOf(this.currentTarget) == 0) {
            this.currentTarget = "greeting";
          } else {
            this.deleteRequirements(this.currentTarget);
            this.setPreviousTarget();
          }
        }
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
      if (this.devMode == "testing") console.log("buildFilterRequest of:", key, value);
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
    if (this.devMode == "testing") console.log("final filter request:", filterRequest);
    return filterRequest;
  }

  dialoguePreprocess(_t: DialogueTurn): DialogueTurn {
    //deep copy of turn, otherwise it replaces the values below and somehow this alters the whole dialogue turns object, so we cannot restart the chat...
    var _turn = new DialogueTurn(
      _t["agent"],
      (' ' + _t["message"]).slice(1),
      _t["messageReply"],
      _t["messageReplyType"],
      _t["target"],
      _t["delayNext"]
    );
    // console.log(_turn);
    // console.log('Dialog currentUsage:' + this.currentUsage)
    if (_turn["message"].includes("XXXMIN")) _turn["message"] = _turn["message"].replace('XXXMIN', "" + this.currentMin)
    if (_turn["message"].includes("XXXMAX")) _turn["message"] = _turn["message"].replace('XXXMAX', "" + this.currentMax)
    if (_turn["message"].includes("XXXMED")) _turn["message"] = _turn["message"].replace('XXXMED', "" + this.currentMed)
    if (_turn["message"].includes("XXXNUM")) _turn["message"] = _turn["message"].replace('XXXNUM', "" + this.numLaptopRecs)
    if (_turn["message"].includes("XXXUSEMIN")) _turn["message"] = _turn["message"].replace('XXXUSEMIN', "" + useValueRecs[this.currentUsage][this.currentTarget]["min"])
    if (_turn["message"].includes("XXXUSEMAX")) _turn["message"] = _turn["message"].replace('XXXUSEMAX', "" + useValueRecs[this.currentUsage][this.currentTarget]["max"])
    if (_turn["message"].includes("XXXUSAGE")) _turn["message"] = _turn["message"].replace('XXXUSAGE', "" + this.currentUsage)
    if (_turn["message"].includes("XXXTARGET")) _turn["message"] = _turn["message"].replace('XXXTARGET', "" + this.currentTarget)
    return _turn
  }

  addDialogueTurn(_turn: DialogueTurn): void {
    // Take care of the personalization and adaptive context information
    _turn = this.dialoguePreprocess(_turn);

    // add to dialogue history
    console.log("%c"+_turn["message"], 'color: green')
    this.dialogueHistory.push(_turn);
    this.log['dialogue'].push(_turn.outputify());
  }

  finishNeedsElicitation(): void {
    if (this.devMode == "testing") console.log("start finishNeedsElicitation");
    //this.logLogs(); // uncomment this if you want to send sosci people back to the survey without showing results
    //this.redirectToSosci(); // uncomment this if you want to send sosci people back to the survey without showing results
    if (this.numLaptopRecs > 0) {
      this.currentTarget = "searchOffer";
      if (this.dialogueHistory[this.dialogueHistory.length - 1].target != "searchOffer") {
        for (let dT of chatbotMessages["searchOffer"]["start"]) {
          this.addDialogueTurn(dT);
        }
      }
      // adapt size of chatbox to give more space to result
      this.resizeChatbox('55vh');
      this.goToNextPage();
      const currTime = new Date(Date.now());
      this.recStartTime = currTime;
      this.currentTarget = "presentOffer";
      for (let dT of chatbotMessages["presentOffer"]["start"]) {
        this.addDialogueTurn(dT);
      }
    } else {
      this.goToNextPage(); // jump over page 2 (offer evaluation)
      this.goToNextPage();
    }
  }

  sendBackToSurvey (response: string): void {
    // Display the snackbar
    this.snackbarMessage = "Thank you! Redirecting you to the survey...";

    // Call the logLogs function
    this.logLogs(response); // uncomment this if you want to send sosci people back to the survey without showing results

    // Wait with the redirect to shortly display the snackbar
    setTimeout(() => {
      this.redirectToSosci();
    }, 3000); // Display the snackbar for 3 seconds
}


  redirectToSosci(): void {
    //this.page = 3;
    // build URL with all information we want to hand over to sosci:
    let url = this.sosci_server + this.sosciCaseToken;
    for (var _t of this.backendTargets) {
      url += `&${_t}=${this.requirementsFullText[_t]}`;
    }
    if (this.devMode == "testing") console.log("URL", url);
    // set the url in the current window, which effectively redirects to sosci:
    window.location.href = url;
  }

  addRequirements(_target: string, _req: Array<any>): void {
    // the following part is only relevant if the user did not have requirements but was unsure and accepted the requirements of the chatbot
    if (this.userIsCurrentlyUnsure && _req.length <= 0) {
      _req = [useValueRecs[this.currentUsage][this.currentTarget]["min"], useValueRecs[this.currentUsage][this.currentTarget]["max"]];
      this.requirementsFullText[this.currentTarget] = useValueRecs[this.currentUsage][this.currentTarget]["min"].toString() + "-" + useValueRecs[this.currentUsage][this.currentTarget]["max"].toString();
      if (this.devMode == "testing") console.log("Yippie! The user accepted the suggested requirements!");
    }
    console.log("FULLTEXTS", this.requirementsFullText);
    // the following is relevant for all cases
    this.requirements[_target] = _req;
    console.log("CURRENT REQUIREMENTS:", this.requirements);
    const currentRequirements = this.buildFilterRequest();
    this.sendFilterRequest(currentRequirements);
  }

  deleteRequirements(_target: string): void {
    this.requirements[_target] = [];
  }

  resetUnsure(): void {
    this.userIsCurrentlyUnsure = false;
  }

  opencloseScenario(): void {
    this.showScenario = !this.showScenario;
  }

  restartDialogue(): void {
    this.restarts += 1;
    this.page = 1;
    const currTime = new Date(Date.now());
    this.convStartTime = currTime;
    this.dialogueHistory = [];
    this.backendTargets = ["purpose", "price", "display", "storage", "ram", "battery"];
    this.currentTarget = "";
    this.currentUsage = "unknown";
    console.log("currentUsage", this.currentUsage);
    this.currentMin = -1;
    this.currentMax = -1;
    this.currentMed = -1;
    this.currentCats = [];
    this.userIsCurrentlyUnsure = false;
    this.inputMessage = "";
    this.bubbleTexts = {"purpose": null, "price": null, "display": null, "storage": null, "ram": null, "battery": null};
    this.requirements = {"purpose": [], "price": [], "display": [], "storage": [], "ram": [], "battery": []};
    this.requirementsFullText = {"purpose": "", "price": "", "display": "", "storage": "", "ram": "", "battery": ""};
    this.log = {'dialogue': []};
    this.logTrials = 0;
    this.loggingInProcess = false;
    this.laptopRecs = [];
    this.numLaptopRecs = 0;
    this.laptopRecsIDs = [];
    this.serverDownCounter = 0;

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

  logLogs(response: string): void {
    
    /**
     * Sends log data to server
     */

    // Make nice log file
    this.log['ID'] = this.sosciCaseToken;
    this.log['botReplyBehavior'] = this.botReplyBehavior;
    this.log['needsHighlight'] = this.needsHighlight;
    this.log['needsBubbles'] = this.needsBubbles;
    this.log['convStartTime'] = this.convStartTime;
    this.log['recStartTime'] = this.recStartTime;
    const currTime = new Date(Date.now());
    this.log['endTime'] = currTime;
    this.log['requirements'] = this.requirements;
    this.log['serverErrors'] = this.serverDownCounter;
    this.log['restarts'] = this.restarts;
    this.log['dialogueHistory'] = this.dialogueHistory;

    // Log the user feedback
    this.log['userFeedback'] = response;

    if (this.devMode == "testing") console.log("Log File:", this.log);

    // Send logs to server
    this.loggingInProcess = true;
    this.http.post<any>(this.nlu_server + '/log?client_id=' + this.sosciCaseToken, this.log).subscribe({
      next: rData => {
        this.loggingInProcess = false;
        if (this.devMode == "testing") console.log('logLogs(): SUCCESS log data accepted by server');
        return
      },
      error: error => {
        console.error('logLogs(): ERROR received error response from flask:', error);
        this.logTrials += 1;
        if (this.logTrials <= 3) {
          this.logLogs(response);
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
    if (this.devMode == "testing") console.log("new page:", this.page)
  }

  scrollDown(): void {
    let cb = document.getElementById("chatbox")!;
    cb.scrollTop = cb.scrollHeight;
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

  hide(elements: any) {
    elements = elements.length ? elements : [elements];
    for (var index = 0; index < elements.length; index++) {
      if (elements[index].style.display != 'none') {
        elements[index].style.display = 'none';
      } else {
        elements[index].style.display = 'block';
      }
    }
  }

  get_style(message: string) {
    if (this.devMode == "testing") console.log('this.requirements.storage: ' + this.requirements.storage)
    var h: number = 10 + Math.ceil(message.length / 35) * 30;
    var w: number = 250;
    if (message.length < 35){
      w = 70 + message.length * 5;
    }
    return {'width': w + 'px', 'height': h + 'px'};
  }

  protected readonly JSON = JSON;
  protected readonly document = document;
}
