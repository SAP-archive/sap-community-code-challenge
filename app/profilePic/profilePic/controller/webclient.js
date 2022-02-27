const webclientBridge = {
    onMessage: (payload) => {
      payload.messages.forEach(element => {
        if (element.participant.isBot && element.attachment.content.text.startsWith("SENDING AVATAR")) {
          profile = element.attachment.content.text.substring(19)
    	    window.sapcai.webclientBridge.imageeditor.setSrc("https://avatars.services.sap.com/images/" + profile + ".png")
        }
      })
      }
  }
 
  window.sapcai = {
      webclientBridge,
  }

  // # Fill these in for your chatbot
  //
  // const data_expander_preferences = "";
  // const data_channel_id = "";
  // const data_token = "";
