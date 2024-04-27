document.addEventListener("DOMContentLoaded", function() {
  "use strict";

  function initialState() {
    var screen = document.createElement("div");
    screen.classList.add("flickr-zoom-screen");

    return {
      screen: screen,
      zoomed: null,
      pan: null,
    };
  }

  var state = initialState();

  window.addEventListener("click", function(clickEvent) {
    // Ignore clicks not on img.flickr-zoom elements
    var target = clickEvent.target;
    if (target.nodeName.toLowerCase() !== "img") return;
    if (!target.classList.contains("flickr-zoom")) return;

    clickEvent.preventDefault();

    var initialPanSetTimeoutId;

    // Viewport dimensions may change between clicks, so fetch them each time.
    var screenW = document.documentElement.clientWidth,
        screenH = document.documentElement.clientHeight;

    if (!state.zoomed) {
      // Create a new image tag so the page layout doesn't change when we zoom.
      // We nullify any element attributes to prevent original styles from applying and
      // remove possible responsive image tags to allow zooming of full size image.
      state.zoomed = document.createElement("img");
      state.zoomed.setAttribute("src", target.getAttribute("src"));
      state.zoomed.classList.add("flickr-zoom", "zoomed");
      state.zoomed.addEventListener("load", panAndZoom);
      document.body.appendChild(state.zoomed);
      document.body.appendChild(state.screen);
      document.body.classList.add("flickr-zoom", "zoomed");
    }
    else {
      // Remove listener, possible setTimeout event and remove cloned image, reseting our state
      window.removeEventListener("mousemove", state.pan, {passive: true});
      clearTimeout(initialPanSetTimeoutId);
      state.zoomed.removeEventListener("load", panAndZoom);
      state.zoomed.parentNode.removeChild(state.zoomed);
      state.screen.parentNode.removeChild(state.screen);
      document.body.classList.remove("flickr-zoom", "zoomed");
      state = initialState();
    }

    function panAndZoom() {
      var naturalW = state.zoomed.naturalWidth,
          naturalH = state.zoomed.naturalHeight;

      state.zoomed.setAttribute("width",  naturalW);
      state.zoomed.setAttribute("height", naturalH);

      var called = 0;
      state.pan = debounce(function(mouseEvent) {
        // On the first pan we want to snap the image into place, but on
        // subsequent pans we want to transition the pan smoothly.  We
        // only need to add the class once, on the second call.
        if (++called === 2) {
          state.zoomed.classList.add("smooth-panning");
        }

        // Convert current mouse position within viewport to coordinates within
        // the zoomed image (includes padding).  This essentially calculates how
        // many pixels of zoomed image to move for each viewport pixel moved.
        // This needs to be done on every mouse move event due to the
        // possibility of offsetWidth/offsetHeight being initialized with
        // incorrect values.
        var zoomW  = state.zoomed.offsetWidth,
            zoomH  = state.zoomed.offsetHeight,
            scaleX = -1 / screenW * (zoomW - screenW),
            scaleY = -1 / screenH * (zoomH - screenH),
            translateX = mouseEvent.clientX * scaleX,
            translateY = mouseEvent.clientY * scaleY;

        state.zoomed.style.transform = "translate(" +translateX + "px, " + translateY + "px)";
      }, 5);

      // Pan to match initial click position.
      // Retry until offsetWidth/offsetHeight are correct because they might not be initialized immediately
      // with proper values.
      (function panToInitialClickPosition() {
        if (state.zoomed.offsetWidth < naturalW && state.zoomed.offsetHeight < naturalH) {
          initialPanSetTimeoutId = setTimeout(panToInitialClickPosition, 0);
        } else {
          state.pan(clickEvent);
        }
      })()

      // …and then on any subsequent mouse movement, unless we're smaller
      // than the viewport.
      if (naturalW > screenW || naturalH > screenH) {
        window.addEventListener("mousemove", state.pan, {passive: true});
      }
    }
  }, false);
});

function debounce(fn, timeoutInMillis) {
  var debounceTimeoutId;
  return function() {
    var args = arguments;
    clearTimeout(debounceTimeoutId);
    debounceTimeoutId = setTimeout(function() {
      fn.apply(this, args);
      debounceTimeoutId = undefined;
    }, timeoutInMillis);
  }
}
