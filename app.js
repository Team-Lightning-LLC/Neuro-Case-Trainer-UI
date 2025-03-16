// Neuro Case Trainer - Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const newCaseBtn = document.querySelector('.new-case-btn');
    const downloadBtn = document.querySelector('.download-btn');
    const notesTextarea = document.querySelector('.notes-textarea');
    const copyBtn = document.querySelector('.control-btn[title="Copy"]');
    const pasteBtn = document.querySelector('.control-btn[title="Paste"]');
    const downloadNotesBtn = document.querySelector('.control-btn[title="Download"]');
    
    // Configuration - REPLACE WITH YOUR API KEY
    const OPENAI_API_KEY = 'your-openai-api-key-here';
    
    // Conversation context
    let conversationHistory = [];
    
    // Set up dynamic slider values
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        const valueDisplay = slider.parentElement.querySelector('.slider-value');
        slider.addEventListener('input', function() {
            valueDisplay.textContent = this.value;
        });
    });
    
    // Function to call the OpenAI API
    async function callGptApi(messages) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4', // You can change to gpt-3.5-turbo for lower cost
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 800
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // Function to handle the New Case button
    async function handleNewCase() {
        // Clear chat messages
        chatMessages.innerHTML = '';
        
        // Get slider values
        const complexity = document.getElementById('complexity-slider').value;
        const ambiguity = document.getElementById('ambiguity-slider').value;
        const depth = document.getElementById('depth-slider').value;
        const awareness = document.getElementById('awareness-slider').value;
        
        // Create loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'message assistant-message';
        loadingMessage.id = 'loading-message';
        loadingMessage.textContent = 'Generating new case...';
        chatMessages.appendChild(loadingMessage);
        
        try {
            // Reset conversation history with system message
            const systemMessage = `You are a training system designed to help aspiring neurologists develop diagnostic skills through realistic patient simulations. Your responsibility is to create and present individuals with neurological symptoms in a way that mirrors real clinical encounters - incomplete information, uncertainty, and the need for skilled questioning to reveal the complete picture.

Create a new neurological case based on these parameters:
- Complexity: ${complexity}/10 (higher means more complex diagnosis)
- Ambiguity: ${ambiguity}/10 (higher means more ambiguous symptoms)
- Client Depth: ${depth}/10 (higher means more complex psychological/social factors)
- Client Awareness: ${awareness}/10 (higher means patient is more aware of their condition)

At the beginning of your response and throughout the conversation, include italicized descriptions of the patient's physical behaviors, expressions, and nonverbal cues using *asterisks*.

Begin by introducing the patient with their name, age, and chief complaint. Use first person perspective as the patient, but don't reveal the diagnosis.`;

            conversationHistory = [
                { role: "system", content: systemMessage }
            ];
            
            // Call the API
            const initialResponse = await callGptApi(conversationHistory);
            
            // Add response to conversation history
            conversationHistory.push({
                role: "assistant",
                content: initialResponse
            });
            
            // Remove loading message
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) loadingElement.remove();
            
            // Format and display the response
            const responseElement = document.createElement('div');
            responseElement.className = 'message assistant-message';
            
            // Process text for markdown-like formatting
            let formattedText = initialResponse;
            formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // Split by paragraphs
            const paragraphs = formattedText.split("\n\n");
            let htmlContent = '';
            
            paragraphs.forEach(paragraph => {
                if (paragraph.trim()) {
                    htmlContent += `<p>${paragraph}</p>`;
                }
            });
            
            responseElement.innerHTML = htmlContent || formattedText;
            chatMessages.appendChild(responseElement);
            
        } catch (error) {
            // Handle error
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.textContent = `Error: ${error.message}. Please check your API key and try again.`;
            }
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to handle sending a message
    async function handleSendMessage() {
        const message = userInput.value.trim();
        if (!message || conversationHistory.length === 0) return;
        
        // Add user message to chat
        const userMessageElement = document.createElement('div');
        userMessageElement.className = 'message user-message';
        userMessageElement.textContent = message;
        chatMessages.appendChild(userMessageElement);
        
        // Add to conversation history
        conversationHistory.push({
            role: "user",
            content: message
        });
        
        // Clear input field
        userInput.value = '';
        
        // Create loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'message assistant-message';
        loadingMessage.id = 'loading-message';
        loadingMessage.textContent = 'Thinking...';
        chatMessages.appendChild(loadingMessage);
        
        // Scroll to show loading message
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            // Call the API
            const response = await callGptApi(conversationHistory);
            
            // Add response to conversation history
            conversationHistory.push({
                role: "assistant",
                content: response
            });
            
            // Remove loading message
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) loadingElement.remove();
            
            // Format and display the response
            const responseElement = document.createElement('div');
            responseElement.className = 'message assistant-message';
            
            // Process text for markdown-like formatting
            let formattedText = response;
            formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // Split by paragraphs
            const paragraphs = formattedText.split("\n\n");
            let htmlContent = '';
            
            paragraphs.forEach(paragraph => {
                if (paragraph.trim()) {
                    htmlContent += `<p>${paragraph}</p>`;
                }
            });
            
            responseElement.innerHTML = htmlContent || formattedText;
            chatMessages.appendChild(responseElement);
            
        } catch (error) {
            // Handle error
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.textContent = `Error: ${error.message}. Please try again.`;
            }
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to download chat history
    function downloadChatHistory() {
        // Get all messages
        const messages = chatMessages.querySelectorAll('.message');
        let chatText = 'NEURO CASE TRAINER - CONVERSATION LOG\n\n';
        
        messages.forEach(msg => {
            const role = msg.classList.contains('user-message') ? 'Doctor' : 'Patient';
            // Get text content, preserving line breaks but removing HTML
            const textContent = msg.innerText || msg.textContent;
            chatText += `${role}: ${textContent}\n\n`;
        });
        
        // Add case parameters if available
        if (conversationHistory.length > 0 && conversationHistory[0].role === 'system') {
            const systemMessage = conversationHistory[0].content;
            const complexityMatch = systemMessage.match(/Complexity: (\d+)\/10/);
            const ambiguityMatch = systemMessage.match(/Ambiguity: (\d+)\/10/);
            const depthMatch = systemMessage.match(/Client Depth: (\d+)\/10/);
            const awarenessMatch = systemMessage.match(/Client Awareness: (\d+)\/10/);
            
            if (complexityMatch || ambiguityMatch || depthMatch || awarenessMatch) {
                chatText += '---\nCASE PARAMETERS:\n';
                if (complexityMatch) chatText += `Complexity: ${complexityMatch[1]}/10\n`;
                if (ambiguityMatch) chatText += `Ambiguity: ${ambiguityMatch[1]}/10\n`;
                if (depthMatch) chatText += `Client Depth: ${depthMatch[1]}/10\n`;
                if (awarenessMatch) chatText += `Client Awareness: ${awarenessMatch[1]}/10\n`;
            }
        }
        
        // Add date and time
        chatText += `\n---\nGenerated: ${new Date().toLocaleString()}`;
        
        // Create download
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neuro-case-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Function to copy notes
    function copyNotes() {
        notesTextarea.select();
        document.execCommand('copy');
        
        // Optional: Show feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }
    
    // Function to paste from clipboard
    async function pasteToNotes() {
        try {
            const text = await navigator.clipboard.readText();
            notesTextarea.value += text;
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    }
    
    // Function to download notes
    function downloadNotes() {
        const notesText = notesTextarea.value;
        if (!notesText.trim()) return;
        
        const blob = new Blob([notesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neuro-notes-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Event listeners
    if (sendBtn) {
        sendBtn.addEventListener('click', handleSendMessage);
    }
    
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }
    
    if (newCaseBtn) {
        newCaseBtn.addEventListener('click', handleNewCase);
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadChatHistory);
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', copyNotes);
    }
    
    if (pasteBtn) {
        pasteBtn.addEventListener('click', pasteToNotes);
    }
    
    if (downloadNotesBtn) {
        downloadNotesBtn.addEventListener('click', downloadNotes);
    }
    
    // Initialize with an empty state
    // We'll wait for the user to click "New Case" to generate the first case
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message assistant-message';
    welcomeMessage.innerHTML = '<p>Welcome to Neuro Case Trainer. Click "New Case" to begin a simulation, or adjust the parameters on the left to customize the difficulty.</p>';
    chatMessages.appendChild(welcomeMessage);
});
