import React, { useState, useEffect, useReducer, useRef } from 'react';
import './App.css';

import styled from 'styled-components';
import {
  Slider
} from "@reach/slider";
import "@reach/slider/styles.css";

const TodoContainer = styled.div`
   display: grid;
   grid-template-columns: 1fr 1fr;
   grid-template-rows: 1fr 1fr;
   height: 100vh;
   width: 100vw;
`

const Quadrant = styled.div`
  height: 100%;
  width: 100%;
  color: white;
  font-size: 2rem;
  border: 2px solid black;
  box-sizing: border-box;
  padding: 5px;
  position: relative;
  overflow: scroll hidden;
  max-width: 100%;
  box-sizing: border-box;
`

const UrgentImportant = styled(Quadrant)`
  background-color: red;
`
const UrgentUnimportant = styled(Quadrant)`
  background-color: orange;
  color: black;
`
const NonUrgentImportant = styled(Quadrant)`
  background-color: yellow;
  color: black;
`
const NonUrgentUnimportant = styled(Quadrant)`
  background-color: green;
`

const FlexSpaceAround = styled.div`
  display: flex;
  justify-content: space-around;
`

const TitleBody = styled.div`
  font-size: 1rem;
  border-bottom: 2px solid;
  margin-bottom: 5px;
`

const TodoBody = styled.button`
  font-size: 1rem;
  border: none;
  background-color: transparent;
  margin-bottom: 5px;
`

const Title = ({ children }) => <FlexSpaceAround><TitleBody>{children}</TitleBody></FlexSpaceAround>
const Todo = ({ children, onClick }) => <FlexSpaceAround><TodoBody onClick={onClick}>{children}</TodoBody></FlexSpaceAround>


const AddTodoButton = styled.button`
  border-radius: 50%;
  border: solid 2px black;
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: black;
  color: white;
  font-size: 3rem;
  height: 3rem;
  width: 3rem;
  line-height: 1rem;
`

const SettingsButton = styled(AddTodoButton)`
  right: auto;
  left: 10px;
  transform: rotate(90deg);
  padding-bottom: 30px;
`

const ADDING_TODO = 'adding todo';
const EDITING_TODO = 'editing todo';
const IDLE = 'idle';
const SETTINGS_PAGE = 'SETTINGS_PAGE';

const PUSH = 'PUSH';
const REMOVE = 'REMOVE';
const SLICE = 'SLICE';
const CLICK_ADD_BUTTON = 'CLICK_ADD_BUTTON';
const GO_TO_IDLE = 'GO_TO_IDLE';
const EDIT_TODO = 'EDIT_TODO';
const UPDATE_TODO = 'UPDATE_TODO';
const COMPLETE_TODO = 'COMPLETE_TODO';
const DELETE_TODO = 'DELETE_TODO';
const GO_TO_SETTINGS = 'GO_TO_SETTINGS';

const todoReducer = (
  state = {},
  { type, value, index, startIndex = 0, endIndex }
) => {
  let todos;
  switch (type) {
    case PUSH:
      return {appState: IDLE, todos: [...state.todos, value]};
    case REMOVE:
      return {appState: IDLE, todos: [...state.todos.filter((e, i) => i !== index)]};
    case SLICE:
      return {appState: IDLE, todos: [...state.todos.slice(startIndex, endIndex)]};
    case CLICK_ADD_BUTTON:
      return {...state, appState: ADDING_TODO};
    case GO_TO_IDLE:
      return {todos: state.todos, appState: IDLE};
    case EDIT_TODO:
      return {...state, appState: EDITING_TODO, editingTodo: state.todos[index]};
    case UPDATE_TODO:
      // state.editingTodo is the old one
      // value is the new one
      const invalid = state.editingTodo.name !== value.name && state.todos.some(todo => todo.name === value.name)
      if (!invalid) {
        todos = state.todos.slice();
        todos.splice(state.todos.findIndex(todo => todo.name === state.editingTodo.name), 1);
        todos.push(value);

        return {todos, appState: IDLE};
      } else {
        return state;
      }
    case DELETE_TODO:
      todos = state.todos.slice();
      todos.splice(state.todos.findIndex(todo => todo.name === state.editingTodo.name), 1);

      return {todos, appState: IDLE};
    case COMPLETE_TODO:
      return {appState: IDLE, todos: state.todos.map(todo => ({...todo, completed: state.editingTodo.name === todo.name ? true : todo.completed}))}
    case GO_TO_SETTINGS:
      return {...state, appState: SETTINGS_PAGE }
    default:
      return state;
  }
};


