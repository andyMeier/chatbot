export class DialogueTurn {
  agent: string;
  message: string;
  messageReply: boolean;
  messageReplyType: string;
  target: string;
  delayNext: number;

  constructor(agent: string = "bot", message: string = "Hey!", messageReply: boolean = false, messageReplyType: string = "open", target: string = "greeting", delayNext: number = 0) {
    this.agent = agent;
    this.message = message;
    this.messageReply = messageReply;
    this.messageReplyType = messageReplyType;
    this.target = target;
    this.delayNext = delayNext;
  }

  outputify(): any {
    let output: any = {};
    output['agent'] = this.agent;
    output['message'] = this.message;
    output['messageReply'] = this.messageReply;
    output['messageReplyType'] = this.messageReplyType;
    output['target'] = this.target;
    output['delayNext'] = this.delayNext;
    return output
  }


}
