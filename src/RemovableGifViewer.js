import isolate from '@cycle/isolate';
import { div, button } from '@cycle/dom';

import Uuid from 'uuid';

import GifViewer from './GifViewer';


export default function RemovableGifViewer(sources) {
  const id = sources.id;
  const child = isolate(GifViewer, Uuid.v4())(sources);
  
  const remove$ = sources.DOM.select('.btn-remove' + id).events('click')
    .do(_ => console.log('remove$ INNER', id));

  const vtree$ = child.DOM
    .map(childVTree =>
      div([
        childVTree,
        button('.btn-remove' + id, 'Remove')
      ])
    );

  return {
    ...child,
    remove$,
    DOM: vtree$
  };
}
