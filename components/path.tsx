import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Path} from 'react-native-svg';

const PathComponent = ({
  id,
  fill,
  stroke,
  width,
  opacity,
  area,
  isScrolling,
  onClick,
}: any) => {
  // const stateSelected = (select: any) => {
  //   console.log('selected', select);
  // };
  return (
    <Path
      onPressIn={onClick} // Triggering the function on click
      id={id}
      fill={fill}
      stroke={stroke}
      stroke-width={width}
      stroke-opacity={opacity}
      d={area}></Path>
  );
};

export default PathComponent;

const styles = StyleSheet.create({});
