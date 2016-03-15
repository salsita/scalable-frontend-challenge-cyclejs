import { div } from '@cycle/dom';


export default function Counter(sources) {

  /*
   * Model
   */

  const state$ = sources.props$;

  /*
   * View
   */

  const vtree$ = state$
    .map(state => div(`Counter: ${state.count}`));

  /*
   * Sinks
   */

  return {DOM: vtree$};
}
