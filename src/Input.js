import { div, input, button } from '@cycle/dom';

import Rx from 'rx';


export default function Input(sources) {

  /*
   * Intent
   */

  const input$ = sources.DOM.select('.field').events('input')
    .map(ev => ev.target.value);

  const click$ = sources.DOM.select('.btn').events('click');

  const action$ = Rx.Observable.merge(
    input$.map(value => ({type: 'FIELD_CHANGED', payload: value})),
    click$.map(ev => ({type: 'SUBMIT_CLICKED'}))
  );

  /*
   * Model
   */

  const state$ = action$
    .scan((_, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'FIELD_CHANGED':
          return payload;
        case 'SUBMIT_CLICKED':
          return '';
      }
    })
    .startWith('');

  /*
   * View
   */

  const vtree$ = state$
    .map(state =>
      div([
        input('.field', {type: 'text'}),
        button('.btn', {type: 'submit'}, 'Submit')
      ])
    );

  /*
   * Sinks
   */

  /*
  const submit$ = action$
    .scan((state, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'FIELD_CHANGED':
          return {value: payload, submitted: false};
        case 'SUBMIT_CLICKED':
          return {value: state.value, submitted: true};
      }
    })
    .filter(state => state.submitted)
    .map(state => state.value);
  */

  return {DOM: vtree$};
}
