import React from 'react';

import styled from 'styled-components';

const Carousel = styled.div`
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: ${p => p.hide ? '100%' : 0};
  opacity: ${p => p.hide ? 0 : 1};
  z-index: 10;
  transition: all ease-in .25s;
`

export default Carousel;

const BELL_POSITION = {
  carouselTitle: -35,
  hiddenAbove: -30,
  hiddenBelow: 30,
  '-5': -30,
  '-4': -25,
  '-3': -20,
  '-2': -15,
  '-1': -8,
  '0': 0,
  '1': 8,
  '2': 15,
  '3': 20,
  '4': 25,
  '5': 30
}

const BELL_OPACITY = {
  carouselTitle: 1,
  hiddenAbove: 0,
  hiddenBelow: 0,
  '-5': .1,
  '-4': .2,
  '-3': .4,
  '-2': .6,
  '-1': 1,
  '0': 1,
  '1': 1,
  '2': .6,
  '3': .4,
  '4': .2,
  '5': .1
}

const CarouselItemWrapper = styled.div`
  width: 100%;
  position: absolute;
  top: ${p => (45 + p.position) + '%'};
  opacity: ${p => Math.sqrt(p.visibility)};
  transform: scale(${p => Math.sqrt(Math.sqrt(p.visibility))}) rotate(${p => p.carouselTitle ? 0 : 360 - p.position}deg);
  margin-left: ${p => p.carouselTitle ? 0 : (Math.abs(p.position) / 6) - 2}rem;
  display: flex;
  justify-content: center;
  transition: all .2s ease-out;
`

const CarouselItemContent = styled.div`
  color: white;
  font-size: 2rem;
  text-shadow: 0 0 5px black, 0 0 10px black;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const CarouselItem = ({ children, scale, primary, carouselTitle }) => (
  <CarouselItemWrapper 
    position={BELL_POSITION[primary ? 0 : carouselTitle ? 'carouselTitle' : getCarouselIndex(scale)]} 
    visibility={BELL_OPACITY[primary ? 0 : carouselTitle ? 'carouselTitle' : getCarouselIndex(scale)]}
    carouselTitle={carouselTitle ? true : false}
  >
    <CarouselItemContent>
      {children}
    </CarouselItemContent>
  </CarouselItemWrapper>
);

export const CarouselTitle = ({ children }) => (
  <CarouselItem carouselTitle>
    {children}
  </CarouselItem>
);

const getCarouselIndex = scale => {
  if (scale < -3) return 'hiddenAbove';
  if (scale > 5) return 'hiddenBelow';
  if (scale < 1) return (scale - 1).toString();
  return scale.toString();
}
