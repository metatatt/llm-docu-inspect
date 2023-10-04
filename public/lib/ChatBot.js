export class ChatBot {

constructor(){
    this.chatMessages = document.querySelector("#chatDiv");
    this.instructDoc = '' ;
    this.socket = io();
};


async feedInput(cvResult, snipImage){
    this.addText('bot', '...');
    const queryText = "Elaborate on or about: "+cvResult.text

    try {
      const response = await this.callLangChain(queryText);
      this.addText('bot', response.text);
      const event = new Event('receivedGPTResponse')
      window.dispatchEvent(event);
     } catch (error) {
      console.log('There was a problem with the fetch operation:', error.message);
     }
}

async callLangChain(queryText) {
  try {
      const response = await fetch('/openai', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: queryText }),
      });
      
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data from the server.');
      }
      console.log('--bot response--?-', response.message)
      return await response.json();
  } catch (error) {
      throw new Error('An error occurred: ' + error.message);
  }
}


addText(sender, queryText) {
  console.log('mdRes ',queryText)
  const emoji = sender === 'bot' ? "👌" : "&#9986;";
  let containerElement;

  // Check if the #tempContainer element exists
  const tempContainer = document.querySelector("#tempContainer");

  if (sender === 'bot') {
    // If sender is 'bot', use tempContainer if it exists, otherwise create a new one
    containerElement = tempContainer ? tempContainer : document.createElement("div");
    containerElement.id = "tempContainer"
    // Clear the content of the container
    containerElement.innerHTML = "";
    containerElement.className = "talk-bubble tri-right left-in"; // Added this line
  } else {
    // If sender is not 'bot', remove the id from tempContainer if it exists
    if (tempContainer) {
      tempContainer.removeAttribute("id");
    }
    // Create a new container element
    containerElement = document.createElement("div");
    containerElement.className = "talk-bubble tri-right"; // Added this line
    containerElement.style.cssText = "background-color: transparent; border: 1px solid grey;";
  }

  const talkText = document.createElement("div"); // Added this line
  talkText.className = "talktext"; // Added this line
  talkText.innerHTML = `<span class="emoji-styling">${emoji}</span>`;
  containerElement.appendChild(talkText); // Added this line

  const parsedContent = this.commitParser(queryText)
  const chatMessage = this.markupChatMessage(parsedContent)
  containerElement.appendChild(chatMessage)

  this.chatMessages.appendChild(containerElement);
  this.chatMessages.appendChild(document.createElement("br"));
  this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

  this.addTextConsole(sender, parsedContent);

}
commitParser(content) {
  const results = [];
  const sections = content.split('==== END DIAGRAM ====').map(s => s.trim());

  sections.forEach(section => {
      if (section.includes('==== BEGIN DIAGRAM ====')) {
          const diagramContent = section.split('==== BEGIN DIAGRAM ====').pop().trim();
          results.push({ type: 'diagram', content: diagramContent });
          
          const textContentBeforeDiagram = section.split('==== BEGIN DIAGRAM ====').shift().trim();
          if (textContentBeforeDiagram) {
              results.unshift({ type: 'text', content: textContentBeforeDiagram });
          }
      } else if (section) {
          results.push({ type: 'text', content: section });
      }
  });

  return results;
}


markupChatMessage(parsedContent) {
  const chatContainer = document.createElement('div');

  parsedContent.forEach(item => {
      const element = document.createElement(item.type === 'text' ? 'div' : 'canvas');
      if (item.type === 'text') {
          element.innerText = item.content;
      } else {
          element.style.display = "block";  // Set canvas to block
          element.style.margin = "auto";    // Center it horizontally
          nomnoml.draw(element, item.content);
      }
      chatContainer.appendChild(element);
  });

  return chatContainer;
}



  addTextConsole(sender, parsedContent){
    const stationId = document.getElementById('gridText').textContent;

    const log = {
      gridId: stationId,
      sender: sender,
      content: parsedContent  
    };

    this.socket.emit('botLog', log);
}


}