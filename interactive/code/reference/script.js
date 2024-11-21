// Initialize Scrollama
const scroller = scrollama();

// Select text elements
const textElements = document.querySelectorAll(".text");

// Scrollama setup
scroller
  .setup({
    step: ".section", // Observe each section
    offset: 0.5, // Trigger when section is at 50% of viewport
  })
  .onStepEnter((response) => {
    // Reset visibility for all text elements
    textElements.forEach((el) => el.classList.remove("visible"));

    // Make only the current section's text visible
    const currentText = document.querySelector(`#text${response.index + 1}`);
    currentText.classList.add("visible");
  });
