/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {marked} from 'marked';
import {GoogleGenAI, Chat, GenerateContentResponse, Modality, Type} from '@google/genai';

const API_KEY = (window as any).process?.env?.API_KEY;

const investmentFramework = `
# 50 Structures & Strategies for Building an Unbeatable Investment Company

## Organizational Structure & Governance (1-10)
... [framework content] ...
`; // Note: Abridged for brevity in this description, the full content is used.

interface ErrorLogEntry {
  timestamp: string;
  context: string;
  message: string;
  stack?: string;
}

let errorLog: ErrorLogEntry[] = [];

/**
 * Logs an error to the in-memory store for admin review.
 * @param error The error object.
 * @param context A string describing where the error occurred (e.g., 'Co-pilot').
 */
function logError(error: unknown, context: string) {
  console.error(`[${context}]`, error); // Keep original console log for debugging

  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    context: context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  };

  errorLog.push(entry);
}

/**
 * Generates a mock 16-character base32 secret for TOTP.
 * NOTE: For production, use a cryptographically secure random generator.
 * @returns A 16-character string compatible with Base32 for TOTP.
 */
function generateTotpSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
}


/**
 * Renders markdown content into a specific DOM element.
 * @param content The markdown string to render.
 * @param element The container element to render into.
 * @param className Optional CSS class for a wrapper div.
 */
async function render(content: string, element: HTMLElement, className?: string) {
  const wrapper = document.createElement('div');
  if (className) {
      wrapper.className = className;
  }
  wrapper.innerHTML = await marked.parse(content ?? '');
  element.innerHTML = ''; // Clear previous content
  element.append(wrapper);
}

/**
 * Sets up the authentication modal functionality.
 */
