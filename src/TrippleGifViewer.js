import isolate from '@cycle/isolate';
import { div } from '@cycle/dom';

import Rx from 'rx';

import GifViewer from './GifViewer';


export default function TrippleGifViewer(sources) {

  const { DOM, HTTP } = sources;

  /*
   * Create child components
   */

  const children = ['crazy cats', 'cute cats', 'funny cats']
    .map(topic => isolate(GifViewer, topic.replace(' ', '-'))({DOM, HTTP, topic}));

  /*
   * Composition - HTTP
   */

  const requests$ = Rx.Observable.merge(
    ...children.map(child => child.HTTP)
  );

  /*
   * Composition - morePlease$
   */

  const morePlease$ = Rx.Observable.merge(
    ...children.map(child => child.morePlease$)
  );

  /*
   * Composition - vtree$
   */

  const vtree$ = Rx.Observable.combineLatest(
    ...children.map(child => child.DOM)
  )
  .map(vtrees => div(vtrees));


  /*
   * Sinks
   */

  return {DOM: vtree$, HTTP: requests$, morePlease$};
}
