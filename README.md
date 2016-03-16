# Scalable Frontend with Cycle.js

Implementing the [scalable frontend](https://github.com/slorber/scalable-frontend-with-elm-or-redux) challenge using [Cycle.js](cycle.js.org).

The solution as presented here uses perfect composition and encapsulation.
The components are reused where necessary without them knowing about each other.
This is simply the nature of [components](http://cycle.js.org/components.html)
in Cycle.js. They are simple functions that can be composed and nested infinitely.

The code is written to be easily understood, including some Cycle.js concepts.
It would be fairly easy to make the sources much shorted, but that depends on
the coding style really.

## Setup ##

1. Install Node.js, obviously.
2. `npm install`
3. `npm run pack`
4. Open `dist/index.html` in your browser.

## License ##

`MIT`
