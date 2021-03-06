import invariant from 'fbjs/lib/invariant'
import { concat } from 'rxjs/observable/concat'
import { empty } from 'rxjs/observable/empty'
import { fromPromise } from 'rxjs/observable/fromPromise'
import { merge } from 'rxjs/observable/merge'
import { of } from 'rxjs/observable/of'
import { COMPLETE } from '../../helpers/constants'
import { isPromise } from '../../helpers/isPromise/isPromise'
import { T } from '../../helpers/t/t'
import { uniqueId } from '../../helpers/uniqueId/uniqueId'
import { createEvent } from '../createEvent/createEvent'

// Models
import { EffectCreator } from './createEffect.h'

/**
 * @private
 */
const run = <Payload, Result>(
  params: Payload,
  effect: (payload: Payload) => Promise<Result> | Result
): Promise<Result> => {
  let response: any
  try {
    response = effect(params)
  } catch (err) {
    return Promise.reject(err)
  }

  if (isPromise(response)) {
    return response
  }

  return Promise.resolve(response)
}

/**
 * Creates an effect creator. Effect is a stream, that uses provided function, and emits start, success, error and complete types.
 *
 * ### Usage in epic example
 * ```typescript
 *  const payEffect = createEffect('Perform payment', pay)
 *
 *  const payEpic = (event$, state$) => state$.pipe(
 *    sample(select(submit, event$)),
 *    switchMap(state => payEffect(state.values))
 *  )
 *  ```
 *
 * ### Usage as an api method
 * ```typescript
 * ({ api }) => <Button onClick={api.payEffect} />
 * ```
 *
 * @param description
 * @param effect Side effect performing function, should return a Promise.
 * @param condition Function, that defines if an effect should run. Must return boolean. T by default. E.g. can be used to separate server-side effects.
 * @returns
 */
export const createEffect = <Payload, Result>(
  description: string,
  effect?: (payload: Payload) => Promise<Result> | Result,
  condition: (payload?: Payload) => boolean = T
): EffectCreator<Payload, Result> => {
  const success = createEvent<Result>(`${description}: SUCCESS`)
  const fail = createEvent<any>(`${description}: FAIL`)
  const start = createEvent<{ id: string; payload: Payload }, Payload, any>(
    `${description}: START`,
    ({ payload }) => payload,
    ({ id }) => ({
      [COMPLETE]: id
    })
  )

  let _effect = effect

  const runEffect: any = (payload: Payload) => {
    invariant(_effect, 'Stapp error: Effect is not provided!')

    if (!condition(payload)) {
      return empty()
    }

    const id = `${description}: COMPLETE [${uniqueId()}]`

    return concat(
      merge(
        of(start({ id, payload })),
        fromPromise(
          run(payload, _effect!)
            .then((result) => success(result))
            .catch((error) => fail(error))
        )
      ),
      of({
        type: id
      })
    )
  }

  return Object.assign(runEffect, {
    start,
    success,
    fail,
    getType: () => start.getType(),
    use(fn: (payload: Payload) => Promise<Result> | Result) {
      _effect = fn
      return runEffect
    }
  })
}
