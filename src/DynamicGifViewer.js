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
   * Viewers
   */

  const newViewer = topic => isolate(GifViewer, topic.replace(' ', '-'))({DOM, HTTP, topic});

  const initialChildren = initialTopics.map(newViewer);

  const children$ = input.submit$
    .scan((children, submitted) => append(children, newViewer(submitted)), initialChildren)
    .startWith(initialChildren)
    .shareReplay(1)
    .do(children => console.log('children$', children));

  /*
   * Composition - HTTP
   */

  const requests$ = children$
    .flatMap(children =>
      Rx.Observable.merge(
        ...children.map(child => child.HTTP)
      )
    );

  /*
   * Composition - morePlease$
   */

  const morePlease$ = children$
    .flatMap(children =>
      Rx.Observable.merge(
        ...children.map(child => child.morePlease$)
      )
    );

  /*
   * Composition - vtree$
   */

  const vtree$ = children$
    .flatMap(children =>
      Rx.Observable.combineLatest(
        ...children.map(child => child.DOM)
      )
    )
    .map(vtrees => div([input.DOM, ...vtrees]));

  /*
   * Sinks
   */

  return {DOM: vtree$, HTTP: requests$, morePlease$};
}

const append = (array, item) => {
  array.push(item);
  return array;
}
