document.addEventListener('DOMContentLoaded', () => {
    const uuidForm = document.getElementById('uuidForm');
    const usernameInput = document.getElementById('username');

    uuidForm.addEventListener('submit', async (event) => {
        // Prevent the default form submission which would reload the page
        event.preventDefault();

        const username = usernameInput.value.trim();

        if (!username) {
            alert('Please enter a Minecraft username.');
            return;
        }

        const apiUrl = `https://api.mojang.com/users/profiles/minecraft/${username}`;

        try {
            // Make the API request
            const response = await fetch(apiUrl);

            // Check if the response was successful (status code 200-299)
            if (response.ok) {
                const data = await response.json(); // Parse the JSON response
                
                // The UUID is usually in the 'id' field
                if (data && data.id) {
                    alert(`UUID for ${username}: ${data.id}`);
                } else {
                    // This might happen if the username is valid but doesn't return an expected structure
                    alert(`Could not find UUID for username: ${username}. It might be an old or invalid username.`);
                }
            } else if (response.status === 404) {
                alert(`Error: Username '${username}' not found.`);
            } else {
                // Handle other HTTP errors
                alert(`Error fetching UUID: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            // Handle network errors or issues with the fetch operation
            console.error('Fetch error:', error);
            alert('A network error occurred. Please check your internet connection or try again later.');
        } finally {
            // Optional: Clear the input field after submission
            usernameInput.value = '';
        }
    });
});