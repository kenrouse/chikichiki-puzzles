class DataNode {
  column: ColumnNode
  down: DataNode
  left: DataNode
  right: DataNode
  up: DataNode

  constructor(column?: ColumnNode) {
    this.column = column ?? (this as unknown as ColumnNode)
    this.down = this
    this.left = this
    this.right = this
    this.up = this
  }
}

class ColumnNode extends DataNode {
  size = 0

  constructor() {
    super()
    this.column = this
  }
}

function appendColumn(root: ColumnNode): ColumnNode {
  const column = new ColumnNode()
  column.right = root
  column.left = root.left
  root.left.right = column
  root.left = column
  return column
}

function appendRow(columns: readonly ColumnNode[], indexes: readonly number[]): void {
  let first: DataNode | null = null
  for (const index of indexes) {
    const column = columns[index]
    const node = new DataNode(column)
    node.down = column
    node.up = column.up
    column.up.down = node
    column.up = node
    column.size += 1

    if (!first) {
      first = node
      continue
    }
    node.right = first
    node.left = first.left
    first.left.right = node
    first.left = node
  }
}

function cover(column: ColumnNode): void {
  column.right.left = column.left
  column.left.right = column.right
  for (let row = column.down; row !== column; row = row.down) {
    for (let node = row.right; node !== row; node = node.right) {
      node.down.up = node.up
      node.up.down = node.down
      node.column.size -= 1
    }
  }
}

function uncover(column: ColumnNode): void {
  for (let row = column.up; row !== column; row = row.up) {
    for (let node = row.left; node !== row; node = node.left) {
      node.column.size += 1
      node.down.up = node
      node.up.down = node
    }
  }
  column.right.left = column
  column.left.right = column
}

function chooseSmallestColumn(root: ColumnNode): ColumnNode | null {
  let selected: ColumnNode | null = null
  for (let node = root.right; node !== root; node = node.right) {
    const column = node as ColumnNode
    if (!selected || column.size < selected.size) {
      selected = column
      if (column.size <= 1) {
        break
      }
    }
  }
  return selected
}

export function countSudokuSolutionsExactCover(
  board: readonly number[],
  limit = 2,
): number {
  if (board.length !== 81 || limit <= 0) {
    return 0
  }

  const root = new ColumnNode()
  const columns = Array.from({ length: 324 }, () => appendColumn(root))

  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      const given = board[row * 9 + column]
      if (!Number.isInteger(given) || given < 0 || given > 9) {
        return 0
      }
      const firstDigit = given === 0 ? 1 : given
      const lastDigit = given === 0 ? 9 : given
      for (let digit = firstDigit; digit <= lastDigit; digit += 1) {
        const digitOffset = digit - 1
        const box = Math.floor(row / 3) * 3 + Math.floor(column / 3)
        appendRow(columns, [
          row * 9 + column,
          81 + row * 9 + digitOffset,
          162 + column * 9 + digitOffset,
          243 + box * 9 + digitOffset,
        ])
      }
    }
  }

  let solutions = 0
  function search(): void {
    if (solutions >= limit) {
      return
    }
    if (root.right === root) {
      solutions += 1
      return
    }
    const column = chooseSmallestColumn(root)
    if (!column || column.size === 0) {
      return
    }
    cover(column)
    for (let row = column.down; row !== column; row = row.down) {
      for (let node = row.right; node !== row; node = node.right) {
        cover(node.column)
      }
      search()
      for (let node = row.left; node !== row; node = node.left) {
        uncover(node.column)
      }
      if (solutions >= limit) {
        break
      }
    }
    uncover(column)
  }

  search()
  return solutions
}