function setupAuthModal() {
  const loginBtn = document.getElementById('cta-login-btn');
  const exploreBtn = document.getElementById('cta-explore-btn');
  const modalOverlay = document.getElementById('auth-modal-overlay');
  const closeModalBtn = document.getElementById('modal-close-btn');
  
  // Form Containers
  const loginFormContainer = document.getElementById('login-form-container');
  const signupFormContainer = document.getElementById('signup-form-container');
  const forgotPasswordContainer = document.getElementById('forgot-password-container');
  const googleAuthContainer = document.getElementById('google-auth-container');

  // Links
  const showSignupLink = document.getElementById('show-signup-link');
  const showLoginLink = document.getElementById('show-login-link');
  const showForgotPasswordLink = document.getElementById('show-forgot-password-link');
  const backToLoginLink = document.getElementById('back-to-login-link');
  const backToLoginFromAuth = document.getElementById('back-to-login-from-auth');

  // Forms
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  const googleAuthForm = document.getElementById('google-auth-form');

  // 2FA elements
  const copyAuthKeyBtn = document.getElementById('copy-auth-key-btn') as HTMLButtonElement;
  const authSetupKeySpan = document.getElementById('auth-setup-key');
  const authQrCodeImg = document.getElementById('auth-qr-code-img') as HTMLImageElement;


  if (!loginBtn || !exploreBtn || !modalOverlay || !closeModalBtn || !loginFormContainer || !signupFormContainer || !forgotPasswordContainer || !googleAuthContainer || !showSignupLink || !showLoginLink || !showForgotPasswordLink || !backToLoginLink || !backToLoginFromAuth || !loginForm || !signupForm || !forgotPasswordForm || !googleAuthForm || !copyAuthKeyBtn || !authSetupKeySpan || !authQrCodeImg) {
    console.error('One or more authentication modal elements were not found.');
    return;
  }

  const openModal = () => {
    modalOverlay.classList.add('active');
  };

  const closeModal = () => {
    modalOverlay.classList.remove('active');
  };

  loginBtn.addEventListener('click', openModal);
  exploreBtn.addEventListener('click', openModal);

  closeModalBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });

  showSignupLink.addEventListener('click', (event) => {
    event.preventDefault();
    loginFormContainer.classList.add('hidden');
    signupFormContainer.classList.remove('hidden');
  });

  showLoginLink.addEventListener('click', (event) => {
    event.preventDefault();
    signupFormContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
  });

  showForgotPasswordLink.addEventListener('click', (event) => {
    event.preventDefault();
    loginFormContainer.classList.add('hidden');
    forgotPasswordContainer.classList.remove('hidden');
  });

  backToLoginLink.addEventListener('click', (event) => {
    event.preventDefault();
    forgotPasswordContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
  });

  backToLoginFromAuth.addEventListener('click', (event) => {
      event.preventDefault();
      googleAuthContainer.classList.add('hidden');
      loginFormContainer.classList.remove('hidden');
  });

  loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('Login form submitted. Proceeding to 2FA.');

      // Dynamically generate 2FA secret and QR code
      const newSecret = generateTotpSecret();
      const userEmail = (document.getElementById('login-email') as HTMLInputElement)?.value || 'user@fulxerpro.com';
      const otpAuthUrl = `otpauth://totp/FULXERPRO:${encodeURIComponent(userEmail)}?secret=${newSecret}&issuer=FULXERPRO`;

      authSetupKeySpan.textContent = newSecret;
      authQrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(otpAuthUrl)}`;
      authQrCodeImg.alt = "New Authenticator QR Code";
      
      // Instead of logging in, show the 2FA container
      loginFormContainer.classList.add('hidden');
      googleAuthContainer.classList.remove('hidden');
  });

  googleAuthForm.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('2FA form submitted.');
      // Add actual 2FA verification logic here
      closeModal();
      
      // --- Ad Logic ---
      const adOverlay = document.getElementById('ad-overlay') as HTMLElement;
      const adCountdown = document.getElementById('ad-countdown');
      const adSkipBtn = document.getElementById('ad-skip-btn');

      if (!adOverlay || !adCountdown || !adSkipBtn) {
          console.error('Ad elements not found.');
          return;
      }

      let countdown = 10;
      let countdownInterval: number;

      const hideAd = () => {
          if (countdownInterval) clearInterval(countdownInterval);
          adOverlay.style.display = 'none';
      };

      const showAd = () => {
          adOverlay.style.display = 'flex';
          countdown = 10;
          adCountdown.textContent = `Continuing in ${countdown}s`;
          
          countdownInterval = window.setInterval(() => {
              countdown--;
              if (countdown > 0) {
                  adCountdown.textContent = `Continuing in ${countdown}s`;
              } else {
                  hideAd();
              }
          }, 1000);
      };

      adSkipBtn.addEventListener('click', hideAd, { once: true });
      showAd();
  });


  signupForm.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('Signup form submitted.');
      // Add actual signup logic here
      closeModal();
  });

  forgotPasswordForm.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('Forgot password form submitted.');
      // Add actual password reset logic here
      closeModal();
  });
  
  copyAuthKeyBtn.addEventListener('click', async () => {
    const key = authSetupKeySpan.textContent;
    if (!key) return;

    try {
      await navigator.clipboard.writeText(key);
      const originalText = copyAuthKeyBtn.textContent;
      copyAuthKeyBtn.textContent = 'Copied!';
      copyAuthKeyBtn.classList.add('copied');

      setTimeout(() => {
        copyAuthKeyBtn.textContent = originalText;
        copyAuthKeyBtn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy auth setup key:', err);
    }
  });
}

/**
 * Extracts text content from the landing page to provide context to the AI Co-pilot.
 * @returns A string containing the page's content.
 */
function getLandingPageContext(): string {
  const heroText = (document.querySelector('.hero') as HTMLElement)?.innerText;
  const featuresText = (document.querySelector('.dashboard') as HTMLElement)?.innerText;
  const awardsText = (document.querySelector('.awards-section') as HTMLElement)?.innerText;
  const testimonialsText = (document.querySelector('.testimonials') as HTMLElement)?.innerText;

  return `
    You are the FULXERPRO AI Co-pilot, a helpful and knowledgeable assistant for a high-end investment platform.
    Your goal is to answer user questions about the platform, its features, and its benefits for investors and clients.
    You must be professional, concise, and helpful. Guide users towards signing up or requesting a demo when appropriate.
    Use the following information about the FULXERPRO landing page as your primary knowledge base. Do not make up features.

    --- START OF KNOWLEDGE BASE ---

    ## HERO SECTION:
    ${heroText}

    ## FEATURES & DASHBOARD SECTION:
    ${featuresText}

    ## AWARDS & RECOGNITION SECTION:
    ${awardsText}

    ## INVESTOR TESTIMONIALS SECTION:
    ${testimonialsText}

    --- END OF KNOWLEDGE BASE ---

    Now, begin the conversation by answering the user's questions.
  `;
}

/**
 * Extracts text content from the dashboard to provide context for the Platform Guide.
 * @returns A string containing the dashboard's content.
 */
function getDashboardContext(): string {
    const dashboardText = (document.querySelector('.dashboard') as HTMLElement)?.innerText;
    return dashboardText ?? 'No dashboard context found.';
}

/**
 * Sets up the AI Co-pilot functionality.
 */
function setupCopilot() {
    const fab = document.getElementById('copilot-fab');
    const window = document.getElementById('copilot-window');
    const closeBtn = document.getElementById('copilot-close-btn');
    const form = document.getElementById('copilot-form');
    const input = document.getElementById('copilot-input') as HTMLInputElement;
    const messagesContainer = document.getElementById('copilot-messages');
    const thinkingTemplate = document.getElementById('copilot-thinking-template') as HTMLTemplateElement;

    if (!fab || !window || !closeBtn || !form || !input || !messagesContainer || !thinkingTemplate) {
        console.error('One or more co-pilot elements were not found.');
        return;
    }
    
    if (!API_KEY) {
      console.error("API_KEY environment variable not set. Co-pilot disabled.");
      fab.style.display = 'none'; // Hide the co-pilot if no API key
      return;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const landingPageContext = getLandingPageContext();
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: landingPageContext
        }
    });
    
    const addMessage = (type: 'ai' | 'user', content: string, isError = false) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        if (isError) {
          messageDiv.classList.add('error');
        }
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    fab.addEventListener('click', () => {
      window.classList.add('active');
    });
    closeBtn.addEventListener('click', () => window.classList.remove('active'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = input.value.trim();
        if (!userMessage) return;

        addMessage('user', userMessage);
        input.value = '';
        const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitButton.disabled = true;

        // Show thinking indicator
        const thinkingIndicator = thinkingTemplate.content.cloneNode(true) as HTMLElement;
        messagesContainer.appendChild(thinkingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        let aiMessageContentElement: HTMLElement | null = null;

        try {
            const stream = await chat.sendMessageStream({ message: userMessage });

            let fullResponseText = '';
            let isFirstChunk = true;

            for await (const chunk of stream) {
                if (isFirstChunk) {
                    // Remove thinking indicator and create the actual message bubble
                    const thinkingElement = messagesContainer.querySelector('.thinking');
                    if (thinkingElement) {
                        messagesContainer.removeChild(thinkingElement);
                    }
                    
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `message ai`;
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'message-content';
                    messageDiv.appendChild(contentDiv);
                    messagesContainer.appendChild(messageDiv);
                    aiMessageContentElement = contentDiv;
                    
                    isFirstChunk = false;
                }
                
                fullResponseText += chunk.text;
                if (aiMessageContentElement) {
                    aiMessageContentElement.textContent = fullResponseText;
                }
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            // Once streaming is complete, parse the full markdown content
            if (aiMessageContentElement) {
                aiMessageContentElement.innerHTML = await marked.parse(fullResponseText);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

        } catch (error) {
            logError(error, 'Co-pilot');
            const thinkingElement = messagesContainer.querySelector('.thinking');
             if (thinkingElement) {
                messagesContainer.removeChild(thinkingElement);
            }
            // If an error occurs after streaming has started, update the bubble
            if (aiMessageContentElement) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                const userFriendlyError = `<p><strong>Sorry, I couldn't process that request.</strong></p><p><small>Details: ${errorMessage}</small></p>`;
                aiMessageContentElement.innerHTML = userFriendlyError;
                aiMessageContentElement.parentElement?.classList.add('error');
            } else { // Otherwise, add a new error message
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                const userFriendlyError = `<p><strong>Sorry, I couldn't process that request.</strong></p><p><small>Details: ${errorMessage}</small></p>`;
                addMessage('ai', userFriendlyError, true);
            }
        } finally {
            submitButton.disabled = false;
        }
    });
}

/**
 * Generates and renders the Platform Guide content using the Gemini API.
 */
async function setupGuideView() {
    const guideContainer = document.getElementById('guide-content');
    if (!guideContainer) {
      console.error('Guide container not found');
      return;
    }

    // Check if content is already loaded or is loading
    if (guideContainer.innerHTML.trim() !== '' || guideContainer.querySelector('.loading')) {
        return;
    }

    guideContainer.innerHTML = `<div class="loading">Generating Platform Guide...</div>`;

    try {
      if (!API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }

      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const dashboardContext = getDashboardContext();

      const prompt = `
        Act as a senior technical writer for FULXERPRO, an elite investment platform. Your task is to create a comprehensive "Platform Features Guide" for new clients. This guide will be displayed on a dedicated page within the client dashboard.

        The guide should be structured logically, explaining each major feature of the platform. Use the context provided below from the live dashboard to inform your writing. The tone should be professional, confident, and highlight the value and sophistication of each tool.

        For each feature, provide a clear heading and a detailed paragraph explaining its purpose, what the user can see, and how it benefits them.

        Format the output as clean markdown. Use level-3 headings (###) for each feature.

        ---
        DASHBOARD CONTEXT:
        ${dashboardContext}
        ---
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      await render(response.text, guideContainer);

    } catch (error) {
      logError(error, 'Platform Guide');
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      await render(`<h4>Error</h4><p>There was an issue generating the platform guide:</p><pre><code>${errorMessage}</code></pre>`, guideContainer, 'error-card');
    }
}

/**
 * Renders the error log in the Admin view.
 */
function renderAdminView() {
    const adminContent = document.getElementById('admin-content');
    if (!adminContent) {
        console.error('Admin content container not found.');
        return;
    }

    // Clear previous content
    adminContent.innerHTML = '';

    // Add controls
    const controls = document.createElement('div');
    controls.className = 'admin-panel-controls';
    
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Log';
    clearButton.className = 'btn btn-secondary';
    clearButton.onclick = () => {
        errorLog = [];
        renderAdminView();
    };
    controls.appendChild(clearButton);
    adminContent.appendChild(controls);

    // Create log container
    const logContainer = document.createElement('div');
    logContainer.className = 'error-log-container';
    
    if (errorLog.length === 0) {
        logContainer.innerHTML = `<div class="empty-log-message">No errors logged.</div>`;
    } else {
        // Render logs in reverse chronological order
        [...errorLog].reverse().forEach(entry => {
            const entryElement = document.createElement('details');
            entryElement.className = 'error-log-entry';

            const summary = document.createElement('summary');
            
            const timestamp = document.createElement('span');
            timestamp.className = 'log-timestamp';
            timestamp.textContent = new Date(entry.timestamp).toLocaleString();
            
            const context = document.createElement('span');
            context.className = 'log-context';
            context.textContent = entry.context;
            
            const message = document.createElement('span');
            message.className = 'log-message';
            message.textContent = entry.message;

            summary.appendChild(timestamp);
            summary.appendChild(context);
            summary.appendChild(message);

            const details = document.createElement('div');
            details.className = 'log-details';
            if (entry.stack) {
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                code.textContent = entry.stack;
                pre.appendChild(code);
                details.appendChild(pre);
            } else {
                details.textContent = 'No stack trace available.';
            }
            
            entryElement.appendChild(summary);
            entryElement.appendChild(details);
            logContainer.appendChild(entryElement);
        });
    }

    adminContent.appendChild(logContainer);
}


/**
 * Sets up the main navigation to switch between views.
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav a[data-view]');
    const views = document.querySelectorAll('.view-section');

    if (navLinks.length === 0 || views.length === 0) {
        console.error('Navigation links or view sections not found for setup.');
        return;
    }

    const showView = (viewId: string) => {
        // Hide all views
        views.forEach(view => {
            (view as HTMLElement).style.display = 'none';
        });

        // Show the target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.style.display = 'block';
        } else {
             console.error(`View with id "${viewId}" not found.`);
        }

        // Update active nav link state
        navLinks.forEach(link => {
            if (link.getAttribute('data-view') === viewId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.getAttribute('data-view');
            if (viewId) {
                if (viewId === 'guide-view') {
                    // Lazily load the guide content on first click.
                    setupGuideView();
                }
                if (viewId === 'admin-view') {
                    renderAdminView();
                }
                showView(viewId);
            }
        });
    });

    // Set the initial view (dashboard)
    showView('dashboard-view');
}

/**
 * Converts a File object to a base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves with the base64 string.
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = (reader.result as string)?.split(',')[1];
            if (result) {
                resolve(result);
            } else {
                reject(new Error('Failed to convert file to base64.'));
            }
        };
        reader.onerror = error => reject(error);
    });
}


/**
 * Sets up the AI Studio functionality.
 */
function setupAiStudio() {
    // General elements
    const canvas = document.getElementById('ai-studio-canvas');
    const placeholder = document.getElementById('ai-studio-placeholder');
    const loadingOverlay = document.getElementById('ai-studio-loading');
    const loadingMessage = document.getElementById('ai-studio-loading-message');
    const outputContainer = document.getElementById('ai-studio-output');

    // Mode switcher
    const modeButtons = document.querySelectorAll('.mode-btn');

    // Image Generation elements
    const imageForm = document.getElementById('ai-studio-form') as HTMLFormElement;
    const promptInput = document.getElementById('ai-studio-prompt') as HTMLTextAreaElement;
    const aspectSelect = document.getElementById('ai-studio-aspect') as HTMLSelectElement;
    const generateBtn = document.getElementById('ai-studio-generate-btn') as HTMLButtonElement;
    
    // Video Generation elements
    const videoForm = document.getElementById('ai-studio-video-form') as HTMLFormElement;
    const videoPromptInput = document.getElementById('ai-studio-video-prompt') as HTMLTextAreaElement;
    const videoImageInput = document.getElementById('ai-studio-video-image') as HTMLInputElement;
    const generateVideoBtn = document.getElementById('ai-studio-generate-video-btn') as HTMLButtonElement;

    // Edit controls
    const editControls = document.getElementById('ai-studio-edit-controls') as HTMLElement;
    const editForm = document.getElementById('ai-studio-edit-form') as HTMLFormElement;
    const editPromptInput = document.getElementById('ai-studio-edit-prompt') as HTMLTextAreaElement;
    const applyBtn = document.getElementById('ai-studio-apply-btn') as HTMLButtonElement;
    const resetBtn = document.getElementById('ai-studio-reset-btn') as HTMLButtonElement;


    const allElements = [canvas, placeholder, loadingOverlay, outputContainer, imageForm, promptInput, aspectSelect, generateBtn, editControls, editForm, editPromptInput, applyBtn, resetBtn, videoForm, videoPromptInput, videoImageInput, generateVideoBtn, loadingMessage];
    if (allElements.some(el => !el) || modeButtons.length === 0) {
        console.error('One or more AI Studio elements were not found.');
        return;
    }
    
    if (!API_KEY) {
      console.error("API_KEY environment variable not set. AI Studio disabled.");
      const navStudio = document.getElementById('nav-link-studio');
      if (navStudio) {
          navStudio.style.display = 'none';
      }
      return;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    let currentImageBase64: string | null = null;
    let currentMode: 'image' | 'video' = 'image';

    // --- Mode Switching Logic ---
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode') as 'image' | 'video';
            if (mode === currentMode) return;

            currentMode = mode;
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            if (mode === 'image') {
                imageForm.classList.remove('hidden');
                videoForm.classList.add('hidden');
                editControls.style.display = currentImageBase64 ? 'block' : 'none'; // Show edits if image exists
            } else {
                imageForm.classList.add('hidden');
                videoForm.classList.remove('hidden');
                editControls.style.display = 'none'; // Hide edit controls in video mode
            }
        });
    });

    // --- Reset Logic ---
    const resetStudio = () => {
        outputContainer.innerHTML = '';
        placeholder.style.display = 'block';
        editControls.style.display = 'none';
        currentImageBase64 = null;
        promptInput.value = '';
        editPromptInput.value = '';
        videoPromptInput.value = '';
        videoImageInput.value = '';
    };

    resetBtn.addEventListener('click', resetStudio);

    // --- Image Generation Logic ---
    imageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userPrompt = promptInput.value.trim();
        if (!userPrompt) {
            alert('Please describe the visualization you want to generate.');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        loadingMessage.textContent = 'Generating your visualization...';
        loadingOverlay.style.display = 'flex';
        placeholder.style.display = 'none';
        outputContainer.innerHTML = '';
        editControls.style.display = 'none';
        currentImageBase64 = null;

        try {
            const fullPrompt = `
                Generate a professional, high-fidelity financial visualization for an elite investment dashboard.
                The style should be clean, modern, and data-rich, suitable for FULXERPRO INVESTORS.
                Use a dark theme with highlights of blue and green for positive trends.
                Visualization request: "${userPrompt}"
            `;
            
            const aspectRatio = aspectSelect.value as "1:1" | "16:9" | "9:16";

            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: fullPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: aspectRatio,
                },
            });
            
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            currentImageBase64 = base64ImageBytes;
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = userPrompt;
            img.id = 'studio-image'; // Add ID for easy access during edits
            outputContainer.appendChild(img);

            editControls.style.display = 'block';

        } catch (error) {
            logError(error, 'AI Studio');
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            outputContainer.innerHTML = `<div class="error-card"><p><strong>Sorry, there was an issue generating your visualization.</strong></p><p><small>${errorMessage}</small></p></div>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Image';
            loadingOverlay.style.display = 'none';
        }
    });

    // --- Image Editing Logic ---
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editPrompt = editPromptInput.value.trim();

        if (!editPrompt || !currentImageBase64) {
            alert('Please describe your edits. An image must be present to edit.');
            return;
        }

        applyBtn.disabled = true;
        applyBtn.textContent = 'Applying...';
        loadingMessage.textContent = 'Applying your edits...';
        loadingOverlay.style.display = 'flex';

        try {
            const imagePart = {
                inlineData: {
                    mimeType: 'image/png',
                    data: currentImageBase64,
                },
            };
            const textPart = { text: editPrompt };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            let foundImage = false;
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const newBase64 = part.inlineData.data;
                    currentImageBase64 = newBase64; // Update the stored image
                    const newImageUrl = `data:image/png;base64,${newBase64}`;
                    
                    const img = document.getElementById('studio-image') as HTMLImageElement;
                    if (img) {
                        img.src = newImageUrl;
                    }
                    foundImage = true;
                    break;
                }
            }
            
            if (!foundImage) {
                throw new Error("The AI did not return an edited image.");
            }
            
            editPromptInput.value = ''; // Clear input on success

        } catch (error) {
            logError(error, 'AI Studio Edit');
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            alert(`Sorry, there was an issue applying your edits: ${errorMessage}`);
        } finally {
            applyBtn.disabled = false;
            applyBtn.textContent = 'Apply Edits';
            loadingOverlay.style.display = 'none';
        }
    });

    // --- Video Generation Logic ---
    videoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userPrompt = videoPromptInput.value.trim();
        if (!userPrompt) {
            alert('Please describe the video you want to generate.');
            return;
        }

        const file = videoImageInput.files?.[0];
        let imageDetails;
        if (file) {
            try {
                const base64Data = await fileToBase64(file);
                imageDetails = {
                    imageBytes: base64Data,
                    mimeType: file.type,
                };
            } catch (error) {
                logError(error, 'AI Studio Video File');
                alert('There was an error processing your image file. Please try another one.');
                return;
            }
        }
        
        generateVideoBtn.disabled = true;
        generateVideoBtn.textContent = 'Generating...';
        placeholder.style.display = 'none';
        outputContainer.innerHTML = '';
        
        const loadingMessages = [
            "Contacting video synthesis servers...",
            "Analyzing your prompt...",
            "Animating initial keyframes...",
            "Rendering motion vectors...",
            "Upscaling video resolution...",
            "This can take a few minutes...",
            "Finalizing the video sequence..."
        ];
        let messageIndex = 0;
        loadingMessage.textContent = loadingMessages[messageIndex];
        loadingOverlay.style.display = 'flex';
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            loadingMessage.textContent = loadingMessages[messageIndex];
        }, 4000);

        try {
            let operation = await ai.models.generateVideos({
                model: 'veo-2.0-generate-001',
                prompt: userPrompt,
                image: imageDetails,
                config: { numberOfVideos: 1 }
            });

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10s
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!downloadLink) {
                throw new Error("Video generation completed, but no download link was returned.");
            }
            
            loadingMessage.textContent = 'Downloading generated video...';
            
            // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
            const videoResponse = await fetch(`${downloadLink}&key=${API_KEY}`);
            if (!videoResponse.ok) {
                throw new Error(`Failed to download video: ${videoResponse.statusText}`);
            }

            const videoBlob = await videoResponse.blob();
            const videoUrl = URL.createObjectURL(videoBlob);
            
            const videoElement = document.createElement('video');
            videoElement.src = videoUrl;
            videoElement.controls = true;
            videoElement.autoplay = true;
            videoElement.muted = true; // Autoplay often requires mute
            videoElement.loop = true;
            videoElement.style.maxWidth = '100%';
            videoElement.style.maxHeight = '100%';
            
            outputContainer.appendChild(videoElement);

        } catch (error) {
            logError(error, 'AI Studio Video');
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            outputContainer.innerHTML = `<div class="error-card"><p><strong>Sorry, there was an issue generating your video.</strong></p><p><small>${errorMessage}</small></p></div>`;
        } finally {
            clearInterval(messageInterval);
            generateVideoBtn.disabled = false;
            generateVideoBtn.textContent = 'Generate Video';
            loadingOverlay.style.display = 'none';
        }
    });

}

