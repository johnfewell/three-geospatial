import ts from 'typescript'

const nodeTypes: Record<string, string> = {
  number: 'float',
  boolean: 'bool',
  true: 'bool',
  false: 'bool',
  Vector2: 'vec2',
  Vector3: 'vec3',
  Vector4: 'vec4',
  Matrix2: 'mat2',
  Matrix3: 'mat3',
  Matrix4: 'mat4',
  Color: 'color'
}

// The source toolchain predates typed TSL nodes. Emit both generic arguments
// so consumers resolve the node operations and JS value on current Three types.
export function modernUniformDeclarations(
  filePath: string,
  content: string
): { filePath: string; content: string } {
  const source = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  )
  const edits: Array<{ start: number; end: number; text: string }> = []
  function visit(node: ts.Node): void {
    const name = ts.isTypeReferenceNode(node)
      ? node.typeName.getText(source).split('.').at(-1)
      : ts.isImportTypeNode(node)
        ? node.qualifier?.getText(source).split('.').at(-1)
        : undefined
    if (
      name === 'UniformNode' &&
      (ts.isTypeReferenceNode(node) || ts.isImportTypeNode(node))
    ) {
      const args = node.typeArguments
      if (args?.length === 1) {
        const value = args[0]
        const text = value.getText(source)
        const type = ts.isImportTypeNode(value)
          ? value.qualifier?.getText(source)
          : text
        const property =
          ts.isPropertyDeclaration(node.parent) ||
          ts.isPropertySignature(node.parent)
            ? node.parent.name.getText(source)
            : undefined
        const shader =
          type === 'number' && property === 'firstCascade'
            ? 'uint'
            : nodeTypes[type ?? '']
        if (shader == null) {
          throw new Error(`Unmapped uniform value type in ${filePath}: ${text}`)
        }
        edits.push({
          start: value.getStart(source),
          end: value.end,
          text: `'${shader}', ${text}`
        })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    content = content.slice(0, edit.start) + edit.text + content.slice(edit.end)
  }
  return { filePath, content }
}
