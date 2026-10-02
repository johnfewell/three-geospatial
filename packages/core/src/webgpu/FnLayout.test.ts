import { float, struct } from 'three/tsl'
import { StructTypeNode } from 'three/webgpu'

import { FnLayout } from './FnLayout'

// Mirrors what struct() returns from three r185: a proxy that forwards
// property reads to the StructTypeNode and defines no "has" trap. r185's
// StructTypeNode also sets isStructTypeNode, which r184's does not.
function r185Struct(name: string | null): object {
  const node = Object.assign(new StructTypeNode({ value: 'float' }, name), {
    isStructTypeNode: true
  })
  return new Proxy(() => {}, {
    get: (_target, prop, receiver) => Reflect.get(node, prop, receiver)
  })
}

function layoutOf(fn: unknown): {
  type: string
  inputs: Array<{ type: string }>
} {
  return (fn as { shaderNode: { layout: any } }).shaderNode.layout
}

const body = (): unknown => float(0)

describe('FnLayout', () => {
  it('resolves a three r184 struct to its name', () => {
    const s = struct({ value: 'float' }, 'R184Struct')
    const fn = FnLayout({
      name: 'f',
      type: s,
      inputs: [{ name: 'x', type: s }]
    })(body as any)
    expect(layoutOf(fn).type).toBe('R184Struct')
    expect(layoutOf(fn).inputs[0].type).toBe('R184Struct')
  })

  it('resolves a three r185 struct proxy to its name', () => {
    const s = r185Struct('R185Struct') as any
    const fn = FnLayout({
      name: 'f',
      type: s,
      inputs: [{ name: 'x', type: s }]
    })(body as any)
    expect(layoutOf(fn).type).toBe('R185Struct')
    expect(layoutOf(fn).inputs[0].type).toBe('R185Struct')
  })

  it('requires a struct name', () => {
    const s = r185Struct(null) as any
    expect(() => FnLayout({ name: 'f', type: s })(body as any)).toThrow(
      'Struct name is required.'
    )
  })
})
