import { ref, type ComputedRef, type Ref } from 'vue'
import { from } from '@vueuse/rxjs'

import { finalize, Observable, Subscription, switchMap } from 'rxjs'
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'

export function useBoardSession(
  boardName: Ref<string> | ComputedRef<string>,
  customConfig?: {
    next?: (val: unknown) => void,
    complete?: () => void,
    error?: (err: any) => void
  },
) {
  const nameObservable = from(boardName, { immediate: true, flush: 'sync' })
  let activeSubscription: Subscription;

  let receiver: Ref<Observable<unknown> | undefined> = ref(undefined);
  let transmitter: Ref<WebSocketSubject<unknown> | undefined> = ref(undefined); 

  const socketConfig = {
    next: customConfig?.next ?? defaultSocketConfig.next,
    complete: customConfig?.complete ?? defaultSocketConfig.complete,
    error: customConfig?.error ?? defaultSocketConfig.error
  };

  receiver.value = nameObservable.pipe(
    switchMap(name => {
      const url = `ws://localhost:3000/api/v1/connect?board=${name}`
      const ws = webSocket(url)
      transmitter.value = ws;
      return ws;
    }),
  )
  
  activeSubscription = receiver.value.subscribe(socketConfig);
  
  return {receiver, transmitter};
}

const defaultSocketConfig = {
  next: (val: unknown) => {
    handleMessage(val);
  },
  complete: () => {
    handleComplete();
  },
  error: (err: any) => {
    handleError(err);
  },
}

function handleMessage(val: unknown) {
  console.log(val);
}

function handleComplete() {}

function handleError(err: any) {}

function isWebSocketSubject<T>(val: Observable<T>): val is WebSocketSubject<T> {
  return val instanceof WebSocketSubject
}

function assertIsWebSocketSubject<T>(
  val: Observable<T>,
): asserts val is WebSocketSubject<T> {
  if (!isWebSocketSubject(val)) {
    throw new Error('val is not a WebSocketSubject')
  }
}
