import isolate from '@cycle/isolate';
import { div } from '@cycle/dom';

import Rx from 'rx';

import GifViewer from './GifViewer';
import Input from './Input';


export default function DynamicGifViewer(sources) {

  const { DOM, HTTP, initialTopics } = sources;

  /*
   * Input
   */

  const input = isolate(Input)({DOM});

  /*
   * Subject - requests$
   */

  const requestSub = new Rx.ReplaySubject();

  /*
   * Subject - morePlease$
   */

  const morePleaseSub = new Rx.ReplaySubject();

  /*
   * Subject - vtree$
   */

  const vtreeSub = new Rx.ReplaySubject();

  /*
   * Viewers
   */

  const viewers = [];

  const newViewer = (topic, index) => {
    const child = isolate(GifViewer, topic.replace(' ', '-'))({DOM, HTTP, topic});
    child.DOM.subscribe(vtree => vtreeSub.onNext({vtree, index}));
    child.HTTP.subscribe(req => requestSub.onNext(req));
    child.morePlease$.subscribe(() => morePleaseSub.onNext(null));
    viewers.push(child);
  }

  const appendViewer = topic => newViewer(topic, viewers.length);

  initialTopics.map(appendViewer);
  input.submit$.subscribe(topic => appendViewer(topic));

  /*
   * View
   */

  const vtree$ = vtreeSub
    .scan((acc, next) => {
      const { vtree, index } = next;
      acc[index] = vtree;
      return acc;
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
