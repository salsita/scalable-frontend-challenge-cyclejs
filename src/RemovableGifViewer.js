import isolate from '@cycle/isolate';
import { div, button } from '@cycle/dom';

import Uuid from 'uuid';

import GifViewer from './GifViewer';


export default function RemovableGifViewer(sources) {
  const child = isolate(GifViewer, Uuid.v4())(sources);
  
  const remove$ = sources.DOM.select('.btn-remove').events('click')
    .do(_ => console.log('remove$ INNER'));

  const vtree$ = child.DOM
    .map(childVTree =>
      div([
        childVTree,
        button('.btn-remove', 'Remove')
      ])
    );

  return {
    ...child,
    remove$,
    DOM: vtree$
  };
}
