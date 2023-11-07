import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { chatbotMessages } from './Dialogue';
import { useValueRecs } from './ValueRecs';
import { DialogueTurn } from './DialogueTurns';
import { firstValueFrom, Observable } from "rxjs";
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


  botReplyBehavior: string | null = 'baseline'; // choice from: 'baseline', 'acknowledge', 'repeat', 'rephrase'
  devMode: string | null = 'production'; // choice from: 'testing', 'production'
  needsHighlight: boolean | null = false; // toggle for highlighting of attributes according to previously mentioned needs
  needsBubbles: boolean | null = false; // toggle for chatbot bubbles of previously mentioned needs

  showScenario: boolean = true;

  public snackbarMessage: string = ''; // snackbar is not visible when the page opens

  // avatar image is positioned at the last message of a chatbot's dialogue turn
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
  targetOrder = ["greeting", "purpose", "price", "display", "storage", "ram", "battery", "offer"];
  currentTarget = "";
  currentUsage = "unknown";
  currentMin = -1;
  currentMax = -1;
  currentMed = -1;
  currentCats = [];
  currentChoicesSet: Array<any> = [];

  yesnoTrigger: string | null = null; // choice from: "singleValue", "defaultValues", "allValues" or null

  inputMessage = "";

  bubbleTexts: any = { "purpose": null, "price": null, "display": null, "storage": null, "ram": null, "battery": null };
  requirements: any = { "purpose": [], "price": [], "display": [], "storage": [], "ram": [], "battery": [] };
  requirementsFullText: any = { "purpose": "", "price": "", "display": "", "storage": "", "ram": "", "battery": "" };
  filterfields: any = {
    "price": "price_filter",
    "display": "screenSize_filter",
    "storage": "totalStorageCapacity_filter",
    "ram": "systemMemoryRam_filter",
    "battery": "batteryLife_filter",
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

  restarts: number = 0;

  redProblem: boolean = false;

  log: any = { 'dialogue': [] };
  logTrials: number = 0;
  loggingInProcess: boolean = false;
  convStartTime: any;
  recStartTime: any;

  // send-button next to the the chatbox text input field is disabled if the input field is empty
  onInputChange() {
    this.isInputEmpty = this.inputMessage.trim() === '';
  }

  isInputEmpty: boolean = true; // Define the property and initialize it with a default value

  // --------------------------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------- INITIALIZATION

  ngOnInit(): void {

    this.dialogCommunicationService.dialogResponse$.subscribe(response => {
      ;
      this.sendBackToSurvey(response);
    });

    this.currentTarget = this.targetOrder[0];
    this.dialogueFlow();

  } // --- end ngOnInit()

  // --------------------------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------- DIALOGUE FLOW

  // Entails all dialogue phases:
  // (1) greeting - friendly hello and instructions
  // (2) main dialogue - iterating over product aspects with aspec-specific questions
  // (3) offer - searching for a laptop recommendation and presenting the laptop to the user.
  dialogueFlow(): void {

    if (this.currentTarget === "greeting") {
      this.dialogueFlowGreeting();
    } else if (this.currentTarget === "offer") {
      this.dialogueFlowPresentation();
    } else {
      this.dialogueFlowQuestions();
    }

  } // --- end dialogueFlow()


  // Covers dialogue phase (1): greeting
  async dialogueFlowGreeting(): Promise<void> {

    // log starting time
    const currTime = new Date(Date.now());
    this.convStartTime = currTime;

    // SUMMARY
    // step (1): get a list of current IDs in the result list.
    // step (2): case distinction!
    //           case (1): We have 0 laptops in the result list
    //                     -> Obviously, something is going wrong. Inform the user about this problem. Set the redProblem flag.
    //           case (2): We have laptops in the result list
    //                     -> All good, continue with greeting.


    // STEP (1): get a list of current IDs in the result list.
    this.addWaitMessage();
    await firstValueFrom(await this.getResultList()).then((rData) => {
      console.log('RESPONSE getResultList():', rData);
      this.laptopRecs = rData['hits'];
      this.numLaptopRecs = rData['num_hits'];
      this.laptopRecsIDs = rData['hitIDs'];

      this.deleteWaitMessage();

      if (this.numLaptopRecs <= 0) {
        // STEP (2): case (1) We have 0 laptops in the result list
        //                    -> Obviously, something is going wrong. Inform the user about this problem. Set the redProblem flag.
        this.raiseRedProblem();
      } else {
        // STEP (2): case (2) We have laptops in the result list
        //                    -> All good, continue with greeting.
        for (let dT of chatbotMessages["greeting"]["start"]) {
          this.addDialogueTurn(dT);
        }
        this.setNextTarget();
        this.dialogueFlow();
      }
    });

  } // --- end dialogueFlowGreeting()


  // Covers dialogue phase (2): needs elicitation via proactive questioning
  async dialogueFlowQuestions(): Promise<void> {

    // If the currentTarget is a target we have questions for (i.e.,):

    // SUMMARY
    // step (1): get list of current IDs in the result list.
    // step (2a): (if current target is a numeric attribute) get set of possible values for current result list for the current target. Get min max average values.
    // step (2a): (if current target is a categorical attribute) get set of possible category values for current result list for the current target.
    // step (3): case distinction!
    //           case (1): We have an empty result list.
    //                     -> inform the user about this problem.
    //                     -> Check if this is because of an earlier requirement, i.e., if things would change if we go one target back and collect the user requirements again (i.e., if the current target is not the first or second target in the list)
    //                        If yes: There is probably something wrong with the server or the chatbot in general. Inform the user about this. Set the redProblem flag.
    //                        If no:  We go one target back and repeat the steps there.
    //           case (2): We have exactly one laptop in the result list.
    //                     -> inform the user about this. Then go to offerPresentation step.
    //           case (3): None of the remaining laptops have a value (all have missing values)
    //                     -> no need to ask the person about anything
    //                     -> just go to next target
    //           case (4): All laptops have the exact same value for the current aspect, so there is no choice.
    //                     -> inform the user about this value.
    //                     -> Ask user yes/no question if this value is okay for them.
    //                        If yes -> add to requirements and move on.
    //                        If no  -> Then we need to change an earlier requirement. Check if we can go one target back (i.e., if the current target is not the first or second target in the list)
    //                                  If yes: inform the user that we will revisit an earlier requirement then. Go one target back and repeat the steps there.
    //                                  If no: This situation should not happen, but in case it does: inform user. Set the redProblem flag.
    //           case (5): There is a very restricted choice of values for the current aspect.
    //                     -> Inform the user about the possible choices.
    //                     -> continue with case (5)
    //           case (6): We have enough laptops in the result list AND there is a variety of value choices for the current aspect.
    //                     -> No need to inform the user about any restrictions for the requirements.
    //                     -> Ask user about requirements.
    //                        -> case distinction!
    //                           case (5a): User has requirements that we can handle
    //                                      -> add to requirements, possibly react to input, set new target, continue.
    //                           case (5b): User does not know what they want.
    //                                      -> tell them the standard values for such a case, ask if that is okay
    //                                         If yes: add to requirements, possibly react to input, set new target, continue.
    //                                         If no:  ask to re-iterate what they want.
    //                           case (5c): User does not mind.
    //                                      -> tell them that we will leave this open then. ask if that is okay.
    //                                         If yes: add nothing to requirements, possibly react to input, set new target, continue.
    //                                         If no:  ask to re-iterate what they want.
    //                           case (5b): Could not process user input
    //                                      -> tell them that we do not understand, ask to re-iterate.


    // step (1): get list of current IDs in the result list.
    this.addWaitMessage();
    await firstValueFrom(await this.getResultList()).then(async (rData) => {
      console.log('RESPONSE getResultList():', rData);

      this.laptopRecs = rData['hits'];
      this.numLaptopRecs = rData['num_hits'];
      this.laptopRecsIDs = rData['hitIDs'];

      // WORKAROUND STEP 2
      // at the moment, we do not have information in our dataset about whether a laptop is suited for "basic, "advanced" or "gaming" purpose.
      // so if the current target aspect is purpose, we take a shortcut here.
      // IN THE FUTURE this should be resolved *on the side of the dataset*
      if (this.currentTarget == "purpose") {
        if (this.devMode == "testing") console.log("case (purpose) - take shortcut")
        this.deleteWaitMessage();
        for (let dT of chatbotMessages[this.currentTarget]["start"]) {
          this.addDialogueTurn(dT);
        }
        return
      }

      // step (2): get list of possible value choices for current aspect
      await firstValueFrom(await this.getValueChoices()).then((rData) => {
        console.log('RESPONSE getValueChoices():', rData);

        this.numLaptopRecs = rData['num_hits']; // TODO: check if it is needed to update the number of hits here! Might be some issue with missing values
        this.currentChoicesSet = rData['possiblevalues']; // TODO: add this to the response object on the DB server side!
        if (rData['max_aspectvalue'] > 100) {
          this.currentMin = this.roundTo(rData['min_aspectvalue'], -1);
          this.currentMax = this.roundTo(rData['max_aspectvalue'], -1);
          this.currentMed = this.roundTo(rData['med_aspectvalue'], -1);
        } else {
          this.currentMin = this.roundTo(rData['min_aspectvalue']);
          this.currentMax = this.roundTo(rData['max_aspectvalue']);
          this.currentMed = this.roundTo(rData['med_aspectvalue']);
        }

        this.deleteWaitMessage();

        // STEP (3)

        if (this.numLaptopRecs <= 0) {
          // case (1): We have an empty result list.
          if (this.devMode == "testing") console.log("case (1)")

          if (this.targetOrder.indexOf(this.currentTarget) > 2) {
            // case (1a) this happens at a later state after having filtered, i.e., earlier requirements are too strict.
            //           -> We ask users to re-iterate the previous question.
            for (let dTs of chatbotMessages["howmany"]["none"]) {
              let idx = this.getRandomInt(0, dTs.length);
              let dT: DialogueTurn = dTs[idx];
              dT["target"] = this.currentTarget;
              this.addDialogueTurn(dT);
            }
            this.setPreviousTarget();
            this.deleteRequirements(this.currentTarget);
            this.dialogueFlow();
          } else {
            // case (1b) this happens at an early state where we did not even use filter requirements yet: this must mean something else is wrong.
            //           -> We tell users something is wrong and point to the general menu.
            this.raiseRedProblem();
          }

        } else if (this.numLaptopRecs == 1) {
          // case (2): We have exactly one laptop in the result list.
          //           -> inform the user about this. Then go to offerPresentation step.
          if (this.devMode == "testing") console.log("case (2)")

          let dT = new DialogueTurn("bot", "I have exactly 1 laptop that meets your requirements.", false, "none", this.currentTarget);
          this.addDialogueTurn(dT);
          this.currentTarget = "offer";
          this.dialogueFlow();

        } else {

          if (this.numLaptopRecs < 10) {
            // if we only have a limited choice of laptops in our result list, we should communicate this to the users.

            let idx = this.getRandomInt(0, chatbotMessages["howmany"]["few"].length);
            let dT: DialogueTurn = chatbotMessages["howmany"]["few"][idx];
            dT["target"] = this.currentTarget;
            this.addDialogueTurn(dT);

          }

          // remaining cases: we have 2 or more laptops to choose from. However, that does not mean that we actually have a broad range of values to choose from.
          // for example, if we have 2 laptops, then asking about RAM in general is useless if we know that both laptops have 2GB RAM.
          // so now we make a distinction based on the actual choice of values we have for the current target aspect.

          if (this.currentChoicesSet.length == 0) {
            // case (3): None of the remaining laptops have a value for the current aspect (all have missing values)
            //           -> no need to ask the user about their requirements for this aspect then, just go to next aspect
            if (this.devMode == "testing") console.log("case (3)")

            this.setNextTarget();
            this.dialogueFlow();

          } else if (this.currentChoicesSet.length == 1) {
            // case (4): All laptops have the exact same value for the current aspect, so there is no choice.
            //           -> inform the user about this value and ask if this value is okay for them.
            if (this.devMode == "testing") console.log("case (4)")

            let dT: DialogueTurn = chatbotMessages[this.currentTarget]["singleValue"][0];
            this.addDialogueTurn(dT);
            // the dialogueTurn above will trigger the yes / no buttons on the user interface.
            // we need to set the yesnoTrigger to singleValue so that we later on, once the user has clicked on yes or no,
            // know why yes / no was shown, in order to react appropriately (i.e., set this value as the requirement)
            this.yesnoTrigger = "singleValue";
            // no next target, we need to wait for the user's input here!
            // no moving on in the dialogue flow, we have to wait for the user's input!

          } else if (this.currentChoicesSet.length <= 3 && this.currentTarget != "purpose") {
            // case (5): There is a very restricted choice of values for the current aspect.
            //           -> Inform the user about the possible choices, but then ask question.
            // ATTENTION! This does not work for target aspects that have a limited choice to begin with, i.e., purpose (can only be basic, advanced, or gaming).
            // ATTENTION! We therefore have to explicitly disable this rule for those target aspects.
            if (this.devMode == "testing") console.log("case (5)")

            let dT: DialogueTurn = chatbotMessages[this.currentTarget]["fewValues"][0];
            this.addDialogueTurn(dT);

          } else {
            // case (6): We have enough laptops in the result list AND there is a variety of value choices for the current aspect.
            //           -> No need to inform the user about any restrictions for the requirements.
            //           -> Ask user about requirements.
            if (this.devMode == "testing") console.log("case (6)")

            for (let dT of chatbotMessages[this.currentTarget]["start"]) {
              this.addDialogueTurn(dT);
            }

          }
        }
      });
    });

  } // --- end dialogueFlowQuestions()


  // Covers dialogue phase (3): presenting a suitable product
  dialogueFlowPresentation(): void {

    // inform user that you wil present the laptop below.
    for (let dT of chatbotMessages["searchOffer"]["start"]) {
      this.addDialogueTurn(dT);
    }
    // adapt layout of webapp to fit the results list
    this.resizeChatbox('55vh');
    // log time of conversation end / offer presentation start
    const currTime = new Date(Date.now());
    this.recStartTime = currTime;
    for (let dT of chatbotMessages["presentOffer"]["start"]) {
      this.addDialogueTurn(dT);
    }

  } // --- end dialogueFlowPresentation()


  // --------------------------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------- USER INPUTS

  // treats user input via the yes / no buttons
  userInput_yesno(_yn: string): void {

    // SUMMARY
    // There are several situations when the user will see the yes / no buttons.
    // case (1): There was only one possible value for the aspect and the user is asked to confirm that this value is acceptable.
    //           For example: We have only 10 laptops left on the result list, 4 of them do not have a RAM value at all, and the other 6 all have a RAM of 4GB.
    //           The user is then asked to confirm (yes / no) if 4GB is acceptable.
    //           This case can be recognized because this.yesnoTrigger is set to "singleValue".
    //           Reactions: (YES) add this.currentChoicesSet[0] to requirements and move on to next target aspect.
    //                      (NO) We need to change an earlier requirement. Check if we can go one target back (i.e., if the current target is not the first, second, or third target in the list)
    //                           If yes: inform the user that we will revisit an earlier requirement then. Go one target back and repeat the steps there.
    //                           If no: This situation should not happen, but in case it does: inform user. Set the redProblem flag.
    // case (2): The user does not know which requirements are fitting and the chatbot has proposed the default values. The user is asked to confirm the proposed defaut values.
    //           For example: When asked about RAM, the user says "I don't know". The chatbot says "For gaming, RAM should be 16GB or higher. Does that work for you?"
    //           This case can be recognized because this.yesnoTrigger is set to "defaultValues".
    //           Reactions: (YES) add default values to requirements and move on to next target aspect.
    //                      (NO) We need to ask the user what they want instead. Set the "no" dialogue turn and wait for new user input.
    // case (3): The user does not care about this requirement.
    //           For example: When asked about the battery, the user says "Don't care, I leave it plugged in all the time.
    //           The chatbot says it will then disregard this aspect and asks the user to confirm (yes / no) that this is fine.
    //           This case can be recognized because this.yesnoTrigger is set to "allValues".
    //           Reactions: (YES) do not add any requirements. Move on to next target aspect.
    //                      (NO) We need to ask the user what they want instead. Set the "no" dialogue turn and wait for new user input.

    // first, we add the answer to the chat so that users see what they have clicked.
    this.sendMessage(_yn);

    // now do the case distinction

    // case (1): There was only one possible value for the aspect and the user is asked to confirm that this value is acceptable.
    //           (YES) Add to requirements and move on.
    //           (NO)  Then we need to change an earlier requirement. Check if we can go one target back (i.e., if the current target is not the first or second target in the list)
    //                If possible: inform the user that we will revisit an earlier requirement then. Go one target back, delete the requirement for that aspect, and repeat the steps there.
    //                If not possible: This situation should not happen, but in case it does: inform user. Set the redProblem flag.
    if (this.yesnoTrigger == "singleValue") {
      if (_yn == "yes") {
        let _req = [this.currentChoicesSet[0]];
        this.addRequirements(_req);
        if (this.botReplyBehavior == 'acknowledge' || this.botReplyBehavior == 'repeat' || this.botReplyBehavior == 'rephrase') {
          let dT = new DialogueTurn("bot", "Okay, sounds good.", false, "none", this.currentTarget);
          this.addDialogueTurn(dT);
        }
        this.bubbleTexts[this.currentTarget] = _req[0].toString();
        this.addRequirements_toSoSciTexts({ 'sosciNeeds': _req[0].toString() });
        this.addRequirements_toBubbleTexts({ 'repeatNeeds': 'You were okay with: ' + _req[0].toString() });
        this.setNextTarget();
        this.dialogueFlow();
      } else if (_yn == "no") {
        if (this.targetOrder.indexOf(this.currentTarget) >= 3) {
          let dT = new DialogueTurn("bot", "Okay, then let's revisit what you said before.", false, "none", this.currentTarget);
          this.addDialogueTurn(dT);
          this.setPreviousTarget();
          this.deleteRequirements(this.currentTarget);
          this.dialogueFlow();
        } else {
          this.raiseRedProblem();
        }
      } else {
        console.log("ERROR IN YES NO INPUT! faulty input:" + _yn, 'color: red')
        this.raiseRedProblem();
      }
    }

    // case (2): The user does not know which requirements are fitting and the chatbot has proposed the default values. The user is asked to confirm the proposed defaut values.
    //           (YES) Add default values to requirements and move on to next target aspect.
    //           (NO)  We need to ask the user what they want instead. Set the "no" dialogue turn and wait for new user input.
    if (this.yesnoTrigger == "defaultValues") {
      if (_yn == "yes") {
        let _req = [useValueRecs[this.currentUsage][this.currentTarget]["min"], useValueRecs[this.currentUsage][this.currentTarget]["max"]];
        this.addRequirements(_req);
        if (this.botReplyBehavior == 'acknowledge' || this.botReplyBehavior == 'repeat' || this.botReplyBehavior == 'rephrase') {
          let dT = new DialogueTurn("bot", "Noted.", false, "none", this.currentTarget);
          this.addDialogueTurn(dT);
        }
        this.bubbleTexts[this.currentTarget] = _req[0].toString() + "-" + _req[1].toString();
        this.addRequirements_toSoSciTexts({ 'sosciNeeds': this.bubbleTexts[this.currentTarget] });
        this.addRequirements_toBubbleTexts({ 'repeatNeeds': 'You were okay with: ' + this.bubbleTexts[this.currentTarget] });
        this.setNextTarget();
        this.dialogueFlow();
      } else if (_yn == "no") {
        for (let dT of chatbotMessages[this.currentTarget]["no"]) {
          this.addDialogueTurn(dT);
        }
      } else {
        console.log("ERROR IN YES NO INPUT! faulty input:" + _yn, 'color: red')
      }
    }

    // case (3):
    if (this.yesnoTrigger == "allValues") {
      if (_yn == "yes") {
        this.setNextTarget();
        this.dialogueFlow();
      } else if (_yn == "no") {

      } else {
        console.log("ERROR IN YES NO INPUT! faulty input:" + _yn, 'color: red')
        this.raiseRedProblem();
      }
    }

    // the current yes / no trigger was processed, so reset the trigger.
    this.yesnoTrigger = null;

  } // --- end userInput_yesno()


  // handles processing of new requirements:
  // adding it to the requirements array that is later used to build the filter request
  // adding the (string) text itself to sent to sosci if needed
  addRequirements(_req: Array<number | string>): void {

    // second, add the new requirements to the official requirements storage
    this.requirements[this.currentTarget] = _req;
    console.log("CURRENT REQUIREMENTS:", this.requirements);

  }

  addRequirements_toSoSciTexts(_autoPositives: any): void {

    if (typeof _autoPositives['sosciNeeds'] === "string" && _autoPositives['sosciNeeds'].length > 0) {
      this.requirementsFullText[this.currentTarget] = _autoPositives['sosciNeeds'];
    } else {
      console.log("no fulltext requirements added!", 'color: red')
    }
    if (this.devMode == "testing") console.log("SOSCI TEXTS:", this.requirementsFullText)

  } // --- end addRequirements_toSoSciTexts()


  addRequirements_toBubbleTexts(_autoPositives: any): void {

    this.bubbleTexts[this.currentTarget] = _autoPositives['repeatNeeds'];

    if (this.devMode == "testing") console.log("BUBBLE TEXTS:", this.bubbleTexts)

  } // --- end addRequirements_toBubbleTexts()


  reactToRequirements(_autoPositives: any): void {

    if (this.botReplyBehavior == 'acknowledge') {
      this.addDialogueTurn(new DialogueTurn("bot", _autoPositives['acknowledge'], false, "none", this.currentTarget));
    } else if (this.botReplyBehavior == 'repeat') {
      this.addDialogueTurn(new DialogueTurn("bot", _autoPositives['repeat'], false, "none", this.currentTarget));
    } else if (this.botReplyBehavior == 'rephrase') {
      this.addDialogueTurn(new DialogueTurn("bot", _autoPositives['rephrase'], false, "none", this.currentTarget));
    }

  } // --- end reactToRequirements()


  // treats open text input from the user, e.g., answers to questions.
  async userInput_open(_m: string): Promise<void> {

    // SUMMARY
    //

    // first, we add the answer to the chat so that users see what they have clicked.
    this.sendMessage(_m);

    // display waiting message so that the user knows that things are happening
    this.addWaitMessage();

    // then, we treat the user input.
    await firstValueFrom(await this.processInputText(_m)).then(async (rData) => {
      console.log('RESPONSE userInput_open():', rData);

      this.deleteWaitMessage();

      if (!rData["failure"] && rData.hasOwnProperty(this.currentTarget + '_text_autoPositives')) {
        // case (1): keyfacts could be extracted

        // only for purpose: set usage type for targeted dialogues!
        if (this.currentTarget === "purpose") this.currentUsage = rData[this.currentTarget];

        // save newly identified requirement
        this.addRequirements(rData[this.currentTarget]);
        // chatbot reaction to input
        this.reactToRequirements(rData[this.currentTarget + '_text_autoPositives']);
        // save explanations on requirements for presentation phase later
        this.addRequirements_toBubbleTexts(rData[this.currentTarget + '_text_autoPositives']);
        // save requirements for returning them to sosci later
        this.addRequirements_toSoSciTexts(rData[this.currentTarget + '_text_autoPositives']);

        this.setNextTarget();
        this.dialogueFlow();

        return;

      } else if (rData["not_important"]) {
        // case (2): user does not have requirements

        // set yes no trigger so that we later know what to do with "yes" or "no"
        this.yesnoTrigger = "allValues";
        // ask follow-up question if the user is fine with not setting any requirements for this aspect then
        for (let dT of chatbotMessages[this.currentTarget]["notImportant"]) {
          this.addDialogueTurn(dT);
        }
        return;

      } else if (rData["unknown"]) {
        // case (3): user does not know what requirements are right for them

        // set yes no trigger so that we later know what to do with "yes" or "no"
        this.yesnoTrigger = "defaultValues";
        // let chatbot recommend values and ask if those values are okay
        for (let dT of chatbotMessages[this.currentTarget]["unsure"]) {
          this.addDialogueTurn(dT);
        }
        return;

      } else {
        // case (4): we could not deal with the response
        // For example, because the user gave a reply from which we could not identify any keyfact or intent.

        for (let dT of chatbotMessages[this.currentTarget]["noKeyfacts"]) {
          let idx = this.getRandomInt(0, dT.length);
          this.addDialogueTurn(dT[idx]);
        }
        return;

      }
    });

  } // --- end userInput_open()


  // this adds the user's message to the chat
  sendMessage(_m: string): void {

    if (_m.length > 0) {
      this.addDialogueTurn(new DialogueTurn("user", _m));
      this.inputMessage = "";
      this.isInputEmpty = true;
    }

  } // --- end sendMessage()


  // utility function to clean incoming strings
  cleanString(_m: string): string {

    var clean_m = _m;
    clean_m = clean_m.replace("-", "~");
    clean_m = clean_m.replace(" ", "+");
    clean_m = clean_m.replace(/[^a-zA-Z0-9~+]/g, "");
    return clean_m

  } // --- end cleanString()

  // --------------------------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------- SERVER REQUESTS

  // Sends a request to the DV server, asking for the minimum, maximum, and average value for the current aspect in the current product selection.
  async getValueChoices() {

    console.log("REQUEST getValueChoices", this.currentTarget)

    if (this.filtertypes[this.currentTarget] === 'interval') {
      // NUMERIC ATTRIBUTES
      return this.http.post<any>(this.db_server + '/possibleAspectValues', {
        'IDs': this.laptopRecsIDs,
        'aspect': this.filterfields[this.currentTarget],
        'dataset': 'amazon'
      })
    } else {
      // CATEGORICAL ATTRIBUTES
      return this.http.post<any>(this.db_server + '/possibleAspectValues', {
        'IDs': this.laptopRecsIDs,
        'aspect': this.filterfields[this.currentTarget],
        'dataset': 'amazon'
      })
    }

  } // --- end getValueChoices()


  // Sends a request to the DB server, asking for the top-k results of the result list as for the current requirements (saved in this.requirements)
  async getResultList() {

    console.log("REQUEST getResultList", this.currentTarget)

    const _flaskfilters = this.buildFilterRequest();
    return this.http.post<any>(this.db_server + '/filter', {
      'dataset': 'amazon',
      'filter': _flaskfilters,
      'facets': [],
      'sort_by': "ratingAvg_filter",
      'sort_by_order': "descending",
      'top_k': 1
    })

  } // --- end getResultList()


  // Sends a request to the NLU server, asking to interpret a given NL input text
  async processInputText(_text: string) {

    console.log("REQUEST processInputText", this.currentTarget)

    return this.http.post<any>(this.nlu_server + "/aspectneeds?aspect=" + this.currentTarget + "&ruleKeyfacts&autoPositives&replaceCategories&purposeForAnswer=" + this.currentUsage, {
      text: _text,
      user_id: this.sosciCaseToken
    })

  } // --- end processInputText()


  // Sends logging request for the current log file to the NLU server
  // re-tries 3 times, in case server does not respond immediately
  sendLogsToServer(response: string): void {

    console.log("REQUEST sendLogsToServer", this.currentTarget)

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

  } // --- end sendLogsToServer()

  // --------------------------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------- DIALOGUE MANAGER UTILS

  // handles category red alerts - problems that are bad enough to interrupt the whole task
  raiseRedProblem(): void {

    this.redProblem = true;
    let dT = new DialogueTurn("bot", "Something is going wrong on the server side. I cannot resolve this issue at the moment. Please see your options in the menu on the righthandside.", false, "none", this.currentTarget);
    this.addDialogueTurn(dT);

  } // --- end raiseRedProblem()


  // adds the "typing" visualisation to chat
  addWaitMessage(): void {

    if (this.dialogueHistory.length <= 0 || this.dialogueHistory[this.dialogueHistory.length - 1].target != 'wait') {
      this.dialogueHistory.push(new DialogueTurn("bot", "", false, "none", "wait"));
    }
    if (this.devMode == "testing") console.log("added waiting message")

  } // --- end addWaitMessage()


  // deletes all "typing" visualisations from chat
  deleteWaitMessage(): void {

    let cleanDialogueHistory: Array<DialogueTurn> = [];
    // basically iterates over whole dialogue history and only copies non-waiting messages
    for (let _t of this.dialogueHistory) {
      if (_t.target != 'wait') cleanDialogueHistory.push(_t);
    }
    //if (this.devMode == "testing") console.log("deleted waiting messages:", this.dialogueHistory.length - cleanDialogueHistory.length)
    // replaces official dialogue history with the cleansed dialogue
    this.dialogueHistory = cleanDialogueHistory;

  } // --- end deleteWaitMessage()


  setNextTarget(): void {

    // can only go to the next target if the current target is not the last one in the list!
    if (this.targetOrder.indexOf(this.currentTarget) < this.targetOrder.length - 1) {
      this.currentTarget = this.targetOrder[this.targetOrder.indexOf(this.currentTarget) + 1];
    }
    if (this.devMode == "testing") console.log("new (next) TARGET set:", this.currentTarget)

  } // --- end setNextTarget()


  setPreviousTarget(): void {

    // can only go to the previous target if the current target is not already the first one in the list!
    if (this.targetOrder.indexOf(this.currentTarget) > 0) {
      this.currentTarget = this.targetOrder[this.targetOrder.indexOf(this.currentTarget) - 1];
    }
    if (this.devMode == "testing") console.log("new (previous) TARGET set:", this.currentTarget)

  } // --- end setPreviousTarget()


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

    // replace placeholder values with current context information
    if (_turn["message"].includes("XXXMIN")) _turn["message"] = _turn["message"].replace('XXXMIN', "" + this.currentMin)
    if (_turn["message"].includes("XXXMAX")) _turn["message"] = _turn["message"].replace('XXXMAX', "" + this.currentMax)
    if (_turn["message"].includes("XXXMED")) _turn["message"] = _turn["message"].replace('XXXMED', "" + this.currentMed)
    if (_turn["message"].includes("XXXONLYVAL")) _turn["message"] = _turn["message"].replace('XXXONLYVAL', "" + this.currentChoicesSet[0].toString())
    if (_turn["message"].includes("XXXNUM")) _turn["message"] = _turn["message"].replace('XXXNUM', "" + this.numLaptopRecs)
    if (_turn["message"].includes("XXXUSEMIN")) _turn["message"] = _turn["message"].replace('XXXUSEMIN', "" + useValueRecs[this.currentUsage][this.currentTarget]["min"])
    if (_turn["message"].includes("XXXUSEMAX")) _turn["message"] = _turn["message"].replace('XXXUSEMAX', "" + useValueRecs[this.currentUsage][this.currentTarget]["max"])
    if (_turn["message"].includes("XXXUSAGE")) _turn["message"] = _turn["message"].replace('XXXUSAGE', "" + this.currentUsage)
    if (_turn["message"].includes("XXXTARGET")) _turn["message"] = _turn["message"].replace('XXXTARGET', "" + this.currentTarget)
    // choices is a bit more complicated because we first have to stringify the list of possible values
    if (_turn["message"].includes("XXXCHOICES")) {
      let choices = ""
      for (let choice of this.currentChoicesSet) {
        choices += choice + ", "
      }
      choices = choices.substring(0, choices.length - 2);
      _turn["message"] = _turn["message"].replace('XXXCHOICES', "" + choices)
    }
    return _turn

  } // --- end dialoguePreprocess()


  addDialogueTurn(_turn: DialogueTurn): void {

    // Take care of the personalization and adaptive context information
    _turn = this.dialoguePreprocess(_turn);

    // add to dialogue history
    this.dialogueHistory.push(_turn);
    console.log("%c" + _turn["message"], 'color: green')

    // add to log
    this.log['dialogue'].push(_turn.outputify());

  } // --- end addDialogueTurn()

  // --------------------------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------- MISC


  buildFilterRequest(): any {
    let filterRequest = [];
    for (var key in this.requirements) {
      const value: any = this.requirements[key];
      // if (this.devMode == "testing") console.log("buildFilterRequest of:", key, value);
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
    if (this.devMode == "testing") console.log("build filter request:", filterRequest);
    return filterRequest;
  }


  sendBackToSurvey(response: string): void {
    // Display the snackbar
    this.snackbarMessage = "Thank you! Redirecting you to the survey...";

    // Wait with the redirect to shortly display the snackbar
    setTimeout(() => {
      this.redirectToSosci();
    }, 3000); // Display the snackbar for 3 seconds

    // Call the logLogs function
    this.logLogs(response);
  }

  // this function gets called after the snackbar was displayed for 3 seconds
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

  deleteRequirements(_target: string): void {
    this.requirements[_target] = [];
    this.requirementsFullText[_target] = "";
    this.bubbleTexts[_target] = null;
  }


  opencloseScenario(): void {
    this.showScenario = !this.showScenario;
  }


  restartDialogue(): void {
    this.restarts += 1;
    const currTime = new Date(Date.now());
    this.convStartTime = currTime;
    this.dialogueHistory = [];
    this.backendTargets = ["purpose", "price", "display", "storage", "ram", "battery"];
    this.currentTarget = this.targetOrder[0];
    this.currentUsage = "unknown";
    console.log("currentUsage", this.currentUsage);
    this.currentMin = -1;
    this.currentMax = -1;
    this.currentMed = -1;
    this.currentCats = [];
    this.inputMessage = "";
    this.bubbleTexts = { "purpose": null, "price": null, "display": null, "storage": null, "ram": null, "battery": null };
    this.requirements = { "purpose": [], "price": [], "display": [], "storage": [], "ram": [], "battery": [] };
    this.requirementsFullText = { "purpose": "", "price": "", "display": "", "storage": "", "ram": "", "battery": "" };
    this.log = { 'dialogue': [] };
    this.logTrials = 0;
    this.loggingInProcess = false;
    this.laptopRecs = [];
    this.numLaptopRecs = 0;
    this.laptopRecsIDs = [];

    this.resizeChatbox('80vh');
    this.dialogueFlow();
  }

  // The function beforeSameAgent(i) is no longer needed and was replaced by isLastBotMessage(i)
  /*
  beforeSameAgent(_i: number): boolean {
    if (_i > 0 && _i - 1 < this.dialogueHistory.length) {
      if (this.dialogueHistory[_i].agent == this.dialogueHistory[_i - 1].agent) {
        return true;
      }
    }
    return false;
  }
  */

  logLogs(response: string): void {
    /**
     * Sends log data to server
     */

    // Parse the response string back into an object
    const responseObject = JSON.parse(response);

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
    this.log['restarts'] = this.restarts;
    this.log['dialogueHistory'] = this.dialogueHistory;

    // Log the option and feedback
    this.log['option'] = responseObject.option;
    this.log['feedback'] = responseObject.feedback;

    if (this.devMode == "testing") console.log("Log File:", this.log);

    this.sendLogsToServer(response);
  }


  // --------------------------------------------------------------- UTILITIES

  roundTo(_n: number, _roundTo: number = 0, _mode: string = "math"): number {
    // scale up / down
    if (_roundTo > 0) {
      _n = _n * _roundTo * 10;
    } else if (_roundTo < 0) {
      _n = _n / (_roundTo * 10);
    }
    // round
    if (_mode == "ceil") {
      _n = Math.ceil(_n);
    } else if (_mode == "floor") {
      _n = Math.floor(_n);
    } else {
      _n = Math.round(_n);
    }
    // scale back to normal
    if (_roundTo > 0) {
      _n = _n / (_roundTo * 10);
    } else if (_roundTo < 0) {
      _n = _n * (_roundTo * 10);
    }
    return _n
  }

  roundShowRating(_rating: number): number {
    let r = Math.round(_rating * 100) / 100;
    return r
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
    if (message.length < 35) {
      w = 70 + message.length * 5;
    }
    return { 'width': w + 'px', 'height': h + 'px' };
  }

  protected readonly JSON = JSON;
  protected readonly document = document;
}
