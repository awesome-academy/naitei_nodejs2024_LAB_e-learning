document.getElementById('update-form').addEventListener('submit', async (e) => {
  e.preventDefault();
    const formData = new FormData(e.target);

try {
    const response = await $.ajax({
        url: "/account/edit",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
      });
    //   const response = await fetch('/account/edit', {
    //     method: 'POST',
    //     body: formData
    //     });

    const result = await response.json();

    if (result.errors) {
    // Display errors in the form fields
    for (let field in result.errors) {
        const input = document.querySelector(`#update-form [name="${field}"]`);
        if (input) {
        input.classList.add('is-invalid');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message text-danger';
        errorMsg.innerText = result.errors[field];
        input.parentElement.appendChild(errorMsg);
        }
      }
    } else {
    // Handle successful submission (e.g., close modal or show success message)
    }
  } catch (error) {
    if (error.responseJSON && error.responseJSON.errors) {
        // Display each validation error next to the input field
        const errors = error.responseJSON.errors;
        for (const [field, message] of Object.entries(errors)) {
          const inputField = document.querySelector(`#${field}`);
          if (inputField) {
            const errorElement = document.createElement("div");
            errorElement.className = "error-message text-danger mt-1";
            errorElement.textContent = message;
            inputField.parentNode.appendChild(errorElement);
          }
        }
      } else {
        console.error('Error submitting form:', error);
      } 
  }
});
