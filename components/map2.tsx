import React, {useEffect, useRef, useState} from 'react';
import Svg, {G, Path, Defs, TSpan} from 'react-native-svg';
import {
  View,
  ScrollView,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TSpanComponent from './tspan';
import PathComponent from './path';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {generateStates} from './stateData';
import {fetchStates} from '../providers/apiprovider';

const {width, height} = Dimensions.get('window');
// const {width} = Dimensions.get('window'); // Get the width of the screen

const Map2Component = ({type, navigation}: any) => {
  const [selectedState, setSelectedState] = useState('');
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const lastTapRef = useRef(0);
  const scale = useSharedValue(1.001); // Zoom level
  const translateX = useSharedValue(0); // Horizontal scroll
  const translateY = useSharedValue(0); // Vertical scroll
  const DEFAULT_COLOR = '#CCCCCC'; // Default color if not found in API

  // Handle pinch-to-zoom gesture
  const handlePinch = ({nativeEvent}: any) => {
    if (nativeEvent.state === State.ACTIVE) {
      scale.value = withTiming(Math.min(Math.max(nativeEvent.scale, 1), 3), {
        duration: 200,
      });
    }
  };

  // Handle zoom buttons
  const handleZoomIn = () => {
    scale.value = withTiming(Math.min(scale.value + 0.2, 3), {duration: 200});
  };

  const handleZoomOut = () => {
    scale.value = withTiming(Math.max(scale.value - 0.2, 1), {duration: 200});
  };

  // Handle pan (scroll) gesture
  const handlePan = ({nativeEvent}: any) => {
    if (nativeEvent.state === State.ACTIVE && scale.value > 1) {
      translateX.value = withTiming(nativeEvent.translationX, {duration: 200});
      translateY.value = withTiming(nativeEvent.translationY, {duration: 200});
    }
  };

  // Animated style for SVG map
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: scale.value},
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
  }));

  const handleDoubleTap = (select: any, type: any, scrolling: any) => {
    const now = Date.now();
    if (now - lastTapRef.current < 500) {
      stateSelected(select, type, scrolling);
    }
    lastTapRef.current = now;
  };

  const handleScroll = (event: any) => {
    // if (!isScrolling) {
    //   setIsScrolling(true);
    // console.log(isScrolling, 'active');
    // }
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const maxScroll = contentSize.width - layoutMeasurement.width;

    setCurrentOffset(contentOffset.x);
    setShowLeftArrow(contentOffset.x > 0);
    setShowRightArrow(contentOffset.x < maxScroll);
  };

  const scrollTo = (direction: 'left' | 'right') => {
    const scrollOffset = 200; // The amount to scroll by
    const newOffset =
      direction === 'right'
        ? currentOffset + scrollOffset
        : currentOffset - scrollOffset;

    // Ensure newOffset stays within valid bounds
    const validOffset = Math.max(0, newOffset);

    scrollViewRef.current?.scrollTo({x: validOffset, animated: true});
  };

  const fontSize = 6;
  const textAnchor = 'middle';
  const stroke_width = '0.5640674394099052';
  const stroke_opacity = '0.5';
  const stroke = '#ffffff';
  const [states, setStates] = useState<State[]>([]);
  // const scrollViewRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // const handleScroll = () => {
  //   // Prevents other events while scrolling
  //   if (!isScrolling) {
  //     setIsScrolling(true);
  //   }
  // };

  const handleScrollEnd = () => {
    // Re-enable other events when scrolling stops
    setIsScrolling(false);
    // console.log(isScrolling, 'deactive');
  };

  const stateSelected = (select: any, type: any, scrolling: any) => {
    if (!scrolling) {
      // console.log(scrolling, 'event');

      navigation.navigate('Details', {select: select, type: type});
    }
  };
  interface State {
    label: string;
    value: string;
    area: string;
    fill: string | (() => string);
    stroke: string;
    width: string;
    opacity: string;
    fontSize: number;
    x: string;
    y: string;
    textAnchor: string;
    type: string;
  }

  useEffect(() => {
    const loadStates = async () => {
      try {
        const apiStates = await fetchStates(); // Fetch state colors from API
        // console.log(existingStates[1], 'statess');
        const apiStatesArray = Array.isArray(apiStates.data)
          ? apiStates.data
          : [];

        if (!Array.isArray(apiStatesArray)) {
          // console.error('Invalid API response format:', apiStatesArray);
          return;
        }

        const existingStates = generateStates(
          type,
          stroke,
          stroke_width,
          stroke_opacity,
          fontSize,
          textAnchor,
        ); // Your predefined state data

        // Merge API colors with existing states
        const mergedStates = existingStates.map(state => {
          const matchingState = apiStatesArray.find(
            apiState => apiState.name === state.label,
          );
          return {
            ...state,
            fill: matchingState?.color || '#CCCCCC', // Assign API color or default
          };
        });

        setStates(mergedStates);

        // console.log(selectedState, 'state after');
      } catch (error) {
        // console.error('Error merging state colors:', error);
      }
    };

    setStates(
      generateStates(
        type,
        stroke,
        stroke_width,
        stroke_opacity,
        fontSize,
        textAnchor,
      ),
    );
    if (type == 'Top 10') {
      loadStates();
    }
  }, [type, stroke, stroke_width, stroke_opacity, fontSize, textAnchor]);

  // Dependency on mode to reinitialize when mode changes

  return (
    <>
      <Text style={styles.mainHeading}>
        Explore {type} Tickets by Locations
      </Text>
      <Text style={styles.body}>
        Select your state by double tap on the map or choosing from the dropdown
        menu.
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text style={styles.title}>Select the State:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedState}
            selectionColor="black"
            accessibilityIgnoresInvertColors={true}
            dropdownIconColor="black"
            onValueChange={(itemValue, itemIndex) => {
              if (itemValue !== '') {
                stateSelected(itemValue, type, false);
                setSelectedState('');
              }
            }}
            style={styles.picker}>
            <Picker.Item label="Select a state..." value="" />
            {states.map((state, index) => (
              <Picker.Item
                key={index}
                label={state['label']}
                value={state['label']}
              />
            ))}
          </Picker>
        </View>
      </View>
      {/* {selectedState ? (
        <Text style={styles.result}>You selected: {selectedState}</Text>
      ) : null} */}
      <View style={{height: 550}}>
        {/* Left Arrow */}
        {/* {showLeftArrow && (
          <TouchableOpacity
            style={[styles.arrowContainer, styles.leftArrow]}
            onPress={() => scrollTo('left')}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
        )} */}

        {/* Scrollable Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollEnd={handleScrollEnd} // Ensures it also triggers on momentum scroll
          scrollEventThrottle={16} // Ensures smooth scrolling feedback
          contentContainerStyle={styles.scrollContent}>
          <GestureHandlerRootView style={styles.container}>
            <PinchGestureHandler onGestureEvent={handlePinch}>
              <PanGestureHandler onGestureEvent={handlePan}>
                <Animated.View style={animatedStyle}>
                  <Svg
                    // width={width}
                    // height={height}
                    viewBox="0 0 500 500"
                    height="550"
                    width={width * 1.5}
                    // version="1.1"
                    // xmlns="http://www.w3.org/2000/svg"
                    // xmlnsXlink="http://www.w3.org/1999/xlink"
                    style={{
                      // marginTop: 120,
                      marginLeft: -120,
                      // transform: [{scale: 1.5}], // Scale down to 50% of the original size
                      transformOrigin: 'center', // Optional: Make the scaling happen from the center
                      // paddingTop: 100,
                      // transform: [{rotate: '90deg'}, {scale: 1}],
                      // transformOrigin: 'center', // Makes the rotation happen around the center of the SVG
                      // backgroundColor: 'red',
                    }}>
                    {states.map(
                      (
                        {label, area, width, stroke, fill, opacity, type},
                        index,
                      ) => (
                        <PathComponent
                          key={index}
                          id={label}
                          fill={fill}
                          area={area}
                          width={width}
                          opacity={opacity}
                          stroke={stroke}
                          onClick={() =>
                            handleDoubleTap(label, type, isScrolling)
                          }
                        />
                      ),
                    )}

                    {states.map(
                      (
                        {label, x, y, fontSize, textAnchor, value, type},
                        index,
                      ) => (
                        <TSpanComponent
                          type={type}
                          key={index}
                          id={label}
                          x={x}
                          value={value}
                          y={y}
                          textAnchor={textAnchor}
                          fontSize={fontSize}
                        />
                      ),
                    )}
                  </Svg>
                </Animated.View>
              </PanGestureHandler>
            </PinchGestureHandler>
          </GestureHandlerRootView>
          {/* Zoom Controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
              <Text style={styles.zoomText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
              <Text style={styles.zoomText}>-</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* Right Arrow */}
        {/* {showRightArrow && (
          <TouchableOpacity
          style={[styles.arrowContainer, styles.rightArrow]}
          onPress={() => scrollTo('right')}>
          <Icon name="arrow-right" size={24} color="#000" />
          </TouchableOpacity>
          )} */}
      </View>
    </>
  );
};

export default Map2Component;

const styles = StyleSheet.create({
  picker: {
    justifyContent: 'center',
    color: 'black',
    // backgroundColor: 'white',
  },
  arrowContainer: {
    position: 'absolute',
    zIndex: 2,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    borderColor: 'lightgrey',
    borderWidth: 1,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 3,
  },
  leftArrow: {
    left: 10,
    top: 230,
  },
  rightArrow: {
    right: 10,
    top: 230,
  },
  pickerWrapper: {
    width: '50%',
    // backgroundColor: '#1097ff',
    // borderRadius: 8,
    color: 'white',
    // borderWidth: 2,
    // borderColor: 'blue',
    // borderBottomColor: '#fe6901',
    borderBottomColor: '#1097ff',
    borderBottomWidth: 2,
    overflow: 'hidden', // Ensures borderRadius is applied
  },
  result: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'left',
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  body: {
    fontSize: 16,
    // fontWeight: 'bold',
    textAlign: 'left',
  },
  scrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 50,
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(188, 186, 186, 0.5)',
    borderRadius: 10,
    padding: 10,
  },
  zoomButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 16,
    marginVertical: 5,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  zoomText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
