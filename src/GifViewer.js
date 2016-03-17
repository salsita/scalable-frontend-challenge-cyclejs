import { div, h2, img, button } from '@cycle/dom';


export default function GifViewer(sources) {

  const topic = sources.topic;

  /*
   * HTTP - incoming
   */

  const src$ = sources.HTTP
    // Turn a stream of streams of responses into a stream of responses.
    .mergeAll()
    // Drop responses that are not OK or the image URL is missing.
    .filter(res => res.ok && res.body.data.image_url)
    // Map responses to the associated image URLs.
    .map(res => res.body.data.image_url)
    // Start with the loading animation initially.
    .do(src => console.log(`src$ (${topic}): ${src}`))
    .startWith('./loading.gif');

  /*
   * Intent
   */

  const morePlease$ = sources.DOM.select('.more-please').events('click');

  /*
   * Model
   */

  const state$ = src$.map(src => ({src}));

  /*
   * View
   */

  const vtree$ = state$
    .map(state => 
      div([
        h2(topic),
        img('.gif-view', {src: state.src}),
        button('.more-please', 'More please!')
      ])
    );

  /*
   * HTTP - outgoing
   */

  const requests$ = morePlease$
    // Send max 1 request per second.
    .throttle(1000)
    // We need to dispatch initial request on startup.
    .startWith(null)
    .map(() => ({
      url: 'http://api.giphy.com/v1/gifs/random',
      query: {
        api_key: 'dc6zaTOxFJmzC',
        tag: topic
      }
    }))
    .do(req => console.log(`requests$ (${topic}):`, req));

  /*
   * Sinks
   */

  return {DOM: vtree$, HTTP: requests$, morePlease$};
}
