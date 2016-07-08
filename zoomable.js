(function(window, document){
  'use strict';

  function initialState() {
    var screen = document.createElement('div');
    screen.classList.add('zoomable-screen');

    return {
      screen: screen,
      zoomed: null,
      pan: null,
    };
  }

  var state = initialState();

  window.addEventListener('click', function(clickEvent) {

    // Ignore clicks not on img.zoomable elements
    var target = clickEvent.target;
    if (target.nodeName.toLowerCase() !== "img") return;
    if (!target.classList.contains("zoomable"))  return;

    clickEvent.preventDefault();

    // Viewport dimensions may change between clicks, so fetch them each time.
    var screenW = document.documentElement.clientWidth,
        screenH = document.documentElement.clientHeight;

    if (!state.zoomed) {
      // Clone the image so the page layout doesn't change when we zoom.
      // We nullify any element id to prevent duplicates.
      state.zoomed = target.cloneNode(false);
      state.zoomed.removeAttribute("id");
      state.zoomed.classList.add('zoomed');
      document.body.appendChild(state.zoomed);
      document.body.appendChild(state.screen);

      state.zoomed.setAttribute("width",  state.zoomed.naturalWidth);
      state.zoomed.setAttribute("height", state.zoomed.naturalHeight);

      // Convert current mouse position within viewport to coordinates within
      // the zoomed image (includes padding).  This essentially calculates how
      // many pixels of zoomed image to move for each viewport pixel moved.
      var zoomW  = state.zoomed.offsetWidth,
          zoomH  = state.zoomed.offsetHeight,
          scaleX = -1 / screenW * (zoomW - screenW),
          scaleY = -1 / screenH * (zoomH - screenH);

      var called = 0;
      state.pan = function(mouseEvent) {
        // On the first pan we want to snap the image into place, but on
        // subsequent pans we want to transition the pan smoothly.  We
        // only need to add the class once, on the second call.
        if (++called === 2)
          state.zoomed.classList.add('smooth-panning');

        state.zoomed.style.left = mouseEvent.clientX * scaleX + "px";
        state.zoomed.style.top  = mouseEvent.clientY * scaleY + "px";
      };

      // Pan to match initial click position…
      state.pan(clickEvent);

      // …and then on any subsequent mouse movement, unless we're smaller
      // than the viewport.
      if (zoomW > screenW || zoomH > screenH)
        window.addEventListener('mousemove', state.pan, false);
    }
    else {
      // Remove listener and remove cloned image, reseting our state
      window.removeEventListener('mousemove', state.pan, false);
      state.zoomed.parentNode.removeChild(state.zoomed);
      state.screen.parentNode.removeChild(state.screen);
      state = initialState();
    }

  }, false);

})(window, document);