/**
 * Shows an AI-generated analysis of a trader in a modal.
 * @param traderData The data object for the selected trader.
 */
async function showTraderAnalysis(traderData: { name: string, rank: string, ytd: string, trades: string }) {
    const modalOverlay = document.getElementById('trader-analysis-modal-overlay');
    const modalTitle = document.getElementById('trader-analysis-modal-title');
    const modalContent = document.getElementById('trader-analysis-modal-content');

    if (!modalOverlay || !modalTitle || !modalContent) {
        console.error('Trader analysis modal elements not found.');
        return;
    }

    modalTitle.textContent = `AI Trader Analysis: ${traderData.name}`;
    modalContent.innerHTML = `<div class="loading">Generating analysis...</div>`;
    modalOverlay.classList.add('active');

    try {
        if (!API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const prompt = `
            Act as a Senior Investment Analyst for FULXERPRO.
            Your task is to provide a brief, professional analysis of a trader based on the following data.
            The tone should be insightful, objective, and suitable for a sophisticated investor.

            **Trader Data:**
            - **Name:** ${traderData.name}
            - **Rank:** ${traderData.rank}
            - **Year-to-Date Performance:** ${traderData.ytd}
            - **Mock Recent Trades:** ${traderData.trades}

            **Analysis Required:**
            1.  **Trading Strategy:** Based on their rank, performance, and recent trades, what is their likely trading style? (e.g., Aggressive Growth, Value Investing, Momentum Trading, etc.)
            2.  **Risk Profile:** Briefly assess their likely risk profile.
            3.  **Key Holdings Insight:** Comment on one or two of their key holdings from the recent trades.

            Format the output as clean markdown. Use level-4 headings (####) for each section of the analysis.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        await render(response.text, modalContent);

    } catch (error) {
        logError(error, 'Trader Analysis');
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        await render(`<h4>Error</h4><p>Could not generate trader analysis:</p><pre><code>${errorMessage}</code></pre>`, modalContent, 'error-card');
    }
}


/**
 * Sets up the interactive follow buttons and search functionality in the Social Trading widget.
 */
function setupSocialTrading() {
  const followButtons = document.querySelectorAll('.follow-button');
  const searchInput = document.getElementById('social-search-input') as HTMLInputElement;
  const traderListItems = document.querySelectorAll('.trader-list li');
  
  // Setup search functionality
  if (!searchInput || traderListItems.length === 0) {
      console.warn('Social trading search or list elements not found.');
  } else {
      searchInput.addEventListener('input', () => {
          const searchTerm = searchInput.value.toLowerCase().trim();
          traderListItems.forEach(trader => {
              const traderName = trader.querySelector('.trader-name')?.textContent?.toLowerCase() ?? '';
              const shouldShow = traderName.includes(searchTerm);
              (trader as HTMLElement).style.display = shouldShow ? 'flex' : 'none';
          });
      });
  }
  
  // Setup follow button functionality
  if (followButtons.length === 0) {
    console.warn('No follow buttons found.');
  }

  followButtons.forEach(button => {
    const traderInfo = button.previousElementSibling as HTMLElement;
    const traderName = traderInfo?.querySelector('.trader-name')?.textContent || 'trader';
    
    // Set initial ARIA label
    button.setAttribute('aria-label', `Follow ${traderName}`);

    button.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent the modal from opening when clicking the button
      const isFollowing = button.classList.toggle('following');
      
      if (isFollowing) {
        button.textContent = 'Following';
        button.setAttribute('aria-label', `Unfollow ${traderName}`);
      } else {
        button.textContent = '+';
        button.setAttribute('aria-label', `Follow ${traderName}`);
      }
    });
  });

  // Setup AI Analysis Modal
    traderListItems.forEach(item => {
        item.addEventListener('click', () => {
            const rawData = (item as HTMLElement).dataset.traderInfo;
            if (rawData) {
                try {
                    const traderData = JSON.parse(rawData);
                    showTraderAnalysis(traderData);
                } catch (error) {
                    console.error('Failed to parse trader data:', error);
                }
            }
        });
    });

    const modalOverlay = document.getElementById('trader-analysis-modal-overlay');
    const closeModalBtn = document.getElementById('trader-analysis-modal-close-btn');

    if(modalOverlay && closeModalBtn) {
        const closeModal = () => modalOverlay.classList.remove('active');
        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
}

/**
 * Sets up staggered entrance animations for dashboard widgets.
 */
function setupDashboardAnimations() {
  const widgets = document.querySelectorAll('.card-widget');
  if (widgets.length === 0) {
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1 // Trigger when 10% of the element is visible
  });

  widgets.forEach((widget, index) => {
    // Stagger the animation
    (widget as HTMLElement).style.transitionDelay = `${index * 150}ms`;
    observer.observe(widget);
  });
}

/**
 * Animates the global user counter when it scrolls into view.
 */
function setupUserCounterAnimation() {
  const counterElement = document.getElementById('global-user-count');
  if (!counterElement) return;

  const target = 500000;
  const duration = 2000; // 2 seconds

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const currentValue = Math.floor(progress * target);
          counterElement.textContent = currentValue.toLocaleString() + '+';
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(counterElement);
}

/**
 * Sets up the wallet widget functionality.
 */
function setupWallet() {
  const copyBtn = document.getElementById('copy-wallet-btn') as HTMLButtonElement;
  const addressSpan = document.getElementById('wallet-address');

  if (!copyBtn || !addressSpan) {
    console.warn('Wallet widget elements not found.');
    return;
  }

  copyBtn.addEventListener('click', async () => {
    const address = addressSpan.textContent;
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');

      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy wallet address:', err);
    }
  });
}

/**
 * Generates a dynamic, AI-powered asset allocation.
 */
async function setupAssetAllocation() {
  const allocationGrid = document.querySelector('.allocation-grid');

  if (!allocationGrid) {
    console.error('Asset allocation grid not found.');
    return;
  }

  // Show loading state
  allocationGrid.innerHTML = `<div class="loading-small">Generating AI allocation...</div>`;

  try {
    if (!API_KEY) {
      throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const schema = {
      type: Type.OBJECT,
      properties: {
        allocations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "The name of the investment category."
              },
              percentage: {
                type: Type.NUMBER,
                description: "The percentage of the portfolio allocated to this category."
              }
            },
            required: ["category", "percentage"]
          }
        }
      },
      required: ["allocations"]
    };

    const portfolioValue = document.querySelector('.metric-value')?.textContent || '$12M';

    const prompt = `
      Based on a high-net-worth individual's portfolio valued at approximately ${portfolioValue}, generate a plausible and diversified asset allocation strategy suitable for a 'Nexus Growth' (accelerated, diversified returns) risk profile.
      Provide 5 to 7 allocation categories.
      The total percentages should sum up to exactly 100.
      Return the data according to the provided JSON schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    // Clear loading state
    allocationGrid.innerHTML = '';
    
    const jsonResponse = JSON.parse(response.text);
    const allocations = jsonResponse.allocations;

    if (!allocations || !Array.isArray(allocations)) {
      throw new Error('Invalid allocation data received from AI.');
    }
    
    const colors = ['#007aff', '#34c759', '#ff9500', '#ff3b30', '#af52de', '#5856d6', '#5ac8fa'];

    allocations.forEach((item: { category: string, percentage: number }, index: number) => {
      const allocationItem = document.createElement('div');
      allocationItem.className = 'allocation-item';
      allocationItem.style.setProperty('--color', colors[index % colors.length]);

      const categorySpan = document.createElement('span');
      categorySpan.textContent = item.category;

      const percentageSpan = document.createElement('span');
      percentageSpan.textContent = `${item.percentage}%`;

      allocationItem.appendChild(categorySpan);
      allocationItem.appendChild(percentageSpan);
      allocationGrid.appendChild(allocationItem);
    });

  } catch (error) {
    logError(error, 'Asset Allocation');
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    allocationGrid.innerHTML = `<div class="error-card-small"><p>Could not load allocation data.</p><small>${errorMessage}</small></div>`;
  }
}


/**
 * Main application function.
 */
async function main() {
  setupAuthModal();
  setupCopilot();
  setupNavigation();
  setupAiStudio();
  setupSocialTrading();
  setupDashboardAnimations();
  setupUserCounterAnimation();
  setupWallet();
  setupAssetAllocation();

  const insightsContainer = document.getElementById('ai-insights-content');
  if (!insightsContainer) {
    console.error('AI insights container not found');
    return;
  }

  insightsContainer.innerHTML = `<div class="loading">Initializing AI analysis...</div>`;

  try {
    if (!API_KEY) {
      throw new Error("API_KEY environment variable not set.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = `
      Act as the Chief Investment Officer for FULXERPRO, an elite, futuristic investment firm. Your task is to generate compelling content for a client's "AI-Powered Strategic Opportunities" dashboard widget.

      Analyze the current global financial market using your real-time web search capabilities.
      
      Based on your analysis, identify and describe **three exclusive, next-generation investment opportunities** we are currently exploring. These should sound cutting-edge, proprietary, and highly desirable to sophisticated investors.

      For each opportunity, provide:
      1. A compelling name (as a bolded list item).
      2. A brief, powerful one-sentence description of the opportunity.

      Format the output as a clean markdown list.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    await render(response.text, insightsContainer);
    
    // Render sources from grounding metadata
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (sources && sources.length > 0) {
        const sourcesContainer = document.createElement('div');
        sourcesContainer.className = 'ai-sources-container';

        const sourcesTitle = document.createElement('h4');
        sourcesTitle.textContent = 'Sources';
        sourcesContainer.appendChild(sourcesTitle);

        const sourcesList = document.createElement('ul');
        sourcesList.className = 'ai-sources-list';

        sources.forEach(source => {
            if (source.web) {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = source.web.uri;
                link.textContent = source.web.title;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                listItem.appendChild(link);
                sourcesList.appendChild(listItem);
            }
        });

        sourcesContainer.appendChild(sourcesList);
        insightsContainer.appendChild(sourcesContainer);
    }


  } catch (error) {
    logError(error, 'AI Insights');
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    await render(`<h4>Error</h4><p>There was an issue generating strategic insights:</p><pre><code>${errorMessage}</code></pre>`, insightsContainer, 'error-card');
  }
}

main();