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

  const subs = [];

  const appendViewer = topic => {
    const index = subs.length;
    const viewer = isolate(RemovableGifViewer, Uuid.v4())({DOM, HTTP, topic});

    subs.push([
      viewer.HTTP.subscribe(request => requestSub.onNext(request)),

      viewer.morePlease$.subscribe(() => morePleaseSub.onNext('MORE PLEASE!')),

      viewer.DOM.subscribe(vtree => vtreeSub.onNext({type: 'UPDATED', payload: {index, vtree}})),

      viewer.remove$.subscribe(() => {
        subs[index].map(sub => sub.dispose());
        subs.splice(index, 1);
        vtreeSub.onNext({type: 'REMOVAL_REQUESTED', payload: {index}});
      })
    ]);
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
          state[payload.index] = payload.vtree;
          return state;
        case 'REMOVAL_REQUESTED':
          state.splice(payload.index, 1);
          return state;
      }
    }, [])
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
