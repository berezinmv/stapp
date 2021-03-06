# React

Stapp comes with a bunch of helpers that allows using stapp application with react easily. These are:

* `createConsumer`: creates a component following a render-prop pattern
* `createConsume`: old-school higher order component
* `createForm` and `createField`: create render-prop utilities to assist with forms

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Usage](#usage)
  - [`createConsumer()`](#createconsumer)
  - [`createConsume()`](#createconsume)
  - [`createForm()` and `createField()`](#createform-and-createfield)
- [Type definitions](#type-definitions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

### `createConsumer()`

```typescript
type createConsumer = (app: Stapp) => Consumer

type Consumer = React.Component<{
  mapState?: (state) => any,
  mapApi?: (api) => any,
  mergeProps?: (state, api) => any,

  children?: (props) => React.ReactElement | null,
  render?: (props) => React.ReactElement | null,
  component?: React.ReactType
}>
```

`Consumer` takes an application state, transforms it with `mapState` (`identity` by default), then takes an application API, transforms it with `mapApi` (`identity` by default) and merges them into one object with `mergeProps` (`Object.assign` by default). On each state update, Consumer calls provided `children` or `render` prop with a resulting object. If `component` prop is used, the provided component will be rendered with a resulting object as props.

Most basic example as possible:

```jsx
import { createConsumer } from 'stapp/lib/react'
import todoApp from '../myApps/todoApp.js'
import ListItem from '../components'

const Consumer = createConsumer(todoApp)

const App = () => <Consumer>
  {
    ({ todos, handleClick }) => todos.map((item) => <ListItem
      { ...item }
      key={ item.id }
      onClick={ () => handleClick(item.id) }
    />)
  }
</Consumer>
```

`component` prop usage example:

```jsx
import { createConsumer } from 'stapp/lib/react'
import todoApp from '../myApps/todoApp.js'
import ListItem from '../components'

const Consumer = createContext(todoApp)

const List = ({ todos, handleClick }) => {
  return todos.map((item) => <ListItem
    { ...item }
    key={ item.id }
    onClick={ () => handleClick(item.id) }
  />
}
const App = () => <Consumer component={ List } />
```

### `createConsume()`

```typescript
type createConsume = (app: Stapp) => Consume
type createInject = (app: Stapp) => Consume // theese are aliases

type ConsumerHoc = (
	mapState?: (state, props) => any,
	mapApi?: (api, props) => any,
  mergeProps?: (state, api, props) => any
) => (WrappedComponent: React.ComponentType) => React.ComponentClass
```

`createInject` creates a classic, familiar HoC, that works exactly as `react-redux` `@connect`.

```jsx
import { createConsume } from 'stapp/lib/react'
import todoApp from '../myApps/todoApp.js'

const inject = createConsume(todoApp)

const ListItem = inject(
	(state, props) => ({ todo: state.todos.find(todo => todo.id === props.id )}),
  (api, props) => ({ handleClick: () => api.handleClick(props.id) })
)(({ todo, handleClick }) => {
  return <div onClick={ handleClick }>{ todo.text }</div>
})

const App = inject(
	state => ({ ids: state.todos.map(todo => todo.id) })
)(({ ids }) => {
  return ids.map(id => <ListItem id={ id } key={ id } />)
})
```

### `createForm()` and `createField()`

```typescript
type createForm = (app: Stapp) => Form
type createFiled = (app: Stapp) => Field

type Form = React.Component<{
  children?: (props: FormApi) => React.ReactElement | null,
  render?: (props: FormApi) => React.ReactElement | null,
  component?: React.ReactType<FormApi>
}>

type FormApi = {
  handleSubmit: () => void,
  handleReset: () => void,
  submitting: boolean, // form is in submitting process
  valid: boolean, // app has no errors
  dirty: boolean, // app has dirty values (that differ from initial values)
  ready: boolean, // apps ready state is empty
  pristine: boolean // fields were not touched
}

type Field = React.Component<{
  name: string, // field name

  children?: (props: FieldApi) => React.ReactElement | null,
  render?: (props: FieldApi) => React.ReactElement | null,
  component?: React.ReactType<FieldApi>
}>

type FieldApi = {
  input: {
    name: string
    value: string
    onChange: (event: SyntheticEvent<any>) => void
    onBlur: (event: SyntheticEvent<any>) => void
    onFocus: (event: SyntheticEvent<any>) => void
  }
  meta: {
    error: any // field has an error
    touched: boolean // field was focused
    active: boolean // field is in focus
    dirty: boolean // field value differs from initial value
  }
}
```

These methods create form helpers, who handle every common operation with forms. You can find a comprehensive example in the `examples/form-async-validation` folder. Note that form helpers are intended to be used with `formBase` module (see [formBase documentation](/modules/formBase.html)).

Basic example:

```jsx
import { createForm, createField } from 'stapp/lib/react'
import formApp from '../myApps/formApp.js'

const Form = createForm(formApp)
const Field = createField(formApp)

const App = () => {
  return <Form>
    {
      ({ handleSubmit, submitting, valid, pristine }) => {
        <Field name="age">
        	({ input, meta }) => <div>
            <label>Age</label>
            <input { ...input } type="number" placeholder="Age" />
            { meta.error && meta.touched && <span>{meta.error}</span> }
          </div>
        </Field>
        
        <button
          disabled={ !valid && !pristine && !submitting }
          onClick={ handleSubmit }
        >
          Submit
        </button>
      }
    }
  </Form>
}
```

## Type definitions

* [`createConsumer`](/types.html#createconsumer)
* [`createConsume`](/types.html#createconsume)
* [`createForm`](/types.html#createform)
* [`createField`](/types.html#createfield)
