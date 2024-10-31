document.addEventListener("DOMContentLoaded", function () {
  const removeButtons = document.querySelectorAll(".btn-remove");

  removeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const itemId = this.getAttribute("data-item-id");

      fetch("/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Remove the item row from the cart table
            const itemRow = document.querySelector(
              `.cart-item[data-item-id="${itemId}"]`
            );
            if (itemRow) itemRow.remove();

            // Update the total amount
            const totalAmountElem = document.querySelector(
              "tfoot tr td:nth-child(2)"
            );
            const itemPrice = parseFloat(
              this.closest("tr")
                .querySelector("td:nth-child(2)")
                .textContent.replace("$", "")
            );
            const currentTotal = parseFloat(
              totalAmountElem.textContent.replace("$", "")
            );
            const newTotal = currentTotal - itemPrice;
            totalAmountElem.textContent = `$${newTotal.toFixed(2)}`;
          } else {
            alert("Error: " + data.error);
          }
        })
        .catch((error) => {
          console.error("Error removing item:", error);
        });
    });
  });
});
