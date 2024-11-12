import { ref, type ComputedRef, type Ref } from 'vue'
import { from } from '@vueuse/rxjs'

import { Observable, Subscription, switchMap } from 'rxjs'
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'

export function useBoardSession(
  boardName: Ref<string> | ComputedRef<string>,
  receiverConfig?: {
    next?: (val: unknown) => void,
    complete?: () => void,
    error?: (err: any) => void
  },
) {
  const nameObservable = from(boardName, { immediate: true, flush: 'sync' })
  let activeSubscription: Subscription;

  let receiver: Ref<Observable<unknown>>;
  let transmitter: Ref<WebSocketSubject<unknown>>;

  const socketConfig = {
    next: receiverConfig?.next ?? defaultReceiverConfig.next,
    complete: receiverConfig?.complete ?? defaultReceiverConfig.complete,
    error: receiverConfig?.error ?? defaultReceiverConfig.error
  };

  // this can't be the receiver AND the transmitter because switchMap only guarantees a return of an Observable
  const __receiver = nameObservable.pipe(
    switchMap(name => {
      const url = `ws://localhost:3000/api/v1/connect?board=${name}`
      const ws = webSocket(url)
      
      // typescript doesn't type this correctly as a parameter of ref(), but it IS necessarily a WebSocketSubject, so we have to assert type
      // Also, this switchMap triggers immediately because of the config in nameObservable, so cannot get past this point WITHOUT assigning
      //   transmitter.
      transmitter = ref(ws) as Ref<WebSocketSubject<unknown>>;
      return ws;
    }),
  )
  receiver = ref(__receiver);

  // typescript doesn't know this is necessarily assigned by now, so we have to assert here as well.
  transmitter = transmitter!;
  
  activeSubscription = receiver.value.subscribe(socketConfig);
  
  return {receiver, transmitter};
}

const defaultReceiverConfig = {
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
