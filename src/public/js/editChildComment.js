function showToastEditSuccess(message) {
  const $toastElement = $("#toastNoAutohideEditCmtSuccess");
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

function showToastEditFailure(message) {
  const $toastElement = $("#toastNoAutohideEditCmtFailure");
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

$(".edit-child-btn").on("click", function (event) {
  event.preventDefault();
  const commentId = $(this).data("id");
  const $editInput = $(`.edit-child-input[data-id='${commentId}']`);
  $editInput.toggleClass("hidden");
});

$(".submit-edit-child-btn").on("click", function (event) {
  event.preventDefault();
  const commentId = $(this).data("id");
  const updatedText = $(
    `.edit-child-input[data-id='${commentId}'] input[name='comment_text']`
  )
    .val()
    .trim();

  if (updatedText) {
    $.ajax({
      url: `/comments/update/${commentId}`,
      type: "PUT",
      data: { comment_text: updatedText },
      success: function (response) {
        $(`.card[data-id='${commentId}'] .card-body p`).text(updatedText);
        $(`.edit-child-input[data-id='${commentId}']`).addClass("hidden");
        showToastEditSuccess();
        location.reload();
      },
      error: function (error) {
        showToastEditFailure();
      },
    });
  } else {
    showCommentToast();
  }
});
