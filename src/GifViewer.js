import { div, h2, img, button } from '@cycle/dom';


export default function GifViewer(sources) {

  /*
   * Sources
   */

  const { src$, topic } = sources;

  /*
   * Intent
   */

  const morePlease$ = sources.DOM.select('.more-please').events('click');

  /*
   * Model
   */

  const state$ = src$
    .map(src => ({src, topic}));

  /*
   * View
   */

  const vtree$ = state$
    .map(state => 
      div([
        h2(state.topic),
        img('.gif-view', {src: state.src}),
        button('.more-please', 'More please!')
      ])
    );

  /*
   * Sinks
   */

  return {
    $morePlease,
    DOM: vtree$
  };
}
