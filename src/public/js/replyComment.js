function showCommentToast() {
  const $toastElement = $("#toastNoAutohideCmtNote");
  if ($toastElement.length) {
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

$(".reply-btn").on("click", function (event) {
  event.preventDefault();
  const commentId = $(this).data("id");
  const $replyInput = $(`.reply-input[data-id='${commentId}']`);
  $replyInput.toggleClass("hidden");
});

$(".submit-reply-btn").on("click", function (event) {
  event.preventDefault();
  $.post(
    $(this).closest("form").attr("action"),
    $(this).closest("form").serialize()
  )
    .done(function () {
      location.reload();
    })
    .fail(function () {
      showCommentToast();
    });
});
