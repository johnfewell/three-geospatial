import { struct } from 'three/tsl'
import { StructTypeNode } from 'three/webgpu'

import { structName } from './AtmosphereContextBase'

describe('structName', () => {
  it('reads the name from a three r184 struct', () => {
    expect(structName(struct({ value: 'float' }, 'R184Struct'))).toBe(
      'R184Struct'
    )
  })

  it('reads the name from a three r185 struct proxy', () => {
    // Mirrors struct() from three r185: property reads forward to the
    // StructTypeNode, and there is no "has" trap, so .layout is absent.
    const node = new StructTypeNode({ value: 'float' }, 'R185Struct')
    const proxy = new Proxy(() => {}, {
      get: (_target, prop, receiver) => Reflect.get(node, prop, receiver)
    })
    expect(structName(proxy)).toBe('R185Struct')
  })

  it('requires a struct name', () => {
    const node = new StructTypeNode({ value: 'float' }, null)
    const proxy = new Proxy(() => {}, {
      get: (_target, prop, receiver) => Reflect.get(node, prop, receiver)
    })
    expect(() => structName(proxy)).toThrow('Struct name is required.')
  })
})
