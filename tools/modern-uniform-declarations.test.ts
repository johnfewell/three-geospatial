import assert from 'node:assert/strict'
import { test } from 'node:test'

import { modernUniformDeclarations } from './modern-uniform-declarations.ts'

await test('converts imported and qualified legacy values without touching modern declarations', () => {
  const input = `interface Fixture {
a: UniformNode<Vector3>;
b: import('three/webgpu').UniformNode<import('three').Matrix4>;
c: UniformNode<number>;
d: UniformNode<false>;
e: UniformNode<'int', number>;
// UniformNode<Vector3> is a comment
firstCascade: UniformNode<number>;
}
`
  const actual = modernUniformDeclarations('fixture.d.ts', input).content
  assert.match(actual, /a: UniformNode<'vec3', Vector3>/)
  assert.match(actual, /UniformNode<'mat4', import\('three'\).Matrix4>/)
  assert.match(actual, /c: UniformNode<'float', number>/)
  assert.match(actual, /d: UniformNode<'bool', false>/)
  assert.match(actual, /e: UniformNode<'int', number>/)
  assert.match(actual, /firstCascade: UniformNode<'uint', number>/)
  assert.match(actual, /\/\/ UniformNode<Vector3> is a comment/)
  assert.equal(
    modernUniformDeclarations('fixture.d.ts', actual).content,
    actual
  )
})

await test('refuses unfamiliar value types instead of guessing their shader type', () => {
  assert.throws(
    () =>
      modernUniformDeclarations(
        'fixture.d.ts',
        'interface X { x: UniformNode<CustomValue> }'
      ),
    /Unmapped uniform/
  )
})
