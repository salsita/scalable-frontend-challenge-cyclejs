import isolate from '@cycle/isolate';
import { div } from '@cycle/dom';

import Rx from 'rx';

import GifViewer from './GifViewer';


export default function DynamicGifViewer(sources) {

  const { DOM, HTTP, topics$ } = sources;

  /*
   * Intent
   */

  const click$ = DOM.select('.add-button').event('click');
  const input$

  /*
   * Create child components
   */

  const children$ = topics$
    .map(topics =>
      topics.map(topic =>
        isolate(GifViewer, topic.replace(' ', '-'))({DOM, HTTP, topic})
      )
    );

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
    .map(vtrees => div(vtrees));

  /*
   * Sinks
   */

  return {DOM: vtree$, HTTP: requests$, morePlease$};
}
