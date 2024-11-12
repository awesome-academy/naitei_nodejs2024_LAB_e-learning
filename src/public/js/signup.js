document.querySelector("#registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      password: formData.get("password"),
      phone_number: formData.get("phone_number"),
      date_of_birth: formData.get("date_of_birth"),
      gender: formData.get("gender"),
      address: formData.get("address"),
      identity_card: formData.get("identity_card"),
      additional_info: formData.get("additional_info"),
      department: formData.get("department"),
      years_of_experience: formData.get("years_of_experience"),
    };
    document.querySelectorAll(".error-message").forEach(el => el.remove());
    try {
      const response = await $.ajax({
        url: "/register",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
      });
      if (response.status === 201) {
        const toastElement = document.getElementById("toastNoAutohideSuccess");
        toastElement.style.removeProperty("display");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } 
    } catch (error) {
      if (error.responseJSON && error.responseJSON.errors) {
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
        const toastElement = document.getElementById("toastNoAutohideError");
        toastElement.style.removeProperty("display");
        setTimeout(() => {
          toastElement.style.display = "none";
        }, 2000);
      }
    }
  });
  document.querySelector("#role").addEventListener("change", function () {
    const isProfessor = this.value === "professor";
    document.querySelector(".department-field").style.display = isProfessor ? "block" : "none";
    document.querySelector(".years-experience-field").style.display = isProfessor ? "block" : "none";
  });