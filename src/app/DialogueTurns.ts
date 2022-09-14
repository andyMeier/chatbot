export class dialogueTurn {
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
}
