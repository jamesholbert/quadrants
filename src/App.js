import React, { useState, useEffect, useReducer } from 'react';
import './App.css';

import AddTodo from './AddTodo';
import Calender from './Calendar';
import { perc2color, getFrequencyFromDate, getDaysFromDate, sleepy, notSleepy } from './helpers';
import { Plugins } from '@capacitor/core';

import styled, { keyframes } from 'styled-components';
import { Slider } from '@reach/slider';

const { App: AppState, SplashScreen } = Plugins;

const pulse = keyframes`
  0% { text-shadow: none } 
  50% { text-shadow: 0 0 5px cyan, 0 0 10px cyan, 0 0 15px cyan, 0 0 20px black, 0 0 30px black, 0 0 40px black; } 
  100% { text-shadow: none; }
`;

const PulseContents = styled.span`
  animation: ${p => p.seconds || 0}s ${pulse} ease-out infinite;
  ${p => (!p.seconds ? 'animation: none;' : '')}
  position: relative;
  padding: 2px;
`;

const TodoContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  height: 100vh;
  width: 100vw;
`;

const Quadrant = styled.div`
  height: 100%;
  width: 100%;
  color: white;
  font-size: 2rem;
  border: 2px solid black;
  box-sizing: border-box;
  padding: 5px;
  position: relative;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const TodoScrollBox = styled.div`
  height: 100%;
  overflow: hidden scroll;
`;

const UrgentImportant = styled(Quadrant)`
  background-color: red;
`;
const UrgentUnimportant = styled(Quadrant)`
  background-color: orange;
  color: black;
`;
const NonUrgentImportant = styled(Quadrant)`
  background-color: yellow;
  color: black;
`;
const NonUrgentUnimportant = styled(Quadrant)`
  background-color: green;
`;

const FlexSpaceAround = styled.div`
  display: flex;
  justify-content: space-around;
  position: relative;
`;

const TitleBody = styled.div`
  font-size: ${p => (p.big ? '2rem' : '1rem')};
  border-bottom: 2px solid;
  margin-bottom: ${p => (p.big ? '2rem' : '5px')};
`;

const TodoBody = styled.button`
  font-size: 1rem;
  border: none;
  background-color: transparent;
  margin-bottom: 5px;
  color: ${p => (p.sleepy ? 'grey' : 'inherit')};
`;

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
`;

const SettingsButton = styled(AddTodoButton)`
  right: auto;
  left: 10px;
  transform: rotate(90deg);
  padding-bottom: 30px;
`;

export const FullScreenContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: ${p => perc2color(100 - p.scale)};
  padding: 1rem;
  box-sizing: border-box;

  div[data-reach-slider] {
    width: 100%;
    box-sizing: border-box;
  }
`;

export const BigButton = styled.button`
  border-radius: 8px;
  border: solid 2px black;
  background-color: ${p => p.color || 'black'};
  color: white;
  font-size: 1.5rem;
  height: 3rem;
  line-height: 0rem;
  padding: 1.4rem;
  width: ${p => (p.fullWidth ? '90%' : 'auto')};
  margin-bottom: ${p => (p.fullWidth ? '1rem' : '0')};
`;

const WideButton = ({ children, ...rest }) => (
  <FlexSpaceAround>
    <BigButton fullWidth {...rest}>
      {children}
    </BigButton>
  </FlexSpaceAround>
);

const Title = ({ children, ...rest }) => (
  <FlexSpaceAround>
    <TitleBody {...rest}>{children}</TitleBody>
  </FlexSpaceAround>
);

const Todo = ({ children, onClick, sleepy }) => (
  <FlexSpaceAround>
    <TodoBody sleepy={sleepy} onClick={onClick}>
      {children}
    </TodoBody>
  </FlexSpaceAround>
);

const ContextTarget = styled.span``;

const ADDING_TODO = 'adding todo';
const EDITING_TODO = 'editing todo';
const IDLE = 'idle';
const SETTINGS_PAGE = 'settings page';
const CONTEXT_MENU = 'context menu';

