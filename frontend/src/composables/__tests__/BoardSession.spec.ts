// @vitest-environment jsdom

import { Observable, Subscription, of, switchMap } from 'rxjs'
import { Ref, ref } from 'vue'
import { WebSocketSubject, webSocket } from 'rxjs/webSocket'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { from } from '@vueuse/rxjs'
import { useBoardSession } from '../BoardSession'

// function playground() {
//   let functions: Map<string, Function> = new Map()

//   functions.set('webSocket', () => {
//     const ws = webSocket(`ws://localhost:3000/api/v1/connect?board=board`)
//     return ws
//   })

//   functions.set('from', (someRef: Ref<any, any>) => {
//     // NOTE: immediate triggers watcher when value is first set, which triggers subscribers
//     // NOTE: flush: 'sync' triggers every time ref updates, not just once vue trigger loop is over.
//     const observable = from(someRef, { flush: 'sync' })
//     return observable
//   })

//   functions.set('switchMap', (someRef: Ref<string, string>) => {
//     const observable = from(someRef, { flush: 'sync', immediate: true }).pipe(
//       switchMap(val => {
//         const array: string[] = []
//         for (const char of val) {
//           array.push(char)
//         }
//         return of(array)
//       }),
//     )
//     return observable
//   })

//   return functions
// }

describe('useBoardSession()', () => {
  let boardName;
  let receiver;
  let transmitter;

  beforeAll(() => {
    boardName = ref('a-board-name');
    const session = useBoardSession(boardName);
    receiver = session.receiver; transmitter = session.transmitter;
  })
  
  it('returns a receiver and transmitter, correctly typed', () => {
    expect(receiver.value instanceof Observable).toBe(true);
    expect(transmitter.value instanceof WebSocketSubject).toBe(true);
  })

  describe('receiver', () => {})
  describe('transmitter', () => {})
})

// describe('BoardSession playground()', () => {
//   let testFns: Map<string, Function>

//   beforeAll(() => {
//     testFns = playground()
//     console.log(testFns.entries())
//   })

//   describe('rxjs', () => {
//     describe('webSocket()', () => {
//       it('creates a WebSocketSubject', () => {
//         const ws = testFns.get('webSocket')!()
//         expect(ws instanceof WebSocketSubject).toBe(true)
//       })
//     })
//     describe('switchMap()', () => {
//       it('returns a new Observable when upstream changes', () => {
//         let counter = 1;
//         let firstObs;
//         let secondObs;
//         const mockFn = vi.fn();

//         const someRef = ref('hello, world')
//         const obs = testFns.get('switchMap')!(someRef)
//         expect(obs instanceof Observable).toBe(true)
        
//         obs.subscribe((x) => { // triggers immediately
//           if (counter === 1) {
//             mockFn();
//             firstObs = x.join('');
//             expect(firstObs).toEqual("hello, world")
//           }
//           if (counter === 2) {
//             mockFn();
//             secondObs = x.join('');
//             expect(secondObs).toEqual("pina colada")
//           }
//           counter++;
//         })

//         someRef.value = 'pina colada'; // triggers second time

//         expect(mockFn).toBeCalledTimes(2)

//       })
//     })
//   })

//   describe('@vueuse/rxjs', () => {
//     describe('from()', () => {
//       let someRef: Ref<any, any>
//       let obs: Observable<any>
//       let mockFn
//       let sub: Subscription

//       beforeEach(() => {
//         someRef = ref('hello, world.')
//         mockFn = vi.fn()
//         obs = testFns.get('from')!(someRef)
//         sub = obs.subscribe(mockFn) // does not trigger mockFn
//       })

//       it('receives a Ref and returns an Observable', () => {
//         expect(obs instanceof Observable).toBe(true)
//       })

//       it('triggers subscribers when ref updates', () => {
//         someRef.value = 'some other value' // triggers mockFn once
//         someRef.value = 'some other value still' // triggers mockFn once
//         expect(mockFn).toBeCalledTimes(2)
//       })

//       afterEach(() => {
//         sub.unsubscribe()
//       })
//     })
//   })
// })
