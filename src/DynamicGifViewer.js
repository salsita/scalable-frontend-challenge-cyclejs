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

  const appendViewer = topic => {
    const id = Uuid.v4();
    const viewer = isolate(RemovableGifViewer, id)({DOM, HTTP, topic, id});

    viewer.HTTP.subscribe(request => requestSub.onNext(request));
    viewer.morePlease$.subscribe(() => morePleaseSub.onNext('MORE PLEASE!'));
    viewer.DOM.subscribe(vtree => vtreeSub.onNext({type: 'UPDATED', payload: {id, vtree}}));
    viewer.remove$.subscribe(() => vtreeSub.onNext({type: 'REMOVAL_REQUESTED', payload: {id}}));
  }

  // Create initial list of viewers.
  initialTopics.map(topic => appendViewer(topic));

  // Append a new viewer when a new topic is added.
  input.submit$.subscribe(topic => appendViewer(topic));

  /*
   * View
   */

  const vtree$ = vtreeSub
    .do(action => console.log('vtreeSub', action))
    .scan((state, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'UPDATED':
          for (let i in state) {
            if (state[i].id === payload.id) {
              state[i].vtree = payload.vtree;
              return state;
            }
          }
          state.push(payload);
          return state;
        case 'REMOVAL_REQUESTED':
          return state.filter(viewer => viewer.id !== payload.id);
      }
    }, [])
    .map(viewers => viewers.map(viewer => viewer.vtree))
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
