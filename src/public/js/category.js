function setCategoryAndRedirect(categoryName) {
  localStorage.setItem("category", categoryName);
  window.location.href = "/courses";
}

$(document).ready(function () {
  $.ajax({
    url: `/categories`,
    method: "GET",
    contentType: "application/json",
    success: function (response) {
      $(".row.g-2.m-2").empty();
      if (response.categories && response.categories.length > 0) {
        response.categories.forEach((category) => {
          const categoryHtml = `<div class="col-lg-3 col-md-6 text-center">
              <div class="content shadow p-3 mb-2 wow fadeInUp" data-wow-delay="0.3s" data-category="${category.name}">
              <h5 class="my-2">
                <a href="#" class="text-center" onclick="setCategoryAndRedirect('${category.name}')">
                  ${category.name}
                </a>
              </h5>
            </div>`;
          $(".row.g-2.m-2").append(categoryHtml);
        });
      }
    },
  });
});
