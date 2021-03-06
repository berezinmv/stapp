# Epics

Epic is a function that receives a stream of events and returns a stream of events. Although Stapp uses its mechanism to support epics, it has much in common with [redux-observable](https://redux-observable.js.org/docs/basics/Epics.html) and [redux-most](https://github.com/joshburgess/redux-most/). We sincerely recommend following these links, if you are not familiar with the epics concept.

Epics allow harnessing async logic with ease.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Usage](#usage)
- [Type definitions](#type-definitions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

Take the following as an example: search field with autosuggest.

```js
import { createEffect, selectArray, combineEpics, createEvent, createReducer } from 'stapp'
import { loaderStart, loaderEnd } from 'stapp/lib/modules/loaders'

const saveResults = createEvent('Save search results')
const searchReducer = createReducer([])
  .on(saveResults, (_, results) => results)

// EffectCreator returns an observable of three types of events:
// `start`, `success` or `fail` and `complete`.
const searchEffect = createEffect(
  // Effect description
  'Load suggestions',

  // Effect function, must return a value or a promise
  searchValue => fetch(`api?search=${searchValue}`).then(r => r.json())
)

const searchModule = {
  name: 'search',
  state: {
    search: searchReducer
  },
  epic: combineEpics([
    // Start loader on effect run
    searchEffect.start.epic(start$ => start$.pipe(
      mapTo(loaderStart('search'))
    )),

    // End loader on effect complete
    selectArray([searchEffect.success, searchEffect.fail], event$).pipe(
      mapTo(loaderEnd('search'))
    ),

    // Save results on success
    success.epic(success$ => success$.pipe(
      map(({ payload }) => saveResults(payload))
    )),

    // Search epic
    (_, state$) => state$.pipe(
      // track only one field changes
      map(state => state.values.search),

      // debounce and distinct value changes
      debounceTime(500),
      distinctUntilChanged(),

      // switch to effect function
      switchMap(({ payload: searchValue }) => searchEffect(searchValue))
    )
  ])
}
```

Epics allow *reacting* to events and state changes *reactively*. That's fun!

## Type definitions

* [`Epic`](/types.html#epic)
* [`EventEpic`](/types.html#eventepic)
* [`createEffect`](/types.html#createeffect)