const AddTodoContainer = styled.div`
   height: 100vh;
   width: 100vw;
   background-color: ${p => perc2color(100 - p.scale)};
   padding: 1rem;
   box-sizing: border-box;
`

const TodoNameInput = styled.input`
  border: solid 2px;
  padding: 8px;
  margin-bottom: 2rem;
  width: 100%;
  box-sizing: border-box;
`

const TodoDescTextArea = styled.textarea`
  border: solid 2px;
  padding: 3px; 
  margin-bottom: 2rem;
  width: 100%;
  min-height: 10rem;
  box-sizing: border-box;
  max-height: 10rem;
  max-width: 100%;
  resize: none;
`

const FlexSpaceBetween = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  position: relative;
  top: -1rem;
`
const HighLow = () => (
  <FlexSpaceBetween>
    <span>Very Low</span>  
    <span>Very High</span>  
  </FlexSpaceBetween>
);

const BottomOfScreenFlexBetween = styled(FlexSpaceBetween)`
  position: absolute;
  bottom: 10px;
  top: auto;
  margin: 0;
  width: 92%;
`

const FinishTodo = styled.button`
  border-radius: 8px;
  border: solid 2px black;
  background-color: ${p => p.color || 'black'};
  color: white;
  font-size: 1rem;
  height: 3rem;
  line-height: 0rem;
  padding: 2rem;
`

const CancelTodo = styled(FinishTodo)`
  right: auto;
  left: 10px;
`

const CompareTodo = styled.span`
  font-size: 1.5rem;
`

const CompareHelperText = styled.span`
  padding-top: 6px;
  font-size: .75rem;
