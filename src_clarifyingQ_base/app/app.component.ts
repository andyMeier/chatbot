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

  inputMessage: string = "";
  currentNLQuery: string = "";
  currentNLQueryChars: Array<string> = [];
  currentNLQueryKeyfactIndices: Array<number> = [];
  keyfacts: any = {};
  requirements: Array<any> = [];
  sosciCaseToken: string | null = 'TESTTEST';

  title = 'chatbot';
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

  filterfields: any = {"price":"price_filter","display":"screenSize_filter","storage":"totalStorageCapacity_filter","ram":"systemMemoryRam_filter","battery":"batteryLife_filter"}
  filtertypes: any = {"price":"interval","display":"interval","storage":"interval","ram":"interval","battery":"interval"}

  serverDownCounter: number = 0;
  restarts: number = 0;

  showScenario: boolean = true;

  log: any = {'dialogue':[]};
  logTrials: number = 0;
  loggingInProcess: boolean = false;
  logStart: any;

  ngOnInit(): void {

  }

  sendMessage(_m: string): void {
    if (_m.length > 0) {
      this.currentNLQuery = _m;
      this.currentNLQueryChars = this.splitQueryIntoChars(_m);
      //this.inputMessage = "";

      // log request
      console.log("Send Flask Request with Query:", _m);

      // send to flask backend
      this.http.post<any>("https://multiweb.gesis.org/vacos6/search?category&modifier&negation", {text: _m, user_id: this.sosciCaseToken}).subscribe({
        next: data => {
          console.log("RESPONSE", data);
          this.keyfacts = data;
          this.currentNLQueryKeyfactIndices = this.getQueryKeyfactIndices();

          this.requirements = [];
          for (let k in this.keyfacts) {
            let currkf = this.keyfacts[k];
            let text = this.currentNLQuery.substring(currkf["start"], currkf["end"]);
            this.keyfacts[k]["text"] = text;
            this.requirements.push(this.keyfacts[k]);
          }

        }
      });
    }

  }

  splitQueryIntoChars(_q: string): Array<string> {
    var c = [];
    for (var i = 0; i < _q.length; i++) {
      c.push(_q.charAt(i));
    }
    return c
  }

  getQueryKeyfactIndices(): Array<number> {
    var kfIndices: Array<number> = [];
    for (let k in this.keyfacts) {
      let currkf = this.keyfacts[k];
      let r = this.range(currkf["start"],currkf["end"]);
      for (let ii of r) {
        kfIndices.push(ii);
      }
    }
    return kfIndices
  }

  charIndexInKeyfact(_ci: number): boolean {
    if (this.currentNLQueryKeyfactIndices.includes(_ci)) {
      return true
    }
    return false
  }

  range(_start: number, _end: number): Array<number> {
    var r: Array<number>= [];
    for (var i = _start; i <= _end; i++) {
      r.push(i);
    }
    return r
  }

  getCategory(_cat: string): string {
    let i = _cat.lastIndexOf("_");
    if (i >= 0) {
      return _cat.substring(i+1)
    }
    return _cat
  }

  doesHaveValue(_req: any): boolean {
    if (_req["value"].length > 0) {
      return true
    }
    return false
  }

  isOnlyValue(_req: any): boolean {
    let r = this.range(_req["start"],_req["end"]);
    let v: Array<number> = [];
    for (let kv in _req["value"]) {
      let value = _req["value"][kv];
      let vr = this.range(value["start"],value["end"])
      for (let ii of vr) {
        v.push(ii);
      }
    }
    if (v.length == r.length) {
      return true
    }
    return false
  }

  getValue(_req: any): string {
    let v: string = "";

    for (let kv in _req["value"]) {
      let t: string = _req["text"];
      v += t.substring(_req["value"][kv]["start"]-_req["start"], _req["value"][kv]["end"]-_req["start"]) + " "
    }
    return v
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
        //this.laptopRecs = rData['hits'];
        //this.numLaptopRecs = rData['num_hits'];
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

  goToQuestionnaire():void {
    //this.page = 3;
    window.location.href = 'https://www.soscisurvey.de/LapDiag/?q=02&i=' + this.sosciCaseToken + '&server=' + this.serverDownCounter;
  }

  opencloseScenario(): void {
    this.showScenario = !this.showScenario;
  }

  scrollDown(): void {
    let cb = document.getElementById("chatbox")!;
    cb.scrollTop = cb.scrollHeight;
  }

  logLogs(): void {
    /**
     * Sends a complete log document to server at the end of the interaction
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
