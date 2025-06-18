document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const fetchButton = document.getElementById('fetch-uuid');
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

    fetchButton.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        if (!username) {
            resultDiv.textContent = 'Please enter a username.';
            resultDiv.style.color = 'orange';
            copyButton.style.display = 'none';
            return;
        }

        resultDiv.textContent = 'Fetching UUID...';
        resultDiv.style.color = 'white';
        copyButton.style.display = 'none';

        const workerUrl = `https://mojang-proxy.YOUR_SUBDOMAIN.workers.dev/api/uuid/${username}`; 
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
                resultDiv.textContent = 'Too many requests. Please wait a moment and try again.';
                resultDiv.style.color = 'red';
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
                resultDiv.textContent = `UUID for ${data.name || username}: ${data.id}`;
                resultDiv.style.color = 'lightgreen';
                copyButton.dataset.uuid = data.id;
                copyButton.style.display = 'block';
            } else {
                resultDiv.textContent = `UUID not found for ${username}.`;
                resultDiv.style.color = 'orange';
            }
        } catch (error) {
            console.error('Error fetching UUID:', error);
            resultDiv.textContent = `Error: ${error.message}`;
            resultDiv.style.color = 'red';
        }
    });

    copyButton.addEventListener('click', () => {
        const uuidToCopy = copyButton.dataset.uuid;
        if (uuidToCopy) {
            navigator.clipboard.writeText(uuidToCopy).then(() => {
                alert('UUID copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy UUID:', err);
            });
        }
    });
});