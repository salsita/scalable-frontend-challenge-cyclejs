import { div, button } from '@cycle/dom';

import Rx from 'rx';


export default function ActivationButton(sources) {

  /*
   * Intent
   */

  const clicked$ = sources.DOM.select('button').events('click');

  /*
   * Model
   */

  const state$ = clicked$
    .startWith(false)
    .scan(active => !active)
    .map(active => ({active}));

  /*
   * View
   */

  const vtree$ = state$
    .map(state =>
      div([
        (state.active ?
          button('.button-green', 'Deactivate') :
          button('.button-red', 'Activate'))
      ])
    );

  /*
   * Sinks
   */

  return {
    DOM: vtree$,
    active$: state$.map(state => state.active)
  };
}
