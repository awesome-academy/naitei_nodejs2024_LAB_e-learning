document.getElementById("#paymentSubmit").onsubmit = async function (event) {
  event.preventDefault();
  const response = await fetch("/payments/submit", {
    method: "POST",
    body: new FormData(this),
  });
  if (response.ok) {
    const paymentSuccessImg = document.getElementById("paymentSuccess");
    paymentSuccessImg.style.display = "block";
    setTimeout(() => {
      paymentSuccessImg.style.display = "none";
      window.location.href = "/";
    }, 2000);
  } else {
    alert("Thanh toán không thành công. Vui lòng thử lại.");
  }
};
