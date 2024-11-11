(function ($) {
  "use strict";

  // Spinner
  var spinner = function () {
    setTimeout(function () {
      if ($("#spinner").length > 0) {
        $("#spinner").removeClass("show");
      }
    }, 1);
  };
  spinner();

  // Initiate the wowjs
  new WOW().init();

  // Sticky Navbar
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".sticky-top").css("top", "0px");
    } else {
      $(".sticky-top").css("top", "-100px");
    }
  });

  // Dropdown on mouse hover
  const $dropdown = $(".dropdown");
  const $dropdownToggle = $(".dropdown-toggle");
  const $dropdownMenu = $(".dropdown-menu");
  const showClass = "show";

  $(window).on("load resize", function () {
    if (this.matchMedia("(min-width: 992px)").matches) {
      $dropdown.hover(
        function () {
          const $this = $(this);
          $this.addClass(showClass);
          $this.find($dropdownToggle).attr("aria-expanded", "true");
          $this.find($dropdownMenu).addClass(showClass);
        },
        function () {
          const $this = $(this);
          $this.removeClass(showClass);
          $this.find($dropdownToggle).attr("aria-expanded", "false");
          $this.find($dropdownMenu).removeClass(showClass);
        }
      );
    } else {
      $dropdown.off("mouseenter mouseleave");
    }
  });

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });
  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
    return false;
  });

  // Header carousel
  $(".header-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1500,
    items: 1,
    dots: false,
    loop: true,
    nav: true,
    navText: [
      '<i class="bi bi-chevron-left"></i>',
      '<i class="bi bi-chevron-right"></i>',
    ],
  });

  // Testimonials carousel
  $(".testimonial-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    center: true,
    margin: 24,
    dots: true,
    loop: true,
    nav: false,
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 2,
      },
      992: {
        items: 3,
      },
    },
  });
})(jQuery);


function showUpdateForm(id, name, phoneNumber, dateOfBirth, gender, address, identityCard, additionalInfo) {
  document.getElementById('update-id').value = id;
  document.getElementById('update-name').value = name || '';
  document.getElementById('update-phone_number').value = phoneNumber || '';
  document.getElementById('update-date_of_birth').value = dateOfBirth || '';
  document.getElementById('update-gender').value = gender || ''; 
  document.getElementById('update-address').value = address || '';
  document.getElementById('update-identity_card').value = identityCard || '';
  document.getElementById('update-additional_info').value = additionalInfo || '';
  
  document.getElementById('editModal').classList.remove('hidden');
}
function hideUpdateForm() {
  document.getElementById('editModal').classList.add('hidden');
}

function showResetPasswordPopup() {
  document.getElementById('resetPasswordModal').classList.remove('hidden');
}

function hideResetPasswordPopup() {
  document.getElementById('resetPasswordModal').classList.add('hidden');
}

document.getElementById('reset-password-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const userId = document.querySelector('input[name="userId"]').value;
  const currentPassword = document.querySelector('input[name="currentPassword"]').value;
  const newPassword = document.querySelector('input[name="newPassword"]').value;
  const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;

  if (newPassword !== confirmPassword) {
    alert('Mật khẩu mới không khớp. Vui lòng kiểm tra lại.');
    return;
  }

  try {
    const response = await fetch(`/account/reset-password/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const result = await response.json();
    if (response.ok) {
      alert('Mật khẩu đã được thay đổi thành công!');
      hideResetPasswordPopup();
    } else {
      alert(result.message || 'Đã có lỗi xảy ra');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    alert('Đã có lỗi xảy ra');
  }
});
