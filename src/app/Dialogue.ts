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
      [new dialogueTurn("bot","Sorry, can you explain that again?", false, "none", "purpose"),
        new dialogueTurn("bot","I did not get that, can you rephrase it?", false, "none", "purpose"),
        new dialogueTurn("bot","I did not get that. What do you mean?", false, "none", "purpose"),
        new dialogueTurn("bot","I am not sure what you mean, can you explain again that please?", false, "none", "purpose"),
      ],
      [new dialogueTurn("bot","Many people use their laptop for things like document editing, browsing the internet, gaming, and so on. What about you?", true, "open", "purpose")
      ]
    ],
    "unsure": [
      new dialogueTurn("bot","If you are unsure which laptop type you need, we can start with simple, basic laptops.", false, "none", "purpose"),
      new dialogueTurn("bot","That is enough for most use cases. Is that fine with you?", true, "yesno", "purpose"),
    ],
    "notImportant": [
      new dialogueTurn("bot","I have understood from your answer is that you do not have specific tasks. That's no problem.", false, "none", "purpose"),
      new dialogueTurn("bot","In these cases, I usually recommend to start with a basic laptop. Is that fine with you? (We also have advanced or gaming laptops)", true, "yesno", "purpose"),
    ],
    "no": [
      new dialogueTurn("bot","Okay, can you explain to me again what tasks you need your laptop for?", true, "open", "purpose"),
    ]
  },
  "price": {
    "start": [
      new dialogueTurn("bot","What were you thinking of in terms of price?", true, "open", "price"),
    ],
    "noKeyfacts": [
      [new dialogueTurn("bot","Sorry, can you explain that again?", false, "none", "price"),
        new dialogueTurn("bot","I did not get that, can you rephrase it?", false, "none", "price"),
        new dialogueTurn("bot","I did not get that. What do you mean?", false, "none", "price"),
        new dialogueTurn("bot","I am not sure what you mean, can you explain that again please?", false, "none", "price"),
      ],
      [new dialogueTurn("bot","Most laptops cost around 500 pounds.", true, "open", "price"),
        new dialogueTurn("bot","Many people need a laptop for around 500 pounds.", true, "open", "price"),
      ],
    ],
    "unsure": [
      new dialogueTurn("bot","If you are unsure which price point is right for you, I recommend laptops between 250 and 600 pounds.", false, "none", "price"),
      new dialogueTurn("bot","That is a price that most people are happy with. Does that work for you?", true, "yesno", "price"),
    ],
    "notImportant": [
      new dialogueTurn("bot","What I have understood is that price is not too important for you.", false, "none", "price"),
      new dialogueTurn("bot","In that case, I am going to leave that open for now and make sure that the laptop meets your other requirements. Is that fine with you?", true, "yesno", "price"),
    ],
    "no": [
      new dialogueTurn("bot","Okay, then what price point were you thinking of?", true, "open", "price"),
    ]
  },
  "battery": {
    "start": [
      new dialogueTurn("bot","What are your requirements on battery life?", true, "open", "battery"),
    ],
    "noKeyfacts": [
      [new dialogueTurn("bot","Sorry, can you explain that again?", false, "none", "battery"),
        new dialogueTurn("bot","I did not get that, can you rephrase it?", false, "none", "battery"),
        new dialogueTurn("bot","I did not get that. What do you mean?", false, "none", "battery"),
        new dialogueTurn("bot","I am not sure what you mean, can you explain that again please?", false, "none", "battery"),
      ],
      [new dialogueTurn("bot","Most laptop batteries last for around 8 hours.", true, "open", "battery"),
        new dialogueTurn("bot","Many users want their laptops to last at least 8 hours.", true, "open", "battery"),
      ],
    ],
    "unsure": [
      new dialogueTurn("bot","If you are unsure which battery life you need, I recommend anything over 6 hours of battery life.", false, "none", "battery"),
      new dialogueTurn("bot","That is enough for most people. Does that work for you?", true, "yesno", "battery"),
    ],
    "notImportant": [
      new dialogueTurn("bot","I have understood that the battery is not too important for you.", false, "none", "battery"),
      new dialogueTurn("bot","I will not pay too much attention to the battery then. Does that work for you?", true, "yesno", "battery"),
    ],
    "no": [
      new dialogueTurn("bot","Okay. Can you explain again how long you want the battery to last?", true, "open", "battery"),
    ]
  },
  "storage": {
    "start": [
      new dialogueTurn("bot","How much hard drive storage do you need?", true, "open", "storage"),
    ],
    "noKeyfacts": [
      [new dialogueTurn("bot","Sorry, can you explain that again?", false, "none", "storage"),
        new dialogueTurn("bot","I did not get that, can you please rephrase it?", false, "none", "storage"),
        new dialogueTurn("bot","I did not get that. What do you mean?", false, "none", "storage"),
        new dialogueTurn("bot","I am not sure what you mean, can you explain that again please?", false, "none", "storage"),
      ],
      [new dialogueTurn("bot","Most laptops have a hard drive size between 500 and 1000 GB.", true, "open", "storage"),
        new dialogueTurn("bot","Many users want the hard drive size to be between 500GB and 1000GB.", true, "open", "storage"),
      ],
    ],
    "unsure": [
      new dialogueTurn("bot","If you are unsure what the correct storage size is, I can look for laptops with 250GB to 1TB.", false, "none", "storage"),
      new dialogueTurn("bot","That is a size that most people are happy with. Does that work for you?", true, "yesno", "storage"),
    ],
    "notImportant": [
      new dialogueTurn("bot","What I have understood is that the hard drive size does not matter to you.", false, "none", "storage"),
      new dialogueTurn("bot","I will not look for a specific storage size then. Is that fine with you?", true, "yesno", "storage"),
    ],
    "no": [
      new dialogueTurn("bot","Okay. Can you explain again which hard drive size you need?", true, "open", "storage"),
    ]
  },
  "ram": {
    "start": [
      new dialogueTurn("bot","What RAM size do you need?", true, "open", "ram"),
    ],
    "noKeyfacts": [
      [new dialogueTurn("bot","Sorry, can you explain that again?", false, "none", "ram"),
        new dialogueTurn("bot","I did not get that, can you please rephrase it?", false, "none", "ram"),
        new dialogueTurn("bot","I did not get that. What do you mean?", false, "none", "ram"),
        new dialogueTurn("bot","I am not sure what you mean, can you explain that again please?", false, "none", "ram"),
      ],
      [new dialogueTurn("bot","Most laptops have a RAM size of 4GB to 8GB.", true, "open", "ram"),
        new dialogueTurn("bot","Many users want the RAM to be in the range of 4GB to 8GB.", true, "open", "ram"),
      ],
    ],
    "unsure": [
      new dialogueTurn("bot","If you are unsure what the correct RAM size is, I can look for laptops with 4GB to 8GB of RAM.", false, "none", "ram"),
      new dialogueTurn("bot","That is a size that most people are happy with. Is that fine with you?", true, "yesno", "ram"),
    ],
    "notImportant": [
      new dialogueTurn("bot","What I have understood is that the RAM size does not matter to you.", false, "none", "ram"),
      new dialogueTurn("bot","I will not look for a specific RAM size then. Is that fine with you?", true, "yesno", "ram"),
    ],
    "no": [
      new dialogueTurn("bot","Okay. Can you explain again how much RAM you need?", true, "open", "ram"),
    ]
  },
  "display": {
    "start": [
      new dialogueTurn("bot","How big should the display be?", true, "open", "display"),
    ],
    "noKeyfacts": [
      [new dialogueTurn("bot","Sorry, can you explain that again?", false, "none", "display"),
        new dialogueTurn("bot","I did not get that, can you please rephrase it?", false, "none", "display"),
        new dialogueTurn("bot","I did not get that. What do you mean?", false, "none", "display"),
        new dialogueTurn("bot","I am not sure what you mean, can you explain that again please?", false, "none", "display"),
      ],
      [new dialogueTurn("bot","Most laptops have a display abound 15 inches big.", true, "open", "display"),
        new dialogueTurn("bot","Many users want the display to be about 15 inches big.", true, "open", "display"),
      ],
    ],
    "unsure": [
      new dialogueTurn("bot","If you are unsure what the correct display size is, I can look for laptops with 14 to 16 inches displays.", false, "none", "display"),
      new dialogueTurn("bot","That is a size that most people are happy with. Does that work for you?", true, "yesno", "display"),
    ],
    "notImportant": [
      new dialogueTurn("bot","What I have understood is that the display size does not matter to you.", false, "none", "display"),
      new dialogueTurn("bot","I will not look for a specific storage size then. Is that fine with you?", true, "yesno", "display"),
    ],
    "no": [
      new dialogueTurn("bot","Okay. Can you explain again how much storage you need?", true, "open", "display"),
    ]
  },
  "goodbye": {
    "start": [
      new dialogueTurn("bot","Ok, I think I have a few laptops that could work for you.", false, "none", "goodbye"),
      new dialogueTurn("bot","One moment please", false, "none", "goodbye"),
    ]
  }
}
