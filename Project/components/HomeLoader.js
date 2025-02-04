import React from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
const HomeLoader = (props) => (
  <ContentLoader
    speed={2}
    width={hp(50)}
    height={hp(75)}
    viewBox="0 0 500 475"
    backgroundColor="#c5c8de"
    foregroundColor="#ecebeb"
    {...props}
  >
    {/* First Row */}
    <Circle cx="70" cy="73" r="41" />
    <Rect x="130" y="30" width="125" height="17" />
    <Rect x="130" y="65" width="296" height="17" />
    <Rect x="130" y="98" width="253" height="17" />
    <Rect x="130" y="132" width="212" height="17" />

    {/* Second Row */}
    <Circle cx="70" cy="243" r="41" />
    <Rect x="130" y="200" width="125" height="17" />
    <Rect x="130" y="235" width="296" height="17" />
    <Rect x="130" y="268" width="253" height="17" />
    <Rect x="130" y="302" width="212" height="17" />

    {/* Third Row */}
    <Circle cx="70" cy="413" r="41" />
    <Rect x="130" y="369" width="125" height="17" />
    <Rect x="130" y="404" width="296" height="17" />
    <Rect x="130" y="437" width="253" height="17" />
    <Rect x="130" y="471" width="212" height="17" />
  </ContentLoader>
);

export default HomeLoader;