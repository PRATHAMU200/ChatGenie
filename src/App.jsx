import React, { useState, useRef, useEffect } from'react';
import { HfInference } from '@huggingface/inference';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';

const App = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [model, setModel] = useState('mistralai/Mistral-7B-Instruct-v0.3');
  const [temperature, setTemperature] = useState(0.5);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [topP, setTopP] = useState(0.7);
  const [showLeftContainer, setShowLeftContainer] = useState(window.innerWidth > 768);
  const inference = new HfInference('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');

  useEffect(() => {
    const conversationList = document.querySelector('.conversation-list');
    setTimeout(() => {
      conversationList.scrollTop = conversationList.scrollHeight;
    }, 100);
  }, [chatHistory]);

  const handleChatInput2 = async (event) =>{
    let oldContent = chatHistory;
    let newContent = "";
    for await (const chunk of inference.chatCompletionStream({
      model: model,
      messages: [
      { role: "user", content: input }
      ],
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: topP
    })) {
      if (chunk.choices && chunk.choices.length > 0) {
        const newContentChunk = chunk.choices[0].delta.content;
        newContent += newContentChunk ;
        console.log(newContentChunk);
        // const formattedContent = formatCodeBlocks(newContent);
        setChatHistory([...oldContent, `You: ${input}`, newContent]);
      }  
    }
    setInput('');
  }
  const formatChatResponse = (content) => {
    // Split the content by code blocks and process each part
    return content
      .split(/```/g)
      .map((part, index) => {
        if (index % 2 === 1) {  // This is a code block
          const lang = part.startsWith('cpp') ? 'cpp' : part.startsWith('sh') ? 'sh' : '';
          const code = part.replace(/^(cpp|sh)\s*/, '');  // Remove the language label (if present)
          return `<pre><code class="language-${lang}">${escapeHTML(code)}</code></pre>`;
        } else {  // This is normal text
          return escapeHTML(part); //part.split('\n').map(escapeHTML).join('<br/>');
        }
      })
      .join('');
  };
  
  // Utility to escape HTML characters for safe rendering
  const escapeHTML = (str) => {
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  

  const resetToDefault = async (event) =>{
    setModel('mistralai/Mistral-7B-Instruct-v0.3');
    setTemperature(0.5);
    setMaxTokens(1024);
    setTopP(0.7);
  }

  const clearChatHistory = () => {
    setChatHistory([]); // Clear the chat history
  };

  const renderMessage = (message) => {
    return (
      <div
        className="message-content"
        dangerouslySetInnerHTML={{ __html: formatChatResponse(message) }}
      />
    );
  };
  


  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }, []);

  return (
    <div className="container">
      
      {showLeftContainer && (  // Conditionally render the left container
      <div className="left-container">
        <h3>Model Selection</h3>
        <div className="model-container">
          <select value={model} onChange={(event) => setModel(event.target.value)} className="model-select">
            <option value="mistralai/Mistral-Nemo-Instruct-2407">mistralai/Mistral-Nemo-Instruct-2407</option>
            <option value="mistralai/Mistral-7B-Instruct-v0.3">mistralai/Mistral-7B-Instruct-v0.3</option>
            <option value="google/gemma-1.1-7b-it">google/gemma-1.1-7b-it</option>
            <option value="microsoft/Phi-3-mini-4k-instruct">microsoft/Phi-3-mini-4k-instruct</option>
            <option value="meta-llama/Meta-Llama-3-8B-Instruct">meta-llama/Meta-Llama-3-8B-Instruct</option>
            <option value="NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO">NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO</option>
            <option value="HuggingFaceH4/starchat2-15b-v0.1">HuggingFaceH4/starchat2-15b-v0.1</option>
            <option value="HuggingFaceH4/zephyr-7b-alpha">HuggingFaceH4/zephyr-7b-alpha</option>
          </select>
        </div><br></br>
        <div className="option-container">
          <h3>Additional Options</h3>
          <div className="option-row">
            <label>Temperature:</label>
            <input type="number" value={temperature} onChange={(event) => setTemperature(event.target.value)} step="0.1" min="0" max="1" />
          </div>
          <div className="option-row">
            <label>Max Tokens:</label>
            <input type="number" value={maxTokens} onChange={(event) => setMaxTokens(event.target.value)} min="1" max="2048" />
          </div>
          <div className="option-row">
            <label>Top P:</label>
            <input type="number" value={topP} onChange={(event) => setTopP(event.target.value)} step="0.1" min="0" max="1" />
          </div>
          <br></br>
          <center><button onClick={resetToDefault} className="send-button">Reset to Default</button></center>
          <center><button onClick={clearChatHistory } className="send-button">Clean Chat History</button></center>
          <div style={{position:'absolute', bottom: 20}}>
          <center><h4>Developer: Pratham Upadhyay</h4></center>
          <center><h4>Github: @prathamu200</h4></center>
          </div>
        </div>
      </div>
      )}
      <div className="right-container">
      <div className="title-container">
        {/* Toggle button to show/hide left container */}
      <button onClick={() => setShowLeftContainer(prev => !prev)} className="toggle-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-xl-heavy max-md:hidden"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.85719 3H15.1428C16.2266 2.99999 17.1007 2.99998 17.8086 3.05782C18.5375 3.11737 19.1777 3.24318 19.77 3.54497C20.7108 4.02433 21.4757 4.78924 21.955 5.73005C22.2568 6.32234 22.3826 6.96253 22.4422 7.69138C22.5 8.39925 22.5 9.27339 22.5 10.3572V13.6428C22.5 14.7266 22.5 15.6008 22.4422 16.3086C22.3826 17.0375 22.2568 17.6777 21.955 18.27C21.4757 19.2108 20.7108 19.9757 19.77 20.455C19.1777 20.7568 18.5375 20.8826 17.8086 20.9422C17.1008 21 16.2266 21 15.1428 21H8.85717C7.77339 21 6.89925 21 6.19138 20.9422C5.46253 20.8826 4.82234 20.7568 4.23005 20.455C3.28924 19.9757 2.52433 19.2108 2.04497 18.27C1.74318 17.6777 1.61737 17.0375 1.55782 16.3086C1.49998 15.6007 1.49999 14.7266 1.5 13.6428V10.3572C1.49999 9.27341 1.49998 8.39926 1.55782 7.69138C1.61737 6.96253 1.74318 6.32234 2.04497 5.73005C2.52433 4.78924 3.28924 4.02433 4.23005 3.54497C4.82234 3.24318 5.46253 3.11737 6.19138 3.05782C6.89926 2.99998 7.77341 2.99999 8.85719 3ZM6.35424 5.05118C5.74907 5.10062 5.40138 5.19279 5.13803 5.32698C4.57354 5.6146 4.1146 6.07354 3.82698 6.63803C3.69279 6.90138 3.60062 7.24907 3.55118 7.85424C3.50078 8.47108 3.5 9.26339 3.5 10.4V13.6C3.5 14.7366 3.50078 15.5289 3.55118 16.1458C3.60062 16.7509 3.69279 17.0986 3.82698 17.362C4.1146 17.9265 4.57354 18.3854 5.13803 18.673C5.40138 18.8072 5.74907 18.8994 6.35424 18.9488C6.97108 18.9992 7.76339 19 8.9 19H9.5V5H8.9C7.76339 5 6.97108 5.00078 6.35424 5.05118ZM11.5 5V19H15.1C16.2366 19 17.0289 18.9992 17.6458 18.9488C18.2509 18.8994 18.5986 18.8072 18.862 18.673C19.4265 18.3854 19.8854 17.9265 20.173 17.362C20.3072 17.0986 20.3994 16.7509 20.4488 16.1458C20.4992 15.5289 20.5 14.7366 20.5 13.6V10.4C20.5 9.26339 20.4992 8.47108 20.4488 7.85424C20.3994 7.24907 20.3072 6.90138 20.173 6.63803C19.8854 6.07354 19.4265 5.6146 18.862 5.32698C18.5986 5.19279 18.2509 5.10062 17.6458 5.05118C17.0289 5.00078 16.2366 5 15.1 5H11.5ZM5 8.5C5 7.94772 5.44772 7.5 6 7.5H7C7.55229 7.5 8 7.94772 8 8.5C8 9.05229 7.55229 9.5 7 9.5H6C5.44772 9.5 5 9.05229 5 8.5ZM5 12C5 11.4477 5.44772 11 6 11H7C7.55229 11 8 11.4477 8 12C8 12.5523 7.55229 13 7 13H6C5.44772 13 5 12.5523 5 12Z" fill="currentColor"></path></svg>
      </button><h3>ChatGenie:-</h3>
      </div>
      {chatHistory.length === 0 ? (
      <center><div className="no-chat-message">
        <p>😉<br></br>Personalised AI ChatBot,<br></br> Select the desired model from left box <br></br>(Optional*) set temp and length <br></br> Start using it!!</p>
      </div></center>
    ) : (
      <div className="conversation-container">
        <ul className="conversation-list">
          {chatHistory.map((message, index) => (
            <li key={index} className={`conversation-item ${message.startsWith('You:')? 'user-input' : 'ai-output'}`}>
            <p>{renderMessage(message)}</p>
            {/* <p>{(message)}</p>
             */}
          </li>
          ))}
        </ul>
      </div>)}
      <div className="input-container">
      {/* <div className="model-container">
        <select value={model} onChange={(event) => setModel(event.target.value)} className="model-select">
          <option value="meta-llama/Llama-3.1-8B-Instruct">meta-llama/Llama-3.1-8B-Instruct</option>
          <option value="mistralai/Mistral-7B-Instruct-v0.3">mistralai/Mistral-7B-Instruct-v0.3</option>
          <option value="Qwen/Qwen2.5-72B-Instruct">Qwen/Qwen2.5-72B-Instruct</option>
          <option value="microsoft/Phi-3-mini-4k-instruct">microsoft/Phi-3-mini-4k-instruct</option>
          <option value="mistralai/Mixtral-8x7B-Instruct-v0.1">mistralai/Mixtral-8x7B-Instruct-v0.1</option>
        </select>
      </div> */}
        <textarea
          ref={textareaRef}
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your message..."
          className="growing-input-field"
          rows={1}
        />
        <button onClick={handleChatInput2} className="send-button">Send</button>
        </div>
        </div>
      </div>
  );
};

export default App;