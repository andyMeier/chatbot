import { DialogueTurn } from './DialogueTurns';

export var chatbotMessages: any = {
  "greeting": {
    "start": [
      new DialogueTurn("bot", "Hi there! I'm Cleo, your digital product advisor. \uD83D\uDE0A"),
      new DialogueTurn("bot", "I'm here to find a suitable laptop for you. Let's go through a few questions to help me understand your preferences..."),
    ],
  },
  "purpose": {
    "start": [
      new DialogueTurn("bot","Let's start: What do you usually use your laptop for?", true, "open", "purpose"),
    ],
    "noKeyfacts": [
      [new DialogueTurn("bot","Sorry, can you explain that again?", false, "none", "purpose"),
        new DialogueTurn("bot","I did not get that, can you rephrase it?", false, "none", "purpose"),
        new DialogueTurn("bot","I did not get that. What do you mean?", false, "none", "purpose"),
        new DialogueTurn("bot","I am not sure what you mean, can you explain again that please?", false, "none", "purpose"),
      ],
      [new DialogueTurn("bot","Many people use their laptop for things like document editing, browsing the internet, gaming, and so on. What about you?", true, "open", "purpose")
      ]
    ],
    "singleValue": [
      new DialogueTurn("bot","All laptops I can offer you today are XXXONLYVAL laptops. Is that okay?", true, "yesno", "purpose"),
    ],
    "fewValues": [
      new DialogueTurn("bot","Laptops I have in store are either for: XXXCHOICES purposes. What type of laptop would work for you?", true, "open", "purpose"),
    ],
    "unsure": [
      new DialogueTurn("bot","If you are unsure which laptop type you need, we can start with simple, basic laptops.", false, "none", "purpose"),
      new DialogueTurn("bot","That is enough for most use cases. Is that fine with you?", true, "yesno", "purpose"),
    ],
    "notImportant": [
      new DialogueTurn("bot","I have understood from your answer is that you do not have specific tasks. That's no problem.", false, "none", "purpose"),
      new DialogueTurn("bot","In these cases, I usually recommend to start with a basic laptop. Is that fine with you? (We also have advanced or gaming laptops)", true, "yesno", "purpose"),
    ],
    "no": [
      new DialogueTurn("bot","Okay, can you explain to me again what tasks you need your laptop for?", true, "open", "purpose"),
    ]
  },
  "price": {
    "start": [
      new DialogueTurn("bot","What were you thinking of in terms of price?", false, "none", "price"),
      //new DialogueTurn("bot","We have laptops from XXXMIN to XXXMAX pounds, most are around XXXMED.", false, "none", "price"),
      new DialogueTurn("bot","XXXUSAGEB laptops typically cost XXXUSEMIN - XXXUSEMAX pounds.", true, "open", "price"),
    ],
    "valueHint": [
      new DialogueTurn("bot","We have laptops from XXXMIN to XXXMAX pounds, most are around XXXMED.", false, "none", "price"),
    ],
    "noKeyfacts": [
      [new DialogueTurn("bot","Sorry, can you explain that again?", false, "none", "price"),
        new DialogueTurn("bot","I did not get that, can you rephrase it?", false, "none", "price"),
        new DialogueTurn("bot","I did not get that. What do you mean?", false, "none", "price"),
        new DialogueTurn("bot","I am not sure what you mean, can you explain that again please?", false, "none", "price"),
      ],
      [new DialogueTurn("bot","We have laptops from XXXMIN to XXXMAX pounds. Most laptops cost around XXXMED pounds.", true, "open", "price"),
        new DialogueTurn("bot","We have laptops from XXXMIN to XXXMAX pounds. Many people need a laptop for around XXXMED pounds.", true, "open", "price"),
      ],
    ],
    "singleValue": [
      new DialogueTurn("bot","I only have laptops around XXXONLYVAL pounds left. Is that price okay?", true, "yesno", "price"),
    ],
    "fewValues": [
      new DialogueTurn("bot","The laptops I can offer you have the following price points: XXXCHOICES. How much do you want to spent on a new laptop?", true, "open", "price"),
    ],
    "unsure": [
      new DialogueTurn("bot","If you are unsure which price point is right for you, I recommend laptops between XXXUSEMIN and XXXUSEMAX pounds for XXXUSAGEA tasks.", false, "none", "price"),
      new DialogueTurn("bot","That is a price that most people that want to do XXXUSAGEA tasks are happy with. Does that work for you?", true, "yesno", "price"),
    ],
    "notImportant": [
      new DialogueTurn("bot","What I have understood is that price is not too important for you.", false, "none", "price"),
      new DialogueTurn("bot","In that case, I am going to leave that open for now and make sure that the laptop meets your other requirements. Is that fine with you?", true, "yesno", "price"),
    ],
    "no": [
      new DialogueTurn("bot","Okay, then what price point were you thinking of?", true, "open", "price"),
    ]
  },
  "battery": {
    "start": [
      new DialogueTurn("bot","Got it. To conclude: What are your requirements on battery life?", false, "none", "battery"),
      //new DialogueTurn("bot","We have laptops that last between XXXMIN and XXXMAX hours, most last around XXXMED hours.", false, "none", "battery"),
      new DialogueTurn("bot","For XXXUSAGEA laptops, people usually want a battery that runs for at least XXXUSEMIN hours.", true, "open", "battery"),
    ],
    "valueHint": [
      new DialogueTurn("bot","We have laptops that last between XXXMIN and XXXMAX hours, most last around XXXMED hours.", false, "none", "battery"),
    ],
    "noKeyfacts": [
      [new DialogueTurn("bot","Sorry, can you explain that again?", false, "none", "battery"),
        new DialogueTurn("bot","I did not get that, can you rephrase it?", false, "none", "battery"),
        new DialogueTurn("bot","I did not get that. What do you mean?", false, "none", "battery"),
        new DialogueTurn("bot","I am not sure what you mean, can you explain that again please?", false, "none", "battery"),
      ],
      [new DialogueTurn("bot","We have laptops that last between XXXMIN and XXXMAX hours. Most laptop batteries last for around XXXMED hours.", true, "open", "battery"),
        new DialogueTurn("bot","We have laptops that last between XXXMIN and XXXMAX hours. Many users want their laptops to last at least XXXMED hours.", true, "open", "battery"),
      ],
    ],
    "singleValue": [
      new DialogueTurn("bot","All remaining laptops I can offer you have a battery life of XXXONLYVAL hours. Is that okay?", true, "yesno", "battery"),
    ],
    "fewValues": [
      new DialogueTurn("bot","I have laptops with XXXCHOICES hours of battery life. How much battery life do you need?", true, "open", "battery"),
    ],
    "unsure": [
      new DialogueTurn("bot","If you are unsure which battery life you need, I recommend anything over XXXUSEMIN hours of battery life.", false, "none", "battery"),
      new DialogueTurn("bot","That is enough for most XXXUSAGEA tasks. Does that work for you?", true, "yesno", "battery"),
    ],
    "notImportant": [
      new DialogueTurn("bot","I have understood that the battery is not too important for you.", false, "none", "battery"),
      new DialogueTurn("bot","I will not pay too much attention to the battery then. Does that work for you?", true, "yesno", "battery"),
    ],
    "no": [
      new DialogueTurn("bot","Okay. Can you explain again how long you want the battery to last?", true, "open", "battery"),
    ]
  },
  "storage": {
    "start": [
      new DialogueTurn("bot","How much hard drive storage do you need?", false, "none", "storage"),
      //new DialogueTurn("bot","We have laptops with storage between XXXMIN GB and XXXMAX GB, most have XXXMED GB storage.", false, "none", "storage"),
      new DialogueTurn("bot","For XXXUSAGEA purposes, most users prefer at least XXXUSEMIN GB storage.", true, "open", "storage"),
    ],
    "valueHint": [
      new DialogueTurn("bot","We have laptops with storage between XXXMIN GB and XXXMAX GB, most have XXXMED GB storage.", false, "none", "storage"),
    ],
    "noKeyfacts": [
      [new DialogueTurn("bot","Sorry, can you explain that again?", false, "none", "storage"),
        new DialogueTurn("bot","I did not get that, can you please rephrase it?", false, "none", "storage"),
        new DialogueTurn("bot","I did not get that. What do you mean?", false, "none", "storage"),
        new DialogueTurn("bot","I am not sure what you mean, can you explain that again please?", false, "none", "storage"),
      ],
      [new DialogueTurn("bot","We have laptops with hard drives between XXXMIN GB and XXXMAX GB. Most laptops have a hard drive size around XXXMED GB.", true, "open", "storage"),
        new DialogueTurn("bot","We have laptops with hard drives between XXXMIN GB and XXXMAX GB. Many users want the hard drive size to be around XXXMEDGB.", true, "open", "storage"),
      ],
    ],
    "singleValue": [
      new DialogueTurn("bot","I only have laptops left with an XXXONLYVALGB storage. Does that work?", true, "yesno", "storage"),
    ],
    "fewValues": [
      new DialogueTurn("bot","I only have laptops left with XXXCHOICES GB of storage. What storage size do you need?", true, "open", "storage"),
    ],
    "unsure": [
      new DialogueTurn("bot","If you are unsure what the correct storage size is, I can look for laptops with XXXUSEMIN GB to XXXUSEMAX GB .", false, "none", "storage"),
      new DialogueTurn("bot","That is a size that most people are happy with for XXXUSAGEA tasks. Does that work for you?", true, "yesno", "storage"),
    ],
    "notImportant": [
      new DialogueTurn("bot","What I have understood is that the hard drive size is not too important for you.", false, "none", "storage"),
      new DialogueTurn("bot","I will not look for a specific storage size then. Is that fine with you?", true, "yesno", "storage"),
    ],
    "no": [
      new DialogueTurn("bot","Okay. Can you explain again which hard drive size you need?", true, "open", "storage"),
    ]
  },
  "ram": {
    "start": [
      new DialogueTurn("bot","What RAM size do you need?", false, "none", "ram"),
      //new DialogueTurn("bot","Our laptops have between XXXMINGB and XXXMAXGB RAM. Most of them have around XXXMEDGB.", false, "none", "ram"),
      new DialogueTurn("bot","XXXUSAGEB tasks typically need XXXUSEMIN GB or more.", true, "open", "ram"),
    ],
    "valueHint": [
      new DialogueTurn("bot","Our laptops have between XXXMINGB and XXXMAXGB RAM. Most of them have around XXXMEDGB.", false, "none", "ram"),
    ],
    "noKeyfacts": [
      [new DialogueTurn("bot","Sorry, can you explain that again?", false, "none", "ram"),
        new DialogueTurn("bot","I did not get that, can you please rephrase it?", false, "none", "ram"),
        new DialogueTurn("bot","I did not get that. What do you mean?", false, "none", "ram"),
        new DialogueTurn("bot","I am not sure what you mean, can you explain that again please?", false, "none", "ram"),
      ],
      [new DialogueTurn("bot","Our laptops have between XXXMINGB and XXXMAXGB RAM. Most laptops have a RAM size around XXXMEDGB.", true, "open", "ram"),
        new DialogueTurn("bot","Our laptops have between XXXMINGB and XXXMAXGB RAM. Many users want the RAM to be around XXXMEDGB.", true, "open", "ram"),
      ],
    ],
    "singleValue": [
      new DialogueTurn("bot","All laptops that match your requirements have XXXONLYVALGB RAM. Is that okay?", true, "yesno", "ram"),
    ],
    "fewValues": [
      new DialogueTurn("bot","I have laptops with these RAM sizes: XXXCHOICES GB. Which ones are okay for you?", true, "open", "ram"),
    ],
    "unsure": [
      new DialogueTurn("bot","If you are unsure what the correct RAM size is, I can look for laptops with XXXUSEMIN GB or more RAM.", false, "none", "ram"),
      new DialogueTurn("bot","That should work for most XXXUSAGEA tasks. Is that fine with you?", true, "yesno", "ram"),
    ],
    "notImportant": [
      new DialogueTurn("bot","What I have understood is that the RAM size is not too important for you.", false, "none", "ram"),
      new DialogueTurn("bot","I will not look for a specific RAM size then. Is that fine with you?", true, "yesno", "ram"),
    ],
    "no": [
      new DialogueTurn("bot","Okay. Can you explain again how much RAM you need?", true, "open", "ram"),
    ]
  },
  "display": {
    "start": [
      new DialogueTurn("bot","How big should the display be?", false, "none", "display"),
      //new DialogueTurn("bot","We have laptops with displays between XXXMIN and XXXMAX inches, most are XXXMED big.", false, "none", "display"),
      new DialogueTurn("bot","XXXUSAGEB laptops often have screens between XXXUSEMIN and XXXUSEMAX inches.", true, "open", "display"),
    ],
    "valueHint": [
      new DialogueTurn("bot","We have laptops with displays between XXXMIN and XXXMAX inches, most are XXXMED big.", false, "none", "display"),
    ],
    "noKeyfacts": [
      [new DialogueTurn("bot","Sorry, can you explain that again?", false, "none", "display"),
        new DialogueTurn("bot","I did not get that, can you please rephrase it?", false, "none", "display"),
        new DialogueTurn("bot","I did not get that. What do you mean?", false, "none", "display"),
        new DialogueTurn("bot","I am not sure what you mean, can you explain that again please?", false, "none", "display"),
      ],
      [new DialogueTurn("bot","I have laptops with displays between XXXMIN and XXXMAX inches. Most laptops have a display around XXXMED inches.", true, "open", "display"),
        new DialogueTurn("bot","I have laptops with displays between XXXMIN and XXXMAX inches. Many users want the display to be around XXXMED inches.", true, "open", "display"),
      ],
    ],
    "singleValue": [
      new DialogueTurn("bot","I only have laptops left with an XXXONLYVAL inches display. Is that okay?", true, "yesno", "display"),
    ],
    "fewValues": [
      new DialogueTurn("bot","I can offer you laptops with the following screen sizes: XXXCHOICES inches. Which ones would work for you?", true,"open", "display"),
    ],
    "unsure": [
      new DialogueTurn("bot","If you are unsure what the correct display size is, I can look for laptops with XXXUSEMIN to XXXUSEMAX inches displays.", false, "none", "display"),
      new DialogueTurn("bot","That is a size that is suitable for most XXXUSAGEA tasks. Does that work for you?", true, "yesno", "display"),
    ],
    "notImportant": [
      new DialogueTurn("bot","What I have understood is that the display size is not too important for you.", false, "none", "display"),
      new DialogueTurn("bot","I will not look for a specific display size then. Is that fine with you?", true, "yesno", "display"),
    ],
    "no": [
      new DialogueTurn("bot","Okay. Can you explain again what display size you need?", true, "open", "display"),
    ]
  },
  "searchOffer": {
    "start": [
      new DialogueTurn("bot","Let's see which laptop I can offer to you.", false, "none", "searchOffer"),
      new DialogueTurn("bot","One moment please...", false, "none", "searchOffer"),
    ]
  },
  "presentOffer": {
    "start": [
      new DialogueTurn("bot","So below the chat I have a laptop for you.", false, "none", "presentOffer"),
      new DialogueTurn("bot","Take your time to check the details and consider whether you would buy the laptop!", false, "none", "presentOffer"),
    ]
  },
  "howmany": {
    "many": [
      new DialogueTurn("bot","We have XXXNUM products that fit your needs.", false, "none", "howmany"),
      new DialogueTurn("bot","We have XXXNUM laptops in store that would be suitable for you.", false, "none", "howmany"),
      new DialogueTurn("bot","We have XXXNUM laptops available that would suit your needs.", false, "none", "howmany"),
      new DialogueTurn("bot","XXXNUM of our products currently match your needs.", false, "none", "howmany")
    ],
    "few": [
      new DialogueTurn("bot","There are only few products that match your criteria. But that is no problem, I still have XXXNUM laptops that might be a good fit.", false, "none", "howmany"),
      new DialogueTurn("bot","Only XXXNUM laptops meet your needs. But you only need one computer, so that could still work.", false, "none", "howmany"),
      new DialogueTurn("bot","Your requirements are quite strict, but I have XXXNUM laptops that might just do the job.", false, "none", "howmany"),
      new DialogueTurn("bot","There are not that many laptops that meet your specific requirements, but let's see. I still have XXXNUM computers that would work for you.", false, "none", "howmany")
    ],
    "none": [
      [new DialogueTurn("bot","Urgh, I don't have a laptop that matches your needs.", false, "none", "howmany"),
        new DialogueTurn("bot","Okay, I do not have any laptop that matches those exact needs.", false, "none", "howmany"),
        new DialogueTurn("bot","I'm sorry, we do not have laptops that tick all your boxes.", false, "none", "howmany"),
        new DialogueTurn("bot","It seems that we do not have a laptop in store that matches your requirements 100%.", false, "none", "howmany")
      ],
      [
        new DialogueTurn("bot","So let's review what you said before.", false, "none", "howmany"),
        new DialogueTurn("bot","Let's go one step back.", false, "none", "howmany")
      ]
    ]
  }
}
