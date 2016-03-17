import { div, input, button } from '@cycle/dom';

import Rx from 'rx';


export default function Input(sources) {

  /*
   * Intent
   */

  const input$ = sources.DOM.select('.field').events('input')
    .share()
    .map(ev => ev.target.value);

  const click$ = sources.DOM.select('.btn').events('click')
    .share();

  const action$ = Rx.Observable.merge(
    input$.map(value => ({type: 'FIELD_CHANGED', payload: value})),
    click$.map(() => ({type: 'SUBMIT_CLICKED'}))
  )
  .share()
  .do(action => console.log('action$', action));

  /*
   * Model
   */

  const state$ = action$
    .map(action => {
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
        input('.field', {type: 'text', value: state}),
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
    .map(state => state.value)
    .do(submitted => console.log('submit$', submitted));
  */

  const submit$ = input$
    .buffer(() => click$)
    .filter(buffer => buffer.length !== 0)
    .map(buffer => buffer[buffer.length-1])
    .share()
    .do(topic => console.log('submit$', topic));

  return {DOM: vtree$.share(), submit$: submit$.share()};
}
