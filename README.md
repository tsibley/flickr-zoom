# flickr-zoom

[Flickr][]-style “fullscreen” (full viewport) click-to-zoom,
mouse-to-pan for your own `<img>` tags.

[Flickr]: https://flickr.com

## Usage

1. Include the CSS and JS in your HTML document:

   ```html
   <link rel="stylesheet" type="text/css" href="flickr-zoom.css">
   <script type="text/javascript" src="flickr-zoom.js"></script>
   ```

   Where you choose to include it is up to you; the code does not care.

2. Mark up `<img>` elements with the `flickr-zoom` class as desired.
   When specified images are larger than viewport then flickr-zoom will simply
   expand to their natural size.

3. Open up your document and try it out!

### Responsive Images

Responsive images with `sizes` and `srcset` attributes are also supported,
but in these cases flickr-zoom assumes that the full size image is specified
with the `src` attribute. This approach allows pages to be loaded as fast as possible
by initially loading smaller image sizes for the user, but clicking on these images makes still
zooming and panning possible.

### Loading Spinner Color

When responsive images are used then loading of full size image might take some time.
For this a loading spinner animation is shown.

Color of this spinner can be changed via CSS variable:

   ```css
   :root {
     --flickr-zoom-screen-loader-color: #e9e9e9;
   }
   ```
