function showToastDeleteSuccess(message) {
  const $toastElement = $("#toastNoAutohideDeleteCmtSuccess");
  if ($toastElement.length) {
    $toastElement.find(".toast-body").text(message);
    $toastElement.css("display", "block");
    const toast = new bootstrap.Toast($toastElement[0]);
    toast.show();
    setTimeout(() => {
      $toastElement.fadeTo(1000, 0, function () {
        $toastElement.css("display", "none").css("opacity", 1);
      });
    }, 3000);
  }
}

function showToastDeleteFailure(message) {
  const $toastElement = $("#toastNoAutohideDeleteCmtFailure");
  if ($toastElement.length) {
    $toastElement.find(".toast-body").text(message);
    $toastElement.css("display", "block");
    const toast = new bootstrap.Toast($toastElement[0]);
    toast.show();
    setTimeout(() => {
      $toastElement.fadeTo(1000, 0, function () {
        $toastElement.css("display", "none").css("opacity", 1);
      });
    }, 3000);
  }
}

$(".delete-btn").on("click", function (event) {
  event.preventDefault();
  const commentId = $(this).data("id");

  if (confirm("Are you sure you want to delete this comment?")) {
    $.ajax({
      url: `/comments/${commentId}`,
      type: "DELETE",
      success: function (response) {
        $(`.card[data-id='${commentId}']`).remove();
        showToastDeleteSuccess();
      },
      error: function (error) {
        showToastDeleteFailure();
      },
    });
  }
});
