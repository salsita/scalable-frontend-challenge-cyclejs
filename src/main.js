import Cycle from '@cycle/core';
import isolate from '@cycle/isolate';

import { makeDOMDriver, div } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';

import Rx from 'rx';

import ActivationButton from './ActivationButton';
import Counter from './Counter';
import MultiGifViewer from './MultiGifViewer';


function main(sources) {

  const { DOM, HTTP } = sources;

  /*
   * Viewer
   */

  const viewer = isolate(MultiGifViewer)({
    DOM, HTTP,
    topics: ['crazy cats', 'cute cats']
  });

  /*
   * Dynamic viewer
   */

  const dynamic = isolate(DynamicGifViewer)({
    DOM, HTTP,
    initialTopics: ['crazy cats', 'cute cats']
  });

  /*
   * Activation button
   */

  const button = isolate(ActivationButton)({DOM});

  /*
   * Counter
   */

  // Redux style, for fun ;-)
  const counterCount$ = Rx.Observable.merge(
    viewer.morePlease$.map(() => ({type: 'MORE_PLEASE'})),
    button.active$.map(active => ({type: 'ACTIVATION_TOGGLED', payload: active}))
  )
  .scan((acc, action) => {
    const { type, payload } = action;
    switch (type) {
      case 'MORE_PLEASE':
        acc.count += (acc.count >= 10 && acc.active ? 2 : 1);
        return acc;
      case 'ACTIVATION_TOGGLED':
        acc.active = payload;
        return acc;
    } 
  }, {count: 0, active: false})
  .map(x => x.count);

  const counter = isolate(Counter)({
    DOM,
    props$: counterCount$.map(count => ({count}))
  });

  /*
   * View
   */

  const vtree$ = Rx.Observable.combineLatest(
    button.DOM, counter.DOM, viewer.DOM, dynamic.DOM
  )
  .map(vtrees => div(vtrees));

  /*
   * Sinks
   */

  return {DOM: vtree$, HTTP: viewer.HTTP};
}

Cycle.run(main, {
  DOM: makeDOMDriver('#app-container'),
  HTTP: makeHTTPDriver({eager: true})
});
