import React from 'react';

import styled from 'styled-components';

const Calendar = props => (
  <CalenderWrapper>
    <CalenderContainer {...props} >
      <Littlelineleft {...props} />
      <Littlelineright {...props} />
      <Hr {...props} />
      <Littlesquare1 {...props} />
      <Littlesquare2 {...props} />
      <Littlesquare3 {...props} />
      <Littlesquare4 {...props} />
      <Littlesquare5 {...props} />
      <Littlesquare6 {...props} />
    </CalenderContainer>
  </CalenderWrapper>
)

const CalenderWrapper = styled.div`
  display: inline-block;
  position: relative;
  width: 1.5rem;
  height: .95rem;
`

const CalenderContainer = styled.div`
    transform: scale(0.2);
    width: 70px;
    height: 60px;
    border: 4px solid ${p => p.white ? 'white' : 'black'};
    border-radius: 12px;
    left: -1.6rem;
    top: -1.55rem;
    position: absolute;
    display: inline-block;
`

const Littlelineleft = styled.div`
    width: 4px;
    height: 15px;
    background: ${p => p.white ? 'white' : 'black'};
    border-radius: 12px;
    position: absolute;
    left: 15px;
    top: -9px;
`

const Littlelineright = styled.div`
    width: 4px;
    height: 15px;
    background: ${p => p.white ? 'white' : 'black'};
    border-radius: 12px;
    position: absolute;
    right: 15px;
    top: -9px;
`

const Hr = styled.hr`
    border: 2px solid ${p => p.white ? 'white' : 'black'};
    margin-top: 12px;
`

const Littlesquare1 = styled.div` 
    width: 8px;
    height: 8px;
    border: 3px solid ${p => p.white ? 'white' : 'black'};
    border-radius: 5px;
    position: absolute;
    left: 8px;
    top: 22px;
`

const Littlesquare2 = styled.div` 
    width: 8px;
    height: 8px;
    border: 3px solid ${p => p.white ? 'white' : 'black'};
    border-radius: 5px;
    position: absolute;
    left: 28px;
    top: 22px;
`

const Littlesquare3 = styled.div` 
    width: 8px;
    height: 8px;
    border: 3px solid ${p => p.white ? 'white' : 'black'};
    border-radius: 5px;
    position: absolute;
    right: 8px;
    top: 22px;
`

const Littlesquare4 = styled.div` 
    width: 8px;
    height: 8px;
    border: 3px solid ${p => p.white ? 'white' : 'black'};
    border-radius: 5px;
    position: absolute;
    left: 8px;
    top: 40px;
`

const Littlesquare5 = styled.div` 
    width: 8px;
    height: 8px;
    border: 3px solid ${p => p.white ? 'white' : 'black'};
    border-radius: 5px;
    position: absolute;
    left: 28px;
    top: 40px;
`

const Littlesquare6 = styled.div` 
    width: 8px;
    height: 8px;
    border: 3px solid ${p => p.white ? 'white' : 'black'};
    border-radius: 5px;
    position: absolute;
    right: 8px;
    top: 40px;
`

export default Calendar