`

const clickAndWaitReducer = (shouldDelete = false, { type }) => {
  switch(type) {
    case 'RESET':
      return false;
    case 'CLICK':
      return true; 
    default:
      return shouldDelete
  }
}

const AddTodo = ({ addTodo, goBack, todos, editingTodo, updateTodo, deleteTodo }) => {
  const [urgent, setUrgent] = useState(editingTodo ? editingTodo.urgent : 50);
  const [important, setImportant] = useState(editingTodo ? editingTodo.important : 50);
  const [name, setName] = useState(editingTodo ? editingTodo.name : '');
  const [desc, setDesc] = useState(editingTodo ? editingTodo.desc : '');

  const [shouldCheckForDelete, dispatchDelete] = useReducer(clickAndWaitReducer);

  useEffect(() => {
    let mounted = true;

    if (shouldCheckForDelete) {
      setTimeout(() => {
        if (mounted) dispatchDelete({ type: 'RESET' })
      }, 2000)
    }

    return () => mounted = false;
  }, [shouldCheckForDelete])

  const nameInput = useRef(null);

  const todo = {
    name, desc, urgent, important
  }

  useEffect(() => {
    nameInput.current.focus();
  }, [])

  const sortedTodosByImportant = todos.sort((a, b) => b.important - a.important)
  const nextHighestImportant = sortedTodosByImportant.reduce((returningTodo, currentTodo) => currentTodo.important > important ? currentTodo : returningTodo, null)

  const nextHighestImportantIndex = nextHighestImportant && sortedTodosByImportant.findIndex(todo => todo.name === nextHighestImportant.name)
  const nextLowestImportant = typeof nextHighestImportantIndex === 'number' ? sortedTodosByImportant[nextHighestImportantIndex + 1] : sortedTodosByImportant[0];

  const sortedTodosByUrgent = todos.sort((a, b) => b.urgent - a.urgent)
  const nextHighestUrgent = sortedTodosByUrgent.reduce((returningTodo, currentTodo) => currentTodo.urgent > urgent ? currentTodo : returningTodo, null)

  const nextHighestUrgentIndex = nextHighestUrgent && sortedTodosByUrgent.findIndex(todo => todo.name === nextHighestUrgent.name)
  const nextLowestUrgent = typeof nextHighestUrgentIndex === 'number' ? sortedTodosByUrgent[nextHighestUrgentIndex + 1] : sortedTodosByUrgent[0];

  let importantHelperText;
  if (nextHighestImportant && nextLowestImportant) importantHelperText = '<- between these two ->';
  else if (nextHighestImportant) importantHelperText = 'not as important as';
  else if (nextLowestImportant) importantHelperText = 'is next next lowest in importance';

  let urgentHelperText;
  if (nextHighestUrgent && nextLowestUrgent) urgentHelperText = '<- between these two ->';
  else if (nextHighestUrgent) urgentHelperText = 'not as urgent as';
  else if (nextLowestUrgent) urgentHelperText = 'is next next lowest in urgency';

  return (
    <AddTodoContainer scale={important}>
      <div>
        Task name:
      </div>
      <div>
        <TodoNameInput ref={nameInput} value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        Task description:
      </div>
      <div>
        <TodoDescTextArea value={desc} onChange={e => setDesc(e.target.value)} />
      </div>
      How important is this task?
      <Slider min={0} max={100} step={1} value={important} onChange={setImportant} />
      <HighLow />
      <FlexSpaceBetween>
        <CompareTodo>{nextLowestImportant && nextLowestImportant.name}</CompareTodo>
        <CompareHelperText>{importantHelperText}</CompareHelperText>
        <CompareTodo>{nextHighestImportant && nextHighestImportant.name}</CompareTodo>
      </FlexSpaceBetween>
      How urgent is this task?
      <Slider min={0} max={100} step={1} value={urgent} onChange={setUrgent} />
      <HighLow />
      <FlexSpaceBetween>
        <CompareTodo>{nextLowestUrgent && nextLowestUrgent.name}</CompareTodo>
        <CompareHelperText>{urgentHelperText}</CompareHelperText>
        <CompareTodo>{nextHighestUrgent && nextHighestUrgent.name}</CompareTodo>
      </FlexSpaceBetween>
      <BottomOfScreenFlexBetween>
        <CancelTodo onClick={goBack}>Back</CancelTodo>
        {editingTodo && (
          <FinishTodo
            color={shouldCheckForDelete ? 'red' : null}
            onClick={() => {
              if(shouldCheckForDelete) {
                deleteTodo()
              } else {
                dispatchDelete({ type: 'CLICK' })
              }
            }}
          >
            Delete
          </FinishTodo>
        )}
        {editingTodo ? (
          <FinishTodo onClick={() => updateTodo(todo)}>Update</FinishTodo>
        ) : (
          <FinishTodo onClick={() => addTodo(todo)}>Add todo</FinishTodo>
        )}
      </BottomOfScreenFlexBetween>
    </AddTodoContainer>
  )
}

const App = () => {
  const [{ appState, todos, editingTodo }, dispatch] = useReducer(todoReducer, { appState: IDLE, todos: localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [] });

  const sortedTodosByImportant = todos.sort((a, b) => b.important - a.important)
  
  const [importantThreshold, setImportantThreshold] = useState(localStorage.getItem('scales') ? JSON.parse(localStorage.getItem('scales')).importantThreshold : 65);
  const [urgentThreshold, setUrgentThreshold] = useState(localStorage.getItem('scales') ? JSON.parse(localStorage.getItem('scales')).urgentThreshold : 65);

  // sort todos into proper buckets
  const urgentImportantTodos = sortedTodosByImportant.filter(todo => todo.important >= importantThreshold && todo.urgent >= urgentThreshold)
  const urgentUnimportantTodos = sortedTodosByImportant.filter(todo => todo.important < importantThreshold && todo.urgent >= urgentThreshold)
  const nonurgentUnimportantTodos = sortedTodosByImportant.filter(todo => todo.important < importantThreshold && todo.urgent < urgentThreshold)
  const nonurgentImportantTodos = sortedTodosByImportant.filter(todo => todo.important >= importantThreshold && todo.urgent < urgentThreshold)

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos])

  useEffect(() => {
    localStorage.setItem('scales', JSON.stringify({importantThreshold, urgentThreshold}));
  }, [importantThreshold, urgentThreshold])

  // const clearTodos = () => dispatch({ type: SLICE, startIndex: 0, endIndex: 0 })
  const goBack = () => dispatch({ type: GO_TO_IDLE })

  if (appState === SETTINGS_PAGE) {
    return (
      <AddTodoContainer>
        <p>
          What is your importance threshold?
        </p>
        <p>
          (Tasks above this mark will be deemed important)
        </p>
        <Slider min={0} max={100} step={1} value={importantThreshold} onChange={setImportantThreshold} />
        <p>
          What is your urgency threshold?
        </p>
        <p>
          (Tasks above this mark will be deemed urgent)
        </p>
        <Slider min={0} max={100} step={1} value={urgentThreshold} onChange={setUrgentThreshold} />
        <CancelTodo onClick={() => dispatch({type: GO_TO_IDLE})}>Go Back</CancelTodo>
      </AddTodoContainer>
    )
  }

  if ([ADDING_TODO, EDITING_TODO].includes(appState)) {

    const addTodo = todo => {
      const newTodo = !todos.some(mainListTodo => mainListTodo.name === todo.name);

      if (todo.name && newTodo) {
        dispatch({ type: PUSH, value: todo })
      }
    }

    const updateTodo = todo => {
      if (todo.name) {
        dispatch({ type: UPDATE_TODO, value: todo })
      }
    }

    const deleteTodo = () => {
      dispatch({ type: DELETE_TODO })
    }

    return (
      <AddTodo 
        addTodo={addTodo} 
        goBack={goBack} 
        todos={todos} 
        editingTodo={editingTodo} 
        updateTodo={updateTodo} 
        deleteTodo={deleteTodo}
      />
    )
  }

  return (
    <TodoContainer>
      <UrgentImportant>
        <Title>Urgent Important</Title>
        {urgentImportantTodos.map((todo, i) => (
          <Todo 
            key={i}
            onClick={() => dispatch({ type: EDIT_TODO, index: todos.findIndex(mainListTodo => todo.name === mainListTodo.name)})}
          >
            {todo.name}
          </Todo>
          )
        )}
      </UrgentImportant>
      <NonUrgentImportant>
        <Title>Non-Urgent Important</Title>
        {nonurgentImportantTodos.map((todo, i) => (
          <Todo 
            key={i}
            onClick={() => dispatch({ type: EDIT_TODO, index: todos.findIndex(mainListTodo => todo.name === mainListTodo.name)})}
          >
            {todo.name}
          </Todo>
          )
        )}      
      </NonUrgentImportant>
      <UrgentUnimportant>
        <Title>Urgent Un-Important</Title>
        {urgentUnimportantTodos.map((todo, i) => (
          <Todo 
            key={i}
            onClick={() => dispatch({ type: EDIT_TODO, index: todos.findIndex(mainListTodo => todo.name === mainListTodo.name)})}
          >
            {todo.name}
          </Todo>
          )
        )}      
      </UrgentUnimportant>
      <NonUrgentUnimportant>
        <Title>Non-Urgent Un-Important</Title>
        {nonurgentUnimportantTodos.map((todo, i) => (
          <Todo 
            key={i}
            onClick={() => dispatch({ type: EDIT_TODO, index: todos.findIndex(mainListTodo => todo.name === mainListTodo.name)})}
          >
            {todo.name}
          </Todo>
          )
        )}      
      </NonUrgentUnimportant>
      <SettingsButton onClick={() => dispatch({ type: GO_TO_SETTINGS })}>...</SettingsButton>
      <AddTodoButton onClick={() => dispatch({ type: CLICK_ADD_BUTTON })}>+</AddTodoButton>
      {/* <AddTodoButton onClick={clearTodos}>+</AddTodoButton> */}
    </TodoContainer>
  );
}

export default App;

const perc2color = perc => {
  let r, g, b = 0;
  if(perc < 50) {
    r = 255;
    g = Math.round(5.1 * perc);
  }
  else {
    g = 255;
    r = Math.round(510 - 5.10 * perc);
  }
  let h = r * 0x10000 + g * 0x100 + b * 0x1;
  return '#' + ('000000' + h.toString(16)).slice(-6);
}