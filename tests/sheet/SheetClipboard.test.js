import test from 'tape'
import { DefaultDOMElement as DOM, flatten } from 'substance'
import SheetClipboard from '../../src/sheet/SheetClipboard'
import StubEngine from '../util/StubEngine'
import setupSheetSession from '../util/setupSheetSession'
import { setSheetSelection, getSources, checkSelection, queryCells } from '../util/sheetTestHelpers'

test('SheetClipboard: copy', (t) => {
  let fixture = simple()
  let { sheetSession, sheetClipboard } = _setup(simple())
  setSheetSelection(sheetSession, 'A1:C3')
  let fixtureCells = queryCells(fixture.cells, 'A1:C3')
  let evt = new ClipboardEvent()
  sheetClipboard.onCopy(evt)
  let data = evt.clipboardData.data
  let plainText = data['text/plain']
  let html = data['text/html']
  t.ok(plainText, 'there should be a plain text copy')
  t.equal(plainText, fixtureCells.map(row => row.join('\t')).join('\n'), '.. encoded as tab separated values')
  t.ok(html, 'there should be an html copy')
  let dom = DOM.parseHTML(html)
  t.equal(dom.findAll('tr').length, 3, '.. with 3 <tr>')
  t.equal(dom.findAll('td').length, 9, '.. with 9 <td>')
  t.deepEqual(
    dom.findAll('td').map(td => td.textContent),
    flatten(fixtureCells),
    '.. and correct cell content'
  )
  t.end()
})

test('SheetClipboard: cut', (t) => {
  let fixture = simple()
  let { sheetSession, sheetClipboard, sheet } = _setup(simple())
  setSheetSelection(sheetSession, 'A1:B2')
  // Note: these are just the data provided as fixture
  let fixtureCells = queryCells(fixture.cells, 'A1:B2')
  let evt = new ClipboardEvent()
  sheetClipboard.onCut(evt)
  let data = evt.clipboardData.data
  let plainText = data['text/plain']
  let html = data['text/html']
  t.ok(plainText, 'there should be a plain text copy')
  t.equal(plainText, fixtureCells.map(row => row.join('\t')).join('\n'), '.. encoded as tab separated values')
  t.ok(html, 'there should be an html copy')
  let dom = DOM.parseHTML(html)
  t.deepEqual(
    dom.findAll('td').map(td => td.textContent),
    flatten(fixtureCells),
    '.. with correct cell contents'
  )
  // Note: these are real cells
  let cells = queryCells(sheet.getCellMatrix(), 'A1:B2')
  t.deepEqual(getSources(cells), [['', ''], ['', '']], 'cells should be empty')
  t.end()
})

test('SheetClipboard: paste html', (t) => {
  let { sheetSession, sheetClipboard, sheet } = _setup(simple())
  setSheetSelection(sheetSession, 'B2:B2')
  let htmlStr = _createHtml([['1', '2'],['3', '4']])
  let evt = new ClipboardEvent()
  evt.clipboardData.setData('text/html', htmlStr)
  sheetClipboard.onPaste(evt)
  let cells = queryCells(sheet.getCellMatrix(), 'B2:C3')
  t.deepEqual(getSources(cells), [['1', '2'], ['3', '4']], 'table should have been pasted')
  let sel = sheetSession.getSelection()
  checkSelection(t, sel, 'B2:C3')
  t.end()
})

test('SheetClipboard: paste plain text', (t) => {
  let { sheetSession, sheetClipboard, sheet } = _setup(simple())
  setSheetSelection(sheetSession, 'B2:C3')
  let text = 'FOO'
  let evt = new ClipboardEvent()
  evt.clipboardData.setData('text/plain', text)
  sheetClipboard.onPaste(evt)
  let cells = queryCells(sheet.getCellMatrix(), 'B2:C3')
  t.deepEqual(getSources(cells), [['FOO', '6'], ['8', '9']], 'only a single cell should have been changed')
  let sel = sheetSession.getSelection()
  checkSelection(t, sel, 'B2')
  t.end()
})

test('SheetClipboard: paste a table that is larger than the sheet', (t) => {
  let { sheetSession, sheetClipboard, sheet } = _setup(small())
  setSheetSelection(sheetSession, 'B2')
  let htmlStr = _createHtml([['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'I']])
  let evt = new ClipboardEvent()
  evt.clipboardData.setData('text/html', htmlStr)
  sheetClipboard.onPaste(evt)
  let cells = sheet.getCellMatrix()
  t.deepEqual(getSources(cells), [['1', '2', '', ''], ['3', 'A', 'B', 'C'], ['', 'D', 'E', 'F'], ['', 'G', 'H', 'I']], 'sheet should have been extended and values pasted')
  let sel = sheetSession.getSelection()
  checkSelection(t, sel, 'B2:D4')
  t.end()
})


function simple() {
  return {
    id: 'sheet',
    path: 'sheet.xml',
    type: 'sheet',
    name: 'My Sheet',
    columns: [{ name: 'x' }, { name: 'y' }, { name: 'z' }],
    cells: [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['10', '11', '12']
    ]
  }
}

function small() {
  return {
    id: 'sheet',
    path: 'sheet.xml',
    type: 'sheet',
    name: 'My Sheet',
    columns: [{ name: 'x' }, { name: 'y' }],
    cells: [
      ['1', '2'],
      ['3', '4'],
    ]
  }
}

function _setup(sheetData) {
  let { sheetSession, sheet } = setupSheetSession(sheetData, new StubEngine())
  let sheetClipboard = new SheetClipboard(sheetSession)
  return { sheetSession, sheet, sheetClipboard }
}

function _createHtml(cells) {
  let frags = []
  frags.push('<html>')
  frags.push('<body>')
  frags.push('<table>')
  for (let i = 0; i < cells.length; i++) {
    let row = cells[i]
    frags.push('<tr>')
    for (let j = 0; j < row.length; j++) {
      frags.push('<td>')
      frags.push(row[j])
      frags.push('</td>')
    }
    frags.push('</tr>')
  }
  frags.push('</table>')
  frags.push('</body>')
  frags.push('</html>')
  return frags.join('')
}

class ClipboardEventData {
  constructor() {
    this.data = {}
  }
  getData(format) {
    return this.data[format]
  }
  setData(format, data) {
    this.data[format] = data
  }
  get types() {
    return Object.keys(this.data)
  }
}

class ClipboardEvent {
  constructor() {
    this.clipboardData = new ClipboardEventData()
  }
  preventDefault() {}
  stopPropagation() {}
}