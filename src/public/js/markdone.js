function markAsDone(form) {
  const button = form.querySelector("button");
  const lessonId = button.id.split("-")[1];
  fetch(form.action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        button.textContent = "Done";
        button.disabled = true;
      }
    })
    .catch((error) => console.error("Error:", error));

  return false;
}
