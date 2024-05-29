const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          const replyBox = node.querySelector(
            'div[data-testid="tweetTextarea_0"]'
          );
          if (replyBox) {
            addGPTButton(replyBox);
          }
        }
      });
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

function addGPTButton(replyBox) {
  if (!replyBox.parentElement.querySelector(".gpt-btn")) {
    const gptInformativeButton = document.createElement("button");
    gptInformativeButton.innerText = "Informative";
    gptInformativeButton.className = "gpt-btn";
    gptInformativeButton.onclick = () =>
      generateResponse(replyBox, "informative");
    replyBox.parentElement.appendChild(gptInformativeButton);
    const gptHelpfulButton = document.createElement("button");
    gptHelpfulButton.innerText = "Help";
    gptHelpfulButton.className = "gpt-btn";
    gptHelpfulButton.onclick = () => generateResponse(replyBox, "helpful");
    replyBox.parentElement.appendChild(gptHelpfulButton);
    const gptPositiveButton = document.createElement("button");
    gptPositiveButton.innerText = "Positive";
    gptPositiveButton.className = "gpt-btn";
    gptPositiveButton.onclick = () => generateResponse(replyBox, "positive");
    replyBox.parentElement.appendChild(gptPositiveButton);
    const gptNegativeButton = document.createElement("button");
    gptNegativeButton.innerText = "Negative";
    gptNegativeButton.className = "gpt-btn";
    gptNegativeButton.onclick = () => generateResponse(replyBox, "negative");
    replyBox.parentElement.appendChild(gptNegativeButton);
    const gptFunnyButton = document.createElement("button");
    gptFunnyButton.innerText = "Funny";
    gptFunnyButton.className = "gpt-btn";
    gptFunnyButton.onclick = () => generateResponse(replyBox, "funny");
    replyBox.parentElement.appendChild(gptFunnyButton);
    const gptCuriousButton = document.createElement("button");
    gptCuriousButton.innerText = "Curious";
    gptCuriousButton.className = "gpt-btn";
    gptCuriousButton.onclick = () => generateResponse(replyBox, "curious");
    replyBox.parentElement.appendChild(gptCuriousButton);
  }
}

async function generateResponse(tone) {
  const tweetText = document.querySelectorAll('div[data-testid="tweetText"]')[0]
    .innerText;

  chrome.storage.sync.get("apiKey", (data) => {
    if (data.apiKey) {
      fetchGPTResponse(tweetText, tone, data.apiKey)
        .then(async (response) => {
          // response işleme

          const placeholder = document.querySelector(
            ".public-DraftEditorPlaceholder-root"
          );
          if (placeholder) {
            placeholder.remove();
          }

          const divElement = document.getElementsByClassName(
            "public-DraftStyleDefault-block"
          )[0];

          const spanElement = divElement.querySelector("span");

          const brElement = spanElement.querySelector("br");

          if (brElement) {
            brElement.remove();
          }

          const newSpanElement = document.createElement("span");
          newSpanElement.setAttribute("data-text", "true");

          newSpanElement.innerHTML = "";
          spanElement.appendChild(newSpanElement);

          if (newSpanElement) {
            newSpanElement.focus();
            document.execCommand("insertText", false, response);
          } else {
            console.log("Input alanı bulunamadı.");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      console.log("API key not found.");
    }
  });
}

async function fetchGPTResponse(tweetText, tone, apiKey) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a ghostwriter and reply to the user's tweets by talking directly to the person, you must keep it short, exclude hashtags. The answers you give must be written by a real person on Twitter and must be relevant to the post. It could be support, it could be a question, or it could be an answer to something in the post. Your response tone must be " +
            tone +
            " For potential customers only, you can include ChatFabrica.com (AI-First Customer Services Chatbot) in the response.(if exactly match the case with product) ",
        },
        {
          role: "user",
          content:
            "Tweet: " + tweetText + " Please write a response to the tweet. ",
        },
      ],
      temperature: 1,
      max_tokens: 600,
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content.trim();
}
