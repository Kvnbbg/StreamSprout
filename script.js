    /*****************
     * Gamification *
     *****************/
    let xp = 0;
    let level = 1;
    function addXP(amount) {
      xp += amount;
      $('#xp-progress').css('width', (xp % 100) + '%');
      if (xp >= level * 100) {
        level++;
        showAchievement(`Level Up! Now Level ${level}`);
      }
    }
    function showAchievement(text) {
      const badge = $('#achievement-badge');
      badge.text(text).css('right', '20px');
      setTimeout(() => badge.css('right', '-200px'), 3000);
    }
    
    /************
     * VR System *
     ************/
    let vrEnabled = false;
    function toggleVR() {
      vrEnabled = !vrEnabled;
      document.documentElement.style.setProperty('--vr-active', vrEnabled ? 1 : 0);
      $('#vr-toggle').text(`VR Mode: ${vrEnabled ? 'ON' : 'OFF'}`);
      $('.vr-simulator').toggle(vrEnabled);
      if (vrEnabled) {
        $('#vr-toggle').addClass('warning');
        setTimeout(() => {
          if (vrEnabled) alert('Warning: Full VR integration still in development!');
        }, 1000);
      } else {
        $('#vr-toggle').removeClass('warning');
      }
    }
    
    /****************************
     * Simulation Match System  *
     ****************************/
    const teams = ['Sentinels', 'LOUD', 'Fnatic', 'DRX'];
    const mapPool = ['Bind', 'Ascent', 'Split', 'Lotus'];
    function generateMatchSimulation() {
      const team1 = teams[Math.floor(Math.random() * teams.length)];
      const team2 = teams.filter(t => t !== team1)[Math.floor(Math.random() * (teams.length - 1))];
      const map = mapPool[Math.floor(Math.random() * mapPool.length)];
      const score = `${Math.floor(Math.random() * 13)}-${Math.floor(Math.random() * 13)}`;
      $('#match-status').html(`
        <p>Live Match: ${team1} vs ${team2}</p>
        <p>Map: ${map}</p>
        <p>Score: ${score}</p>
      `);
      addXP(10);
    }
    
    /*******************************
     * Secure Chat API Integration *
     *******************************/
    // Toggle chat box visibility
    const chatBox = $('#chat-box');
    const chatLog = $('#chat-log');
    const userInput = $('#user-input');
    $('#chat-trigger').on('click', function() {
      chatBox.toggle();
      userInput.focus();
    });
    // Send chat message on Enter key press
    userInput.on('keypress', function(event) {
      if (event.which === 13 && userInput.val().trim() !== '') {
        const userMessage = userInput.val().trim();
        userInput.val('');
        chatLog.append('<div>User: ' + userMessage + '</div>');
        chatLog.scrollTop(chatLog[0].scrollHeight);
        sendMessageToAPI(userMessage);
      }
    });
    
    // Function to send a message securely to the Java API for TensorFlow LLM
    function sendMessageToAPI(message) {
      // Display temporary loading message
      const tempId = 'temp-' + Date.now();
      chatLog.append('<div id="' + tempId + '">Bot: Processing...</div>');
      chatLog.scrollTop(chatLog[0].scrollHeight);
      $.ajax({
        url: 'https://yourdomain.com/api/llm', // Use your HTTPS endpoint here
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ message: message }),
        // Optionally add headers for CSRF tokens or authentication here
        success: function(response) {
          // Remove the temporary loading message
          $('#' + tempId).remove();
          // Assume the API returns a JSON object with a "response" field
          chatLog.append('<div>Bot: ' + response.response + '</div>');
          chatLog.scrollTop(chatLog[0].scrollHeight);
          addXP(2);
        },
        error: function(xhr, status, error) {
          $('#' + tempId).remove();
          chatLog.append('<div>Bot: Sorry, an error occurred while processing your request.</div>');
          chatLog.scrollTop(chatLog[0].scrollHeight);
        }
      });
    }
    
    /***********************
     * Vault Interactivity *
     ***********************/
    $('#vault').on('click', function() {
      $(this).toggleClass('vault-open');
      addXP(5);
      showAchievement('Vault Explorer Unlocked!');
    });
    
    /**********************************
     * Toggle Simulation Panel (Key: S) *
     **********************************/
    $(document).keypress(function(e) {
      if (e.which === 115) { // 'S' key toggles simulation panel
        $('#simulation-panel').toggle();
      }
    });
    
    /***********************
     * Initialization      *
     ***********************/
    generateMatchSimulation();
    setTimeout(() => showAchievement('Welcome to VALORANT Assistant PRO!'), 1000);
