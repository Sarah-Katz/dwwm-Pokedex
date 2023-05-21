document.addEventListener("DOMContentLoaded", () => {
  function closeModal($el) {
    $el.classList.remove("is-active");
  }

  // Add a click event on various child elements to close the parent modal
  (
    document.querySelectorAll(".modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button") || []
  ).forEach(($close) => {
    const $target = $close.closest(".modal");

    $close.addEventListener("click", () => {
      closeModal($target);
    });
  });
});
