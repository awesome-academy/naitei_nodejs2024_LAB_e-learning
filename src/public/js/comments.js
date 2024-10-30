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

function showRatingToast() {
  const $toastElement = $("#toastNoAutohideRateNote");
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

$("#commentForm").on("submit", function (event) {
  const ratingChecked = $('input[name="rating"]:checked').length > 0;
  const commentText = $('input[name="comment"]').val().trim();

  if (!ratingChecked) {
    event.preventDefault();
    showRatingToast();
  } else if (!commentText) {
    event.preventDefault();
    showCommentToast();
  }
});


