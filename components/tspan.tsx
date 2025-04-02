import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {TSpan} from 'react-native-svg';

const TSpanComponent = ({id, x, y, fontSize, textAnchor, value, type}: any) => {
  return (
    <TSpan
      fill={type === 'Newest' ? '#fff' : '#000'}
      id={id}
      x={x}
      y={y}
      fontSize={fontSize}
      textAnchor={textAnchor}>
      {value === 'DC' ||
      value === 'NJ' ||
      value === 'MD' ||
      value === 'MA' ||
      value === 'NH' ||
      value === 'VT' ||
      value === 'DE' ||
      value === 'RI' ||
      value === 'CT'
        ? value
        : id}
    </TSpan>
  );
};

export default TSpanComponent;

const styles = StyleSheet.create({});
