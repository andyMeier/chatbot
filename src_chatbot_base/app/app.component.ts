import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { chatbotMessages } from './Dialogue';
import { dialogueTurn } from './DialogueTurns';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{

  constructor(public http: HttpClient, private router: ActivatedRoute) {
    const queryString = window.location.search;
    console.log('WINDOWS', queryString);
    const urlParams = new URLSearchParams(queryString);
    console.log('caseToken', urlParams.get('caseToken'));
    const caseToken = urlParams.get('caseToken');
    if (caseToken != null) { this.sosciCaseToken = urlParams.get('caseToken'); }
    //console.log('facetOrdering', urlParams.get('facetOrdering'));
    //if (urlParams.get('facetOrdering')) {
    //  this.facetOrdering = urlParams.get('facetOrdering');
    //} else {
    //  this.facetOrdering = 'average';
    //}
  }

  title = 'chatbot';
  page = 1;

  sosciCaseToken: string | null = '123456ABCDEF';

  dialogueHistory: Array<dialogueTurn> = []
  backendTargets = ["purpose","price","display","storage","ram","battery"];
  currentTarget = "";

  inputMessage = "";

  requirements: any = {"purpose":[],"price":[],"display":[],"storage":[],"ram":[],"battery":[]};
  filterfields: any = {"price":"price_filter","display":"screenSize_filter","storage":"totalStorageCapacity_filter","ram":"systemMemoryRam_filter","battery":"batteryLife_filter"}
  filtertypes: any = {"price":"interval","display":"interval","storage":"interval","ram":"interval","battery":"interval"}

  laptopRecs: any = [];
  numLaptopRecs: number = 0;

  ngOnInit(): void {
    for (let dT of chatbotMessages["greeting"]["start"]) {
      this.dialogueHistory.push(dT);
    }
    this.startNewTarget();
  }



  startNewTarget(): void {
    console.log("startNewTarget", this.currentTarget, this.backendTargets.indexOf(this.currentTarget));
    if (this.currentTarget == "") {
      this.currentTarget = this.backendTargets[0];
      for (let dT of chatbotMessages[this.currentTarget]["start"]) {
        this.dialogueHistory.push(dT);
      }
    } else if (this.backendTargets.includes(this.currentTarget) && this.backendTargets.indexOf(this.currentTarget) < this.backendTargets.length - 1) {
      this.currentTarget = this.backendTargets[this.backendTargets.indexOf(this.currentTarget)+1];
      for (let dT of chatbotMessages[this.currentTarget]["start"]) {
        this.dialogueHistory.push(dT);
      }
    } else {
      this.currentTarget = "goodbye";
      for (let dT of chatbotMessages["goodbye"]["start"]) {
        this.dialogueHistory.push(dT);
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
      this.dialogueHistory.push(new dialogueTurn("user", _m));
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
        this.dialogueHistory.push(dT);
      }
    } else {
      this.startNewTarget();
    }
  }

  sendMessage_Backend(_m: string): void {
    // display waiting message
    if (this.dialogueHistory[this.dialogueHistory.length - 1].agent != 'bot' && this.dialogueHistory[this.dialogueHistory.length - 1].target != 'wait') {
      this.dialogueHistory.push(new dialogueTurn("bot", "", false, "none", "wait"));
    }

    // workaround for purpose
    //if (this.currentTarget =='purpose') {
    //  _m = "for " + _m
    //}

    // log request
    console.log("Send Flask Request", this.currentTarget, _m);

    // send to flask backend
    this.http.post<any>("https://multiweb.gesis.org/vacos6/all?" + this.currentTarget + "&ruleKeyfacts", {text: _m, user_id: this.sosciCaseToken}).subscribe({
      next: data => {
        console.log("RESPONSE", data);

        // delete waiting message
        if (this.dialogueHistory[this.dialogueHistory.length - 1].agent == 'bot' && this.dialogueHistory[this.dialogueHistory.length - 1].target == 'wait') {
          this.dialogueHistory.pop();
          console.log(this.dialogueHistory);
        }
        // add actual response
        if (!data["failure"]) {
          // keyfacts could be extracted
          this.dialogueHistory.push(new dialogueTurn("bot", data[this.currentTarget + "_text"], false, "none", this.currentTarget));
          this.requirements[this.currentTarget] = data[this.currentTarget];
          this.startNewTarget();
          return;
        } else if (data["not_important"] || data["unkown"]) {
          // user does not have requirements
          for (let dT of chatbotMessages[this.currentTarget]["notImportant"]) {
            this.dialogueHistory.push(dT);
          }
          return;
        } else if (data["failure"]) {
          // we could not deal with the response
          for (let dT of chatbotMessages[this.currentTarget]["noKeyfacts"]) {
            let idx = this.getRandomInt(0, dT.length);
            this.dialogueHistory.push(dT[idx]);
          }
          return;
        }
        // none of the above worked
        console.log("Somehow having problems with the response");
        for (let dT of chatbotMessages[this.currentTarget]["noKeyfacts"]) {
          this.dialogueHistory.push(dT);
        }
      },
      error: error => {
        console.error('There was an error!', error);
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


  goToNextPage(): void {
    this.page++;
  }

  restartDialogue(): void {
    this.page = 1;
    this.dialogueHistory = []
    this.backendTargets = ["purpose","price","battery"];
    this.currentTarget = "";
    this.inputMessage = "";
    this.requirements = {"purpose":[],"storage":[],"price":[],"battery":[]};
    this.ngOnInit();
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




  // --------------------------------------------------------------- UTILITIES
  getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }


}
