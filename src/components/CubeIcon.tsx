import React from 'react';
import Svg, { Path } from 'react-native-svg';

const CubeIcon = () => {
  return (
    <Svg width="48" height="48" viewBox="0 0 100 100">
      <Path
        d="M50,0 L100,25 L50,50 L0,25 Z"
        fill="#282828"
      />
      <Path
        d="M0,25 L50,50 L50,100 L0,75 Z"
        fill="#111"
      />
      <Path
        d="M50,50 L100,25 L100,75 L50,100 Z"
        fill="#000"
      />
    </Svg>
  );
};

export default CubeIcon; 