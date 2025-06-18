document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const uuidForm = document.getElementById('uuidForm'); 
    const resultDiv = document.getElementById('result'); 
    const copyButton = document.getElementById('copy-uuid'); 

    function getSessionId() {
        const localStorageKey = 'uuid_session_id';
        let sessionId = localStorage.getItem(localStorageKey);

        if (!sessionId) {
            sessionId = getCookie(localStorageKey);
            if (sessionId) {
                localStorage.setItem(localStorageKey, sessionId);
            }
        }

        if (!sessionId) {
            sessionId = crypto.randomUUID();
            try {
                localStorage.setItem(localStorageKey, sessionId);
            } catch (e) {
                setCookie(localStorageKey, sessionId, 365); 
            }
        }
        return sessionId;
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; Secure; SameSite=Lax";
    }

    uuidForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const username = usernameInput.value.trim();
        if (!username) {
            alert('Please enter a username.'); 
            return;
        }

        alert('Fetching UUID...'); 

        const workerUrl = `https://mojang-proxy.hardikb0506.workers.dev/api/uuid/${username}`; 
        const sessionId = getSessionId();

        try {
            const response = await fetch(workerUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId 
                }
            });

            if (response.status === 429) {
                alert('Too many requests. Please wait a moment and try again.'); // Changed to alert
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP error! Status: ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            if (data && data.id) {
                alert(`UUID for ${data.name || username}: ${data.id}`); 
            } else {
                alert(`UUID not found for ${username}.`); 
            }
        } catch (error) {
            console.error('Error fetching UUID:', error);
            alert(`Error: ${error.message}`); 
        }
    });

    copyButton.addEventListener('click', () => {
        alert('Copy functionality is not available when results are shown in alerts.');
    });
});
