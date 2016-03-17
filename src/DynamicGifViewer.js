import isolate from '@cycle/isolate';
import { div } from '@cycle/dom';

import Rx from 'rx';
import Uuid from 'uuid';

import Input from './Input';
import RemovableGifViewer from './RemovableGifViewer';


export default function DynamicGifViewer(sources) {

  const { DOM, HTTP, initialTopics } = sources;

  /*
   * Input
   */

  const input = isolate(Input, Uuid.v4())({DOM});

  /*
   * Subjects
   */

  const requestSub    = new Rx.ReplaySubject();
  const morePleaseSub = new Rx.ReplaySubject();
  const vtreeSub      = new Rx.ReplaySubject();

  /*
   * Viewers
   */

  const subs = {};

  const appendViewer = topic => {
    const id = Uuid.v4();
    const viewer = isolate(RemovableGifViewer, id)({DOM, HTTP, topic});

    subs[id] = [
      viewer.HTTP.subscribe(request => requestSub.onNext(request)),

      viewer.morePlease$.subscribe(() => morePleaseSub.onNext('MORE PLEASE!')),

      viewer.DOM.subscribe(vtree => vtreeSub.onNext({type: 'UPDATED', payload: {id, vtree}})),

      viewer.remove$.subscribe(() => {
        subs[id].map(sub => sub.dispose());
        delete subs[id];
        vtreeSub.onNext({type: 'REMOVAL_REQUESTED', payload: {id}});
      })
    ];
  }

  // Create initial list of viewers.
  initialTopics.map(topic => appendViewer(topic));

  // Append a new viewer when a new topic is added.
  input.submit$.subscribe(topic => appendViewer(topic));

  /*
   * View
   */

  const vtree$ = vtreeSub
    .scan((state, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'UPDATED':
          if (!state.vtrees[payload.id]) {
            state.order.push(payload.id);
          }
          state.vtrees[payload.id] = payload.vtree;
          return state;
        case 'REMOVAL_REQUESTED':
          console.log('EXEC REMOVE', payload.id);
          delete state.vtrees[payload.id];
          state.order = state.order.filter(x => x !== payload.id);
          return state;
      }
    }, {vtrees: {}, order: []})
    .map(state => state.order.map(id => state.vtrees[id]))
    .map(vtrees => div([input.DOM, ...vtrees]));

  /*
   * Sinks
   */

  return {
    DOM: vtree$,
    HTTP: requestSub,
    morePlease$: morePleaseSub
  };
}
