import { forEach } from 'substance'
import wrapSnippet from '../util/wrapSnippet'
import kitchenSink from '../../examples/docs/kitchensink'
import stencilaIntro from '../../examples/docs/stencila-intro'
import simpleSheet from '../../examples/docs/simple-sheet'
import MemoryBuffer from './MemoryBuffer'

/*
  NOTE: We know that MemoryBuffer interally works synchronously, so we don't
        wait for the promise for seeding.
*/
let stencilaIntroBuffer = new MemoryBuffer()
stencilaIntroBuffer.writeFile('index.html', 'text/html', wrapSnippet(stencilaIntro))

let kitchenSinkBuffer = new MemoryBuffer()
kitchenSinkBuffer.writeFile('index.html', 'text/html', wrapSnippet(kitchenSink))

let simpleSheetBuffer = new MemoryBuffer()
simpleSheetBuffer.writeFile('index.html', 'text/html', wrapSnippet(simpleSheet))

/*
  Same layout as the ~/.stencila/library.json file which is used to power
  Stencila Desktop. On the hub we may use a completely different layout
  stored in the database.
*/
const LIBRARY_FIXTURE = {
  'stencila-intro': {
    type: 'document',
    title: 'Welcome to Stencila',
    createdAt: '2017-03-10T00:03:12.060Z',
    modifiedAt: '2017-03-10T00:03:12.060Z',
    // just there to simulate the virtual file system
    __buffer: stencilaIntroBuffer
  },
  'kitchen-sink': {
    type: 'document',
    title: 'Kitchen Sink Document',
    createdAt: '2017-03-10T00:03:12.060Z',
    modifiedAt: '2017-03-10T00:03:12.060Z',
    // just there to simulate the virtual file system
    __buffer: kitchenSinkBuffer
  },
  'simple-sheet': {
    type: 'sheet',
    title: 'Simple Sheet',
    createdAt: '2017-03-12T00:03:12.060Z',
    modifiedAt: '2017-03-12T00:03:12.060Z',
    openedAt: '2017-03-12T00:03:12.060Z',
    // just there to simulate an HTML file on the file system
    __buffer: simpleSheetBuffer
  }
}

export default class BackendStub {

  /*
    Returns a list of document entries to power the dashboard UI

    Should be sorted by openedAt
  */
  listDocuments() {
    return new Promise(function(resolve) {
      let documentEntries = []
      forEach(LIBRARY_FIXTURE, (doc, documentId) => {
        documentEntries.push({
          id: documentId,
          type: doc.type,
          address: documentId,
          title: doc.title,
          openedAt: doc.openedAt,
          createAt: doc.modifiedAt,
          modifiedAt: doc.modifiedAt,
        })
      })
      resolve(documentEntries)
    })
  }

  /*
    Returns a buffer object.

    Use MemoryBuffer implementation as an API reference
  */
  getBuffer(documentId) {
    return new Promise(function(resolve) {
      resolve(LIBRARY_FIXTURE[documentId].__buffer)
    })
  }

  storeBuffer(/*buffer*/) {
    return Promise.resolve()
  }

  updateManifest(/* documentId, props */) {
    return Promise.resolve()
  }

}
