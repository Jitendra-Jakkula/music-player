"use strict";

/* ====================================================================
   Purely cosmetic: keeps the --fill custom property on range inputs
   in sync with their value, so style.css can paint the "filled"
   portion of the track. Does not read or write player state.
   ==================================================================== */

(function initRangeFillStyling() {
  try {
    const ranges = document.querySelectorAll('input[type="range"]');

    ranges.forEach((range) => {
      const updateFill = () => {
        const min = Number(range.min) || 0;
        const max = Number(range.max) || 100;
        const value = Number(range.value) || 0;
        const percent = ((value - min) / (max - min)) * 100;
        range.style.setProperty("--fill", String(percent));
      };

      updateFill();
      range.addEventListener("input", updateFill);

      // The progress bar's value is also updated programmatically by
      // the player (timeupdate), not just by user input.
      const observer = new MutationObserver(updateFill);
      observer.observe(range, { attributes: true, attributeFilter: ["value"] });

      // MutationObserver doesn't fire for the DOM `value` property
      // being set directly (only the attribute), so poll lightly as
      // a fallback for the progress bar specifically.
      if (range.classList.contains("progress")) {
        setInterval(updateFill, 250);
      }
    });
  } catch (error) {
    console.warn("Range fill styling failed to initialize:", error);
  }
})();