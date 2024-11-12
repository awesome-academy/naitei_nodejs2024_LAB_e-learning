$(document).ready(function () {
  $("#userDropdown")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      const token = { token: sessionStorage.getItem("accessToken") };
      if (token.token) {
        $.ajax({
          url: "/verify",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(token),
          success: function (response) {
            $(".dropdown-menu-nav-loggedIn").toggleClass("active");
          },
          error: function (error) {
            $(".dropdown-menu-nav-notLoggedIn").toggleClass("active");
          },
        });
      } else {
        $(".dropdown-menu-nav-notLoggedIn").toggleClass("active");
      }
    });

    $("#logout")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      
      $.ajax({
        url: "/logout",
        method: "POST",
        success: function () {
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("user.id");
          sessionStorage.removeItem("user.name");

          window.location.href = "/login";
        },
        error: function (error) {
          console.error("Logout failed:", error);
          alert("Logout failed. Please try again.");
        },
      });
    });
});
