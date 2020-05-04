import React, { useState, useEffect, useReducer, useRef } from 'react';

import { FullScreenContainer, BigButton } from './App';
import Carousel, { CarouselItem, CarouselTitle } from './Carousel';
import { perc2color } from './helpers';

import styled from 'styled-components';
import { Slider } from '@reach/slider';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TodoNameInput = styled.input`
  border: solid 2px;
  padding: 8px;
  margin: 0.5rem 0;
  width: 100%;
  box-sizing: border-box;
  border-radius: 5px;
`;

const TodoDescTextArea = styled.textarea`
  border: solid 2px;
  padding: 3px;
  margin: 0.5rem 0 2rem;
  width: 100%;
  min-height: 6rem;
  box-sizing: border-box;
  max-height: 10rem;
  max-width: 100%;
  resize: none;
  border-radius: 5px;
`;

const FlexSpaceBetween = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  position: relative;
  top: -1rem;
`;

const SmallHelperText = styled.span`
  padding-top: 6px;
  font-size: 0.75rem;
`;

const HighLow = () => (
  <FlexSpaceBetween>
    <SmallHelperText>Very Low</SmallHelperText>
    <SmallHelperText>Very High</SmallHelperText>
  </FlexSpaceBetween>
);

export const BottomOfScreenFlexBetween = styled(FlexSpaceBetween)`
  position: fixed;
  bottom: 10px;
  top: auto;
  margin: 0;
  width: 92%;
`;

const CompareTodo = styled.span`
  font-size: 1.5rem;
`;

const ButtonSpacer = styled.div`
  height: 5rem;
`;

const DatePickerWrapper = styled.div`
  margin-bottom: 1rem;

  .react-datepicker-popper {
    z-index: 5;
  }

  input[type='text'] {
    margin-left: 1rem;
    background-color: white;
    padding: 5px;
    width: 5rem;
  }
  input[type='checkbox'] {
    margin: 0 1rem;
  }

  .react-datepicker-popper {
    left: -17rem;
  }
`;

const clickAndWaitReducer = (shouldDelete = false, { type }) => {
  switch (type) {
    case 'RESET':
      return false;
    case 'CLICK':
      return true;
    default:
      return shouldDelete;
  }
};

const AddTodo = ({ addTodo, goBack, todos, editingTodo, updateTodo, deleteTodo }) => {
  const [urgent, setUrgent] = useState(editingTodo ? editingTodo.urgent : 50);
  const [important, setImportant] = useState(editingTodo ? editingTodo.important : 50);
  const [name, setName] = useState(editingTodo ? editingTodo.name : '');
  const [desc, setDesc] = useState(editingTodo ? editingTodo.desc : '');

  // checking for `&& editingTodo.date` because some todos might not have dates
  const [date, setDate] = useState(
    editingTodo && editingTodo.date ? new Date(editingTodo.date) : new Date(),
  );
  const [useDate, setUseDate] = useState(editingTodo && editingTodo.date ? true : false);

  const [shouldCheckForDelete, dispatchDelete] = useReducer(clickAndWaitReducer);

  useEffect(() => {
    document.body.style.backgroundColor = perc2color(100 - important);
  }, [important]);

  useEffect(() => {
    let mounted = true;

    if (shouldCheckForDelete) {
      setTimeout(() => {
        if (mounted) dispatchDelete({ type: 'RESET' });
      }, 2000);
    }

    return () => (mounted = false);
  }, [shouldCheckForDelete]);

  const nameInput = useRef(null);

  const existingParams = editingTodo ? editingTodo : {};
  const todoToSave = {
    ...existingParams,
    name,
    desc,
    urgent,
    important,
    date: useDate ? date : undefined,
  };

  const [initialOpen, setInitialOpen] = useState(true);
  useEffect(() => {
    if (!editingTodo && initialOpen) {
      nameInput.current.focus();
      setInitialOpen(false);
    }
  }, [editingTodo, initialOpen]);

  // trim out editingTodo so it doesn't show up in "less/more important todos"
  let todosWithoutThisOne = todos.slice();

  const thisTodoIndex = editingTodo
    ? todos.findIndex(todo => editingTodo.name === todo.name)
    : null;
  if (thisTodoIndex) todosWithoutThisOne.splice(thisTodoIndex, 1);

  const nextHighestImportant = todosWithoutThisOne.reduce(
    (returningTodo, currentTodo) =>
      currentTodo.important > important ? currentTodo : returningTodo,
    null,
  );

  const sortedTodosByUrgent = todosWithoutThisOne.slice().sort((a, b) => b.urgent - a.urgent);

  const [overlay, setOverlay] = useState(false);
  const importantIndex =
    overlay &&
    todosWithoutThisOne.reduce((acc, todo) => (todo.important > important ? acc + 1 : acc), 0) - 1;
  const urgentIndex =
    overlay &&
    sortedTodosByUrgent.reduce((acc, todo) => (todo.urgent > urgent ? acc + 1 : acc), 0) - 1;

  return (
    <FullScreenContainer scale={important}>
      <div>Task name:</div>
      <div>
        <TodoNameInput ref={nameInput} value={name} onChange={e => setName(e.target.value)} />
      </div>
      <DatePickerWrapper>
        <div>
          <input type='checkbox' checked={useDate} onChange={() => setUseDate(!useDate)} />
          Due date:
          <DatePicker selected={date} onChange={val => setUseDate(true) || setDate(val)} />
        </div>
      </DatePickerWrapper>
      <div>Task description:</div>
      <div>
        <TodoDescTextArea value={desc} onChange={e => setDesc(e.target.value)} />
      </div>
      How important is this task?
      <Slider
        min={0}
        max={100}
        step={1}
        value={important}
        onChange={setImportant}
        onTouchStart={() => setOverlay('important')}
        onTouchEnd={() => setOverlay(false)}
      />
      <HighLow />
      How urgent is this task?
      <Slider
        min={0}
        max={100}
        step={1}
        value={urgent}
        onChange={setUrgent}
        onTouchStart={() => setOverlay('urgent')}
        onTouchEnd={() => setOverlay(false)}
      />
      <HighLow />
      <ButtonSpacer />
      <BottomOfScreenFlexBetween>
        <BigButton onClick={goBack}>Back</BigButton>
        {editingTodo && (
          <BigButton
            color={shouldCheckForDelete ? 'red' : null}
            onClick={() => {
              if (shouldCheckForDelete) {
                deleteTodo();
              } else {
                dispatchDelete({ type: 'CLICK' });
              }
            }}
          >
            Delete
          </BigButton>
        )}
        {editingTodo ? (
          <BigButton onClick={() => updateTodo(todoToSave)}>Update</BigButton>
        ) : (
          <BigButton onClick={() => addTodo(todoToSave)}>Add todo</BigButton>
        )}
      </BottomOfScreenFlexBetween>
      <Carousel hide={overlay !== 'important'}>
        <CarouselTitle>Relative Importance:</CarouselTitle>
        {todosWithoutThisOne.map((todo, i) => (
          <CarouselItem scale={i - importantIndex} key={todo.name}>
            {todo.name}
          </CarouselItem>
        ))}
        <CarouselItem primary>{name || '(New Task)'}</CarouselItem>
      </Carousel>
      <Carousel hide={overlay !== 'urgent'}>
        <CarouselTitle>Relative Urgency:</CarouselTitle>
        {sortedTodosByUrgent.map((todo, i) => (
          <CarouselItem scale={i - urgentIndex} key={todo.name}>
            {todo.name}
          </CarouselItem>
        ))}
        <CarouselItem primary>{name || '(New Task)'}</CarouselItem>
      </Carousel>
    </FullScreenContainer>
  );
};

export default AddTodo;