const PUSH = 'PUSH';
const REMOVE = 'REMOVE';
const SLICE = 'SLICE';
const CLICK_ADD_BUTTON = 'CLICK_ADD_BUTTON';
const CONTEXT_CLICK = 'CONTEXT_CLICK';
const GO_TO_IDLE = 'GO_TO_IDLE';
const BACK_BUTTON = 'BACK_BUTTON';
const EDIT_TODO = 'EDIT_TODO';
const UPDATE_TODO = 'UPDATE_TODO';
const COMPLETE_TODO = 'COMPLETE_TODO';
const DELETE_TODO = 'DELETE_TODO';
const GO_TO_SETTINGS = 'GO_TO_SETTINGS';
const SLEEP_CURRENT_TODO = 'SLEEP_CURRENT_TODO';
const CANCEL_SLEEP = undefined;

const todoReducer = (state = {}, { type, value, index, startIndex = 0, endIndex }) => {
  let todos;
  switch (type) {
    case PUSH:
      return { appState: IDLE, todos: [...state.todos, value] };
    case REMOVE:
      return { appState: IDLE, todos: [...state.todos.filter((e, i) => i !== index)] };
    case SLICE:
      return { appState: IDLE, todos: [...state.todos.slice(startIndex, endIndex)] };
    case CLICK_ADD_BUTTON:
      return { ...state, appState: ADDING_TODO };
    case GO_TO_IDLE:
      return { todos: state.todos, appState: IDLE };
    case BACK_BUTTON:
      if (state.appState === IDLE) {
        AppState.exitApp();
        return state;
      }

      return { todos: state.todos, appState: IDLE };
    case EDIT_TODO:
      return { ...state, appState: EDITING_TODO, editingTodo: state.todos[index] };
    case UPDATE_TODO:
      // state.editingTodo is the old one
      // value is the new one
      const invalid =
        state.editingTodo.name !== value.name && state.todos.some(todo => todo.name === value.name);
      if (!invalid) {
        todos = state.todos.slice();
        todos.splice(
          state.todos.findIndex(todo => todo.name === state.editingTodo.name),
          1,
        );
        todos.push(value);

        return { todos, appState: IDLE };
      } else {
        return state;
      }
    case DELETE_TODO:
      todos = state.todos.slice();
      todos.splice(
        state.todos.findIndex(todo => todo.name === state.editingTodo.name),
        1,
      );

      return { todos, appState: IDLE };
    case COMPLETE_TODO:
      return {
        appState: IDLE,
        todos: state.todos.map(todo => ({
          ...todo,
          completed: state.editingTodo.name === todo.name ? true : todo.completed,
        })),
      };
    case GO_TO_SETTINGS:
      return { ...state, appState: SETTINGS_PAGE };
    case CONTEXT_CLICK:
      const focusTodo = state.todos.find(todo => todo.name === value);

      if (focusTodo) {
        return { ...state, appState: CONTEXT_MENU, focusTodo };
      } else {
        return state;
      }
    case SLEEP_CURRENT_TODO:
      return {
        appState: IDLE,
        todos: state.todos.map(todo => ({
          ...todo,
          sleepUntil: state.focusTodo.name === todo.name ? value : todo.sleepUntil,
        })),
      };
    default:
      return state;
  }
};

const App = () => {
  const [{ appState, todos, editingTodo, focusTodo }, dispatch] = useReducer(todoReducer, {
    appState: IDLE,
    todos: localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [],
  });

  const sortedTodosByImportant = todos.sort((a, b) => b.important - a.important);

  const [importantThreshold, setImportantThreshold] = useState(
    localStorage.getItem('scales')
      ? JSON.parse(localStorage.getItem('scales')).importantThreshold
      : 65,
  );
  const [urgentThreshold, setUrgentThreshold] = useState(
    localStorage.getItem('scales')
      ? JSON.parse(localStorage.getItem('scales')).urgentThreshold
      : 65,
  );

  // sort todos into proper buckets
  const urgentImportantTodos = sortedTodosByImportant.filter(
    todo => todo.important >= importantThreshold && todo.urgent >= urgentThreshold,
  );
  const urgentUnimportantTodos = sortedTodosByImportant.filter(
    todo => todo.important < importantThreshold && todo.urgent >= urgentThreshold,
  );
  const nonurgentUnimportantTodos = sortedTodosByImportant.filter(
    todo => todo.important < importantThreshold && todo.urgent < urgentThreshold,
  );
  const nonurgentImportantTodos = sortedTodosByImportant.filter(
    todo => todo.important >= importantThreshold && todo.urgent < urgentThreshold,
  );

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('scales', JSON.stringify({ importantThreshold, urgentThreshold }));
  }, [importantThreshold, urgentThreshold]);

  useEffect(() => {
    document.body.style.backgroundColor = appState === SETTINGS_PAGE ? 'cyan' : 'yellow';
  }, [appState]);

  useEffect(() => {
    SplashScreen.hide();
    AppState.addListener('backButton', () => {
      dispatch({ type: BACK_BUTTON });
    });

    // comment this section out to stop context menu
    document.addEventListener('contextmenu', function(event) {
      event.preventDefault();
      dispatch({ type: CONTEXT_CLICK, value: event.target.innerHTML });
    });
    // end context menu section

    return () => {
      App.removeAllListeners();
      document.removeAllListeners();
    };
  }, []);

  // const clearTodos = () => dispatch({ type: SLICE, startIndex: 0, endIndex: 0 })
  const goBack = () => dispatch({ type: GO_TO_IDLE });

  if (appState === SETTINGS_PAGE) {
    return (
      <FullScreenContainer>
        <p>What is your importance threshold?</p>
        <p>(Tasks above this mark will be deemed important)</p>
        <Slider
          min={0}
          max={100}
          step={1}
          value={importantThreshold}
          onChange={setImportantThreshold}
        />
        <p>What is your urgency threshold?</p>
        <p>(Tasks above this mark will be deemed urgent)</p>
        <Slider min={0} max={100} step={1} value={urgentThreshold} onChange={setUrgentThreshold} />
        <BigButton onClick={() => dispatch({ type: GO_TO_IDLE })}>Go Back</BigButton>
      </FullScreenContainer>
    );
  }

  if (appState === CONTEXT_MENU) {
    const date = new Date();

    const assignDate = days => {
      date.setDate(date.getDate() + days);
      return date;
    };

    const handleSleep = val => dispatch({ type: SLEEP_CURRENT_TODO, value: assignDate(val) });

    return (
      <FullScreenContainer>
        <Title big>{focusTodo.name}</Title>
        {focusTodo.sleepUntil && getDaysFromDate(focusTodo.sleepUntil) > 0 && (
          <WideButton onClick={() => dispatch({ type: SLEEP_CURRENT_TODO, value: CANCEL_SLEEP })}>
            Wake up todo
          </WideButton>
        )}
        <WideButton onClick={() => handleSleep(1)}>Sleep for today</WideButton>
        <WideButton onClick={() => handleSleep(3)}>Sleep for 3 days</WideButton>
        <WideButton onClick={() => handleSleep(5)}>Sleep for 5 days</WideButton>
        <WideButton onClick={() => handleSleep(7)}>Sleep for 7 days</WideButton>
        <WideButton onClick={() => dispatch({ type: GO_TO_IDLE })}>Go Back</WideButton>
      </FullScreenContainer>
    );
  }

  if ([ADDING_TODO, EDITING_TODO].includes(appState)) {
    const addTodo = todo => {
      const newTodo = !todos.some(mainListTodo => mainListTodo.name === todo.name);

      if (todo.name && newTodo) {
        dispatch({ type: PUSH, value: todo });
      }
    };

    const updateTodo = todo => {
      if (todo.name) {
        dispatch({ type: UPDATE_TODO, value: todo });
      }
    };

    const deleteTodo = () => {
      dispatch({ type: DELETE_TODO });
    };

    return (
      <AddTodo
        addTodo={addTodo}
        goBack={goBack}
        todos={sortedTodosByImportant}
        editingTodo={editingTodo}
        updateTodo={updateTodo}
        deleteTodo={deleteTodo}
      />
    );
  }

  return (
    <TodoContainer>
      <UrgentImportant>
        <Title>Urgent Important</Title>
        <TodoScrollBox>
          {urgentImportantTodos.filter(notSleepy).map((todo, i) => (
            <Todo
              key={i}
              onClick={() =>
                dispatch({
                  type: EDIT_TODO,
                  index: todos.findIndex(mainListTodo => todo.name === mainListTodo.name),
                })
              }
            >
              <PulseContents seconds={() => getFrequencyFromDate(todo.date)}>
                {todo.name}
              </PulseContents>
              {todo.date && <Calender white />}
            </Todo>
          ))}
          {urgentImportantTodos.filter(sleepy).map((todo, i) => (
            <Todo
              sleepy
              key={i}
              onClick={() =>
                dispatch({
                  type: EDIT_TODO,
                  index: todos.findIndex(mainListTodo => todo.name === mainListTodo.name),
                })
              }
            >
              <ContextTarget>{todo.name}</ContextTarget>
              {todo.date && <Calender white />}
            </Todo>
          ))}
        </TodoScrollBox>
      </UrgentImportant>
      <NonUrgentImportant>
        <Title>Non-Urgent Important</Title>
        <TodoScrollBox>
          {nonurgentImportantTodos.filter(notSleepy).map((todo, i) => (
            <Todo
              key={i}
              onClick={() =>
                dispatch({
                  type: EDIT_TODO,
                  index: todos.findIndex(mainListTodo => todo.name === mainListTodo.name),
                })
              }
            >
              <PulseContents seconds={() => getFrequencyFromDate(todo.date)}>
                {todo.name}
              </PulseContents>
              {todo.date && <Calender />}
            </Todo>
          ))}
          {nonurgentImportantTodos.filter(sleepy).map((todo, i) => (
            <Todo
              sleepy
              key={i}
              onClick={() =>
                dispatch({
                  type: EDIT_TODO,
                  index: todos.findIndex(mainListTodo => todo.name === mainListTodo.name),
                })
              }
            >
              <ContextTarget>{todo.name}</ContextTarget>
              {todo.date && <Calender />}
            </Todo>
          ))}
        </TodoScrollBox>
      </NonUrgentImportant>
      <UrgentUnimportant>
        <Title>Urgent Un-Important</Title>
        <TodoScrollBox>
          {urgentUnimportantTodos.filter(notSleepy).map((todo, i) => (
            <Todo
              key={i}
              onClick={() =>
                dispatch({
                  type: EDIT_TODO,
                  index: todos.findIndex(mainListTodo => todo.name === mainListTodo.name),
                })
              }
            >
              <PulseContents seconds={() => getFrequencyFromDate(todo.date)}>
                {todo.name}
              </PulseContents>
              {todo.date && <Calender />}
            </Todo>
          ))}
          {urgentUnimportantTodos.filter(sleepy).map((todo, i) => (
            <Todo
              sleepy
              key={i}
              onClick={() =>
                dispatch({
                  type: EDIT_TODO,
                  index: todos.findIndex(mainListTodo => todo.name === mainListTodo.name),
                })
              }
            >
              <ContextTarget>{todo.name}</ContextTarget>
              {todo.date && <Calender />}
            </Todo>
          ))}
        </TodoScrollBox>
      </UrgentUnimportant>
      <NonUrgentUnimportant>
        <Title>Non-Urgent Un-Important</Title>
        <TodoScrollBox>
          {nonurgentUnimportantTodos.filter(notSleepy).map((todo, i) => (
            <Todo
              key={i}
              onClick={() =>
                dispatch({
                  type: EDIT_TODO,
                  index: todos.findIndex(mainListTodo => todo.name === mainListTodo.name),
                })
              }
            >
              <PulseContents seconds={() => getFrequencyFromDate(todo.date)}>
                {todo.name}
              </PulseContents>
              {todo.date && <Calender white />}
            </Todo>
          ))}
          {nonurgentUnimportantTodos.filter(sleepy).map((todo, i) => (
            <Todo
              sleepy
              key={i}
              onClick={() =>
                dispatch({
                  type: EDIT_TODO,
                  index: todos.findIndex(mainListTodo => todo.name === mainListTodo.name),
                })
              }
            >
              <ContextTarget>{todo.name}</ContextTarget>
              {todo.date && <Calender white />}
            </Todo>
          ))}
        </TodoScrollBox>
      </NonUrgentUnimportant>
      <SettingsButton onClick={() => dispatch({ type: GO_TO_SETTINGS })}>...</SettingsButton>
      <AddTodoButton onClick={() => dispatch({ type: CLICK_ADD_BUTTON })}>+</AddTodoButton>
      {/* <AddTodoButton onClick={clearTodos}>+</AddTodoButton> */}
    </TodoContainer>
  );
};

export default App;
