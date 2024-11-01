import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { Caption11M } from '../../../styles/GlobalText.tsx';
import { BLACK, BLACK2, PURPLE } from '../../../styles/GlobalColor.tsx';
import StarIcon from '../../../assets/common/Star.svg';

import { StackScreenProps } from '@react-navigation/stack';
import { HomeStackParams } from '../../../pages/Home';

import InfoPage from './InfoPage.tsx';

import Footer from '../../../common/Footer.tsx';

import Arrow from '../../../assets/common/Arrow.svg';
import ServicePage from './ServicePage.tsx';
import DetailScreenHeader from '../components/DetailScreenHeader.tsx';
import ScrollTopButton from '../../../common/ScrollTopButton.tsx';

export const ProfileSection = ({
  navigation,
  reformerName,
}: {
  navigation: any;
  reformerName: string;
}) => {
  const marketName: string = reformerName + '의 마켓';
  const selfIntroduce: string =
    '안녕하세요 리폼러 이하늘입니다! 저는 업씨대학교 패션디자인학과에 수석입학했고요 짱짱 천재에요';
  const rate: number = 4.5; // 평점
  const reviewNumber: number = 100; // 후기 개수

  return (
    <View style={{ alignItems: 'center' }}>
      <ProfileHeader
        marketName={marketName}
        rate={rate}
        reviewNumber={reviewNumber}
      />
      <View style={{ padding: 20, paddingTop: 0, paddingBottom: 0 }}>
        {/* 이 밑에거 지우면 이상하게 에러남... 그냥 냅둬도 되는 거라 무시하셔도 됩니다.  */}
        <TouchableOpacity>
          <Caption11M style={{ color: BLACK2, marginLeft: 0 }}></Caption11M>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ProfileHeader = ({
  marketName,
  rate,
  reviewNumber,
}: {
  marketName: string;
  rate: number;
  reviewNumber: number;
}) => {
  return (
    <>
      <DetailScreenHeader
        title=""
        leftButton="CustomBack"
        onPressLeft={() => {}}
        rightButton="Edit"
        onPressRight={() => {}}
      />
      <ImageBackground
        style={{ width: '100%', height: 200 }}
        imageStyle={{ height: 160 }}
        source={{
          uri: 'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp',
        }}>
        <View
          style={{
            width: '100%',
            height: 160,
            backgroundColor: '#00000066',
            opacity: 0.7,
          }}
        />
        <Image
          style={{
            alignSelf: 'center',
            width: 90,
            height: 90,
            borderRadius: 180,
            position: 'absolute',
            top: 110,
          }}
          source={{
            uri: 'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp',
          }}
        />
      </ImageBackground>
      <Text style={TextStyles.marketName}>{marketName}</Text>
      <View style={styles.profileHeaderRateBox}>
        <StarIcon color={PURPLE} />
        <Text style={TextStyles.rate}>{rate}</Text>
        <Text style={TextStyles.reviewNumber}>({reviewNumber})</Text>
        <Arrow color={BLACK} style={styles.arrow} />
        {/* TODO: click event 걸기 */}
      </View>
    </>
  );
};

type MarketTabViewProps = {
  reformerName: string;
};

const MarketTabView = ({
  navigation,
  route,
}: StackScreenProps<HomeStackParams, 'MarketTabView'>) => {
  const { reformerName }: MarketTabViewProps = route.params || '정보 없음';
  const [routes] = useState([
    { key: 'profile', title: '프로필' },
    { key: 'service', title: '서비스' },
  ]);
  const flatListRef = useRef<FlatList>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs.Container
        renderHeader={props => (
          <ProfileSection navigation={navigation} reformerName={reformerName} />
        )}
        headerContainerStyle={{
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderColor: '#D9D9D9',
        }}
        renderTabBar={props => (
          <MaterialTabBar
            {...props}
            indicatorStyle={{
              backgroundColor: '#BDBDBD',
              height: 2,
            }}
            style={{
              backgroundColor: 'white',
            }}
            labelStyle={{
              color: BLACK,
              fontWeight: '700',
              fontSize: 16,
            }}
          />
        )}>
        {routes.map(route => (
          <Tabs.Tab key={route.key} name={route.title}>
            {route.key === 'profile' && <InfoPage />}
            {route.key === 'service' && (
              <View>
                <ServicePage
                  scrollViewRef={scrollRef}
                  navigation={navigation}
                  reformerName={reformerName}
                />
                <ScrollTopButton scrollViewRef={scrollRef} />
              </View>
            )}
          </Tabs.Tab>
        ))}
      </Tabs.Container>
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileHeaderRateBox: {
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
    lineHeight: 24,
  },
  star: {
    width: 12,
    height: 12,
  },
  arrow: {
    transform: [{ rotate: '180deg' }],
    paddingHorizontal: 9,
    paddingVertical: 6,
    width: 6,
    height: 12,
    gap: 8,
  },
});

const TextStyles = StyleSheet.create({
  marketName: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Pretendard Variable',
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  rate: {
    color: '#222',
    textAlign: 'center',
    fontFamily: 'Pretendard Variable',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewNumber: {
    color: '#222',
    textAlign: 'center',
    fontFamily: 'Pretendard Variable',
    fontSize: 16,
    fontWeight: '400',
  },
});

export default MarketTabView;
