// Enhanced PlantGuard Chatbot with Markdown and Feedback
document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const quickReplies = document.getElementById('quickReplies');
    
    // Model information
    const modelInfo = {
        name: "MobileNetV2",
        totalImages: "61,486",
        dataset: "PlantVillage",
        trainingTime: "2.5 hours",
        accuracy: "99.39%",
        loss: "2.6%",
        researchBased: true
    };
    
    // Toggle chatbot visibility with animation
    chatbotToggle.addEventListener('click', function() {
        if (chatbotContainer.style.display === 'flex') {
            chatbotContainer.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                chatbotContainer.style.display = 'none';
                chatbotContainer.style.animation = '';
            }, 300);
        } else {
            chatbotContainer.style.display = 'flex';
            chatbotContainer.style.animation = 'fadeIn 0.3s ease';
            
            // Initialize with welcome message if empty
            if (chatbotMessages.children.length === 0) {
                addBotMessage(`
**Hello! I'm PlantGuard, your AI plant health assistant.** 🌱

I can help you with:
- **Plant disease detection**
- **Model information**
- **Usage instructions**
- **Feedback collection**

How can I help you today?
                `);
                
                showQuickReplies([
                    "How does this work?",
                    "Tell me about the AI model",
                    "What diseases can you detect?",
                    "Give feedback"
                ]);
            }
        }
    });
    
    chatbotClose.addEventListener('click', function() {
        chatbotContainer.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            chatbotContainer.style.display = 'none';
            chatbotContainer.style.animation = '';
        }, 300);
    });
    
    // Send message on button click
    chatbotSend.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (message) {
            addUserMessage(message);
            chatbotInput.value = '';
            processUserMessage(message);
        }
    }
    
    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = text;
        chatbotMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    function addBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        // Convert markdown to HTML
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // italic
            .replace(/`(.*?)`/g, '<code>$1</code>') // code
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>'); // links
        
        // Handle line breaks and lists
        html = html.replace(/\n/g, '<br>');
        
        messageDiv.innerHTML = html;
        chatbotMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    function scrollToBottom() {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    function showQuickReplies(replies) {
        quickReplies.innerHTML = '';
        replies.forEach(reply => {
            const button = document.createElement('button');
            button.className = 'quick-reply';
            button.textContent = reply;
            button.addEventListener('click', function() {
                addUserMessage(reply);
                processUserMessage(reply);
            });
            quickReplies.appendChild(button);
        });
    }
    
    function processUserMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('how does this work') || lowerMessage.includes('how it works')) {
            addBotMessage(`
**How Our Plant Disease Detection Works** 🌿

1. **Upload** a clear image of a plant leaf (or use the camera)
2. Our **AI model** analyzes the image using deep learning
3. You get **instant results** with disease identification
4. We provide **treatment recommendations**

**For best results:**
- Use clear, well-lit images
- Focus on a single leaf
- Avoid blurry or distant shots

Try uploading an image to see it in action!
            `);
            showQuickReplies(["Tell me about the AI model", "What diseases can you detect?", "Back to main menu"]);
        }
        else if (lowerMessage.includes('model') || lowerMessage.includes('ai system') || lowerMessage.includes('algorithm')) {
            addBotMessage(`
**AI Model Information** 🤖

Here are the technical details of our system:

<div class="model-info">
    <p><strong>Model Architecture:</strong> ${modelInfo.name}</p>
    <p><strong>Training Dataset:</strong> ${modelInfo.dataset}</p>
    <p><strong>Total Images:</strong> ${modelInfo.totalImages}</p>
    <p><strong>Training Time:</strong> ${modelInfo.trainingTime}</p>
    <p><strong>Accuracy:</strong> ${modelInfo.accuracy}</p>
    <p><strong>Loss:</strong> ${modelInfo.loss}</p>
    <p><strong>Research-Based:</strong> ${modelInfo.researchBased ? 'Yes' : 'No'}</p>
</div>

This model was carefully trained to provide accurate plant disease detection.
            `);
            showQuickReplies(["How does this work?", "What diseases can you detect?", "Back to main menu"]);
        }
        else if (lowerMessage.includes('what diseases') || lowerMessage.includes('detect') || lowerMessage.includes('identify')) {
            addBotMessage(`
**Detectable Plant Diseases** 🔍

Our system can identify multiple common plant diseases including:

**Tomato:**
- Early Blight
- Late Blight
- Leaf Mold
- Bacterial Spot

**Potato:**
- Early Blight
- Late Blight

**Other Plants:**
- Healthy leaves
- Various other diseases

We're constantly improving to detect more plant diseases!
            `);
            showQuickReplies(["How accurate is it?", "Tell me about the model", "Back to main menu"]);
        }
        else if (lowerMessage.includes('accuracy') || lowerMessage.includes('how accurate')) {
            addBotMessage(`
**System Accuracy** 📊

Our current model achieves:

- **Test Accuracy:** ${modelInfo.accuracy}
- **Loss Value:** ${modelInfo.loss}

*Note:* Actual performance depends on image quality. For best results:
- Use clear, well-lit images
- Focus on a single leaf
- Avoid shadows or obstructions
            `);
            showQuickReplies(["Tell me about the model", "How does this work?", "Back to main menu"]);
        }
        else if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
            addBotMessage(`
**Need Help?** 🆘

For serious plant health issues or technical support:

📧 *Email:* [aditya523523@gmail.com](mailto:aditya523523@gmail.com)
📞 *Phone:* +91 6390090315
🌐 *Contact Page:* [Visit Contact Page](/contactUs)

We typically respond within 24 hours.
            `);
            askForRating();
        }
        else if (lowerMessage.includes('feedback') || lowerMessage.includes('rate') || lowerMessage.includes('review') || lowerMessage.includes('suggestion') || lowerMessage.includes('complaint')) {
            showFeedbackForm();
            return;
        }
        else if (lowerMessage.includes('main menu') || lowerMessage.includes('back') || lowerMessage.includes('home')) {
            addBotMessage("What would you like to know about our plant disease detection system?");
            showQuickReplies([
                "How does this work?",
                "Tell me about the AI model",
                "What diseases can you detect?",
                "Give feedback"
            ]);
        }
        else {
            // For unknown questions, use Euriai API
            fetch('/ask-plantguard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message })
            })
            .then(response => response.json())
            .then(data => {
                if (data.answer) {
                    addBotMessage(data.answer);
                } else {
                    addBotMessage("I'm sorry, I didn't understand that. Could you rephrase your question about plant diseases?");
                }
                showQuickReplies([
                    "How does this work?",
                    "Tell me about the AI model",
                    "What diseases can you detect?",
                    "Back to main menu"
                ]);
            })
            .catch(error => {
                console.error('Error:', error);
                addBotMessage("I'm having trouble connecting right now. Please try again later.");
                showQuickReplies([
                    "How does this work?",
                    "Tell me about the AI model",
                    "Contact support"
                ]);
            });
        }
    }
    
    function askForRating() {
        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'rating-container';
        ratingDiv.innerHTML = `
            <p>Was this information helpful?</p>
            <div class="rating-stars">
                <span class="rating-star" data-rating="1">★</span>
                <span class="rating-star" data-rating="2">★</span>
                <span class="rating-star" data-rating="3">★</span>
                <span class="rating-star" data-rating="4">★</span>
                <span class="rating-star" data-rating="5">★</span>
            </div>
            <button class="feedback-toggle" id="provideFeedback">Provide detailed feedback</button>
        `;
        chatbotMessages.appendChild(ratingDiv);
        
        const stars = ratingDiv.querySelectorAll('.rating-star');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                stars.forEach(s => {
                    if (s.getAttribute('data-rating') <= rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
                
                // Send rating to server
                sendFeedback({ rating: rating });
                
                setTimeout(() => {
                    addBotMessage(`Thank you for your ${rating}-star rating! 💚`);
                    showQuickReplies([
                        "How does this work?",
                        "Tell me about the AI model",
                        "No, thank you"
                    ]);
                }, 500);
            });
        });
        
        document.getElementById('provideFeedback').addEventListener('click', function() {
            showFeedbackForm();
        });
        
        scrollToBottom();
    }
    
    function showFeedbackForm() {
        const existingForm = document.querySelector('.feedback-form');
        if (existingForm) existingForm.remove();
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback-form';
        feedbackDiv.innerHTML = `
            <h4>We'd love your feedback!</h4>
            <div class="rating-container">
                <p>How would you rate your experience?</p>
                <div class="rating-stars">
                    <span class="rating-star" data-rating="1">★</span>
                    <span class="rating-star" data-rating="2">★</span>
                    <span class="rating-star" data-rating="3">★</span>
                    <span class="rating-star" data-rating="4">★</span>
                    <span class="rating-star" data-rating="5">★</span>
                </div>
            </div>
            <textarea id="feedbackText" placeholder="What did you like or what can we improve?"></textarea>
            <button id="submitFeedback">Submit Feedback</button>
        `;
        chatbotMessages.appendChild(feedbackDiv);
        
        // Add star rating functionality
        const stars = feedbackDiv.querySelectorAll('.rating-star');
        let selectedRating = 0;
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                selectedRating = this.getAttribute('data-rating');
                stars.forEach((s, index) => {
                    if (index < selectedRating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
            
            star.addEventListener('mouseover', function() {
                const hoverRating = this.getAttribute('data-rating');
                stars.forEach((s, index) => {
                    if (index < hoverRating) {
                        s.classList.add('hover');
                    } else {
                        s.classList.remove('hover');
                    }
                });
            });
            
            star.addEventListener('mouseout', function() {
                stars.forEach(s => s.classList.remove('hover'));
            });
        });
        
        document.getElementById('submitFeedback').addEventListener('click', function() {
            const feedbackText = document.getElementById('feedbackText').value.trim();
            if (feedbackText || selectedRating > 0) {
                sendFeedback({ 
                    rating: selectedRating,
                    feedback: feedbackText 
                });
                addBotMessage("Thank you for your valuable feedback! We'll use it to improve our service. 🌱");
                showQuickReplies([
                    "How does this work?",
                    "Tell me about the AI model",
                    "No, thank you"
                ]);
                feedbackDiv.remove();
            } else {
                addBotMessage("Please provide either a rating or feedback text before submitting.");
            }
        });
        
        scrollToBottom();
    }
    
    function sendFeedback(data) {
        // Include page URL and timestamp
        data.pageUrl = window.location.pathname;
        data.timestamp = new Date().toISOString();
        
        // Send feedback to server
        fetch('/submit-feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .catch(error => {
            console.error('Error sending feedback:', error);
        });
    }
});