import React, { useState, useEffect, useReducer, useRef } from 'react';

import { FullScreenContainer, BigButton } from './App';
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

const BottomOfScreenFlexBetween = styled(FlexSpaceBetween)`
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

  const todo = {
    name,
    desc,
    urgent,
    important,
    date: useDate ? date : undefined,
  };

  useEffect(() => {
    if (!editingTodo) nameInput.current.focus();
  }, []);

  const sortedTodosByImportant = todos.sort((a, b) => b.important - a.important);
  const nextHighestImportant = sortedTodosByImportant.reduce(
    (returningTodo, currentTodo) =>
      currentTodo.important > important ? currentTodo : returningTodo,
    null,
  );

  const nextHighestImportantIndex =
    nextHighestImportant &&
    sortedTodosByImportant.findIndex(todo => todo.name === nextHighestImportant.name);
  const nextLowestImportant =
    typeof nextHighestImportantIndex === 'number'
      ? sortedTodosByImportant[nextHighestImportantIndex + 1]
      : sortedTodosByImportant[0];

  const sortedTodosByUrgent = todos.sort((a, b) => b.urgent - a.urgent);
  const nextHighestUrgent = sortedTodosByUrgent.reduce(
    (returningTodo, currentTodo) => (currentTodo.urgent > urgent ? currentTodo : returningTodo),
    null,
  );

  const nextHighestUrgentIndex =
    nextHighestUrgent &&
    sortedTodosByUrgent.findIndex(todo => todo.name === nextHighestUrgent.name);
  const nextLowestUrgent =
    typeof nextHighestUrgentIndex === 'number'
      ? sortedTodosByUrgent[nextHighestUrgentIndex + 1]
      : sortedTodosByUrgent[0];

  let importantHelperText;
  if (nextHighestImportant && nextLowestImportant) importantHelperText = '<- between these two ->';
  else if (nextHighestImportant) importantHelperText = 'not as important as';
  else if (nextLowestImportant) importantHelperText = 'is next next lowest in importance';

  let urgentHelperText;
  if (nextHighestUrgent && nextLowestUrgent) urgentHelperText = '<- between these two ->';
  else if (nextHighestUrgent) urgentHelperText = 'not as urgent as';
  else if (nextLowestUrgent) urgentHelperText = 'is next next lowest in urgency';

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
      <Slider min={0} max={100} step={1} value={important} onChange={setImportant} />
      <HighLow />
      <FlexSpaceBetween>
        <CompareTodo>{nextLowestImportant && nextLowestImportant.name}</CompareTodo>
        <SmallHelperText>{importantHelperText}</SmallHelperText>
        <CompareTodo>{nextHighestImportant && nextHighestImportant.name}</CompareTodo>
      </FlexSpaceBetween>
      How urgent is this task?
      <Slider min={0} max={100} step={1} value={urgent} onChange={setUrgent} />
      <HighLow />
      <FlexSpaceBetween>
        <CompareTodo>{nextLowestUrgent && nextLowestUrgent.name}</CompareTodo>
        <SmallHelperText>{urgentHelperText}</SmallHelperText>
        <CompareTodo>{nextHighestUrgent && nextHighestUrgent.name}</CompareTodo>
      </FlexSpaceBetween>
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
          <BigButton onClick={() => updateTodo(todo)}>Update</BigButton>
        ) : (
          <BigButton onClick={() => addTodo(todo)}>Add todo</BigButton>
        )}
      </BottomOfScreenFlexBetween>
    </FullScreenContainer>
  );
};

export default AddTodo;
