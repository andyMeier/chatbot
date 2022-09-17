import { dialogueTurn } from './DialogueTurns';

export var chatbotMessages: any = {
  "greeting": {
    "start": [
      new dialogueTurn("bot", "Hey! We have 865 Laptops. I can help you find laptops that work for you."),
      new dialogueTurn("bot", "I just have a couple of questions:"),
    ],
  },
  "purpose": {
    "start": [
      new dialogueTurn("bot","What do you usually use your laptop for?", true, "open", "purpose"),
    ],
    "noKeyfacts": [
      [new dialogueTurn("bot","Sorry, can you explain again?", false, "none", "purpose"),
        new dialogueTurn("bot","I did not get that, can you rephrase?", false, "none", "purpose"),
        new dialogueTurn("bot","I did not get that. What do you mean?", false, "none", "purpose"),
        new dialogueTurn("bot","I am not sure what you mean, can you explain again please?", false, "none", "purpose"),
      ],
      [new dialogueTurn("bot","Many people use their laptop for things like document editing, browsing the internet, gaming, and so on. What about you?", true, "open", "purpose")
      ]
    ],
    "notImportant": [
      new dialogueTurn("bot","What I understand from your answer is that you do not have specific tasks. That's no problem.", false, "none", "purpose"),
      new dialogueTurn("bot","In those cases, I usually recommend to start with a basic laptop. Is that fine with you? (We also have advanced or gaming laptops)", true, "yesno", "purpose"),
    ],
    "no": [
      new dialogueTurn("bot","Okay, can you explain again what tasks you need your laptop for?", true, "open", "purpose"),
    ]
  },
  "price": {
    "start": [
      new dialogueTurn("bot","What were you thinking of in terms of price?", true, "open", "price"),
    ],
    "noKeyfacts": [
      [new dialogueTurn("bot","Sorry, can you explain again?", false, "none", "price"),
        new dialogueTurn("bot","I did not get that, can you rephrase?", false, "none", "price"),
        new dialogueTurn("bot","I did not get that. What do you mean?", false, "none", "price"),
        new dialogueTurn("bot","I am not sure what you mean, can you explain again please?", false, "none", "price"),
      ],
      [new dialogueTurn("bot","Most laptops cost around 500 pounds.", true, "open", "price"),
        new dialogueTurn("bot","Many people need a laptop around 500 pounds.", true, "open", "price"),
      ],
    ],
    "notImportant": [
      new dialogueTurn("bot","What I understand is that price is not too important for you.", false, "none", "price"),
      new dialogueTurn("bot","In that case, I am going to leave that open for now and make sure that the laptops meet your other requirements. Is that fine with you?", true, "yesno", "price"),
    ],
    "no": [
      new dialogueTurn("bot","Okay, then what price point were you thinking of?", true, "open", "price"),
    ]
  },
  "battery": {
    "start": [
      new dialogueTurn("bot","What are your requirements for the battery?", true, "open", "battery"),
    ],
    "noKeyfacts": [
      [new dialogueTurn("bot","Sorry, can you explain again?", false, "none", "battery"),
        new dialogueTurn("bot","I did not get that, can you rephrase?", false, "none", "battery"),
        new dialogueTurn("bot","I did not get that. What do you mean?", false, "none", "battery"),
        new dialogueTurn("bot","I am not sure what you mean, can you explain again please?", false, "none", "battery"),
      ],
      [new dialogueTurn("bot","Most laptop batteries last for 8 hours.", true, "open", "battery"),
        new dialogueTurn("bot","Many users want their laptop to last at least 8 hours.", true, "open", "battery"),
      ],
    ],
    "notImportant": [
      new dialogueTurn("bot","What I understand is that the battery is not important for you.", false, "none", "battery"),
      new dialogueTurn("bot","I will not pay too much attention to the battery then. Does that work for you?", true, "yesno", "battery"),
    ],
    "no": [
      new dialogueTurn("bot","Okay, then can you explain again how long the battery should last?", true, "open", "battery"),
    ]
  },
  "storage": {
    "start": [
      new dialogueTurn("bot","How much storage do you need?", true, "open", "storage"),
    ],
    "noKeyfacts": [
      [new dialogueTurn("bot","Sorry, can you explain again?", false, "none", "storage"),
        new dialogueTurn("bot","I did not get that, can you please rephrase?", false, "none", "storage"),
        new dialogueTurn("bot","I did not get that. What do you mean?", false, "none", "storage"),
        new dialogueTurn("bot","I am not sure what you mean, can you explain again please?", false, "none", "storage"),
      ],
      [new dialogueTurn("bot","Most laptops have a storage between 500 and 1000 GB.", true, "open", "storage"),
        new dialogueTurn("bot","Many users want the storage to be between 500 GB and 1000GB.", true, "open", "storage"),
      ],
    ],
    "notImportant": [
      new dialogueTurn("bot","What I understand is that the storage size does not matter to you.", false, "none", "storage"),
      new dialogueTurn("bot","I will not look for a specific storage size then. Is that fine with you?", true, "yesno", "storage"),
    ],
    "no": [
      new dialogueTurn("bot","Okay, then can you explain again how much storage you need?", true, "open", "storage"),
    ]
  },
  "goodbye": {
    "start": [
      new dialogueTurn("bot","Ok, I think I have a few laptops that could work for you.", false, "none", "goodbye"),
      new dialogueTurn("bot","One moment please", false, "none", "goodbye"),
    ]
  }
}
