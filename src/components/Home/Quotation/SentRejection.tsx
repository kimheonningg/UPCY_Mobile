import { SafeAreaView, Image, View, TouchableOpacity } from 'react-native';
import {
  Body14M,
  Body16B,
  Subtitle16B,
  Title20B,
} from '../../../styles/GlobalText';
import Arrow from '../../../assets/common/Arrow.svg';
import { GREEN } from '../../../styles/GlobalColor';
import { useNavigation } from '@react-navigation/native';

interface SentRejectionProps {
  navigation: any;
}

const SentRejection = ({ navigation }: SentRejectionProps) => {
  const handlePressBefore = () => {};

  const handlePressMain = () => {
    navigation.navigate('Home'); // 'Home'을 실제 네비게이션 스택에 맞게 수정
  };

  return (
    <SafeAreaView
      style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <TouchableOpacity onPress={handlePressBefore}>
        <View style={{ marginTop: 200 }} />
        <Title20B style={{ marginBottom: 10, textAlign: 'center' }}>
          카톡링크를 전송했어요!
        </Title20B>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Image
            source={require('../../../assets/rocket.png')}
            style={{ width: 230, height: 230 }}
          />
        </View>
        <Subtitle16B style={{ textAlign: 'center', marginTop: 10 }}>
          의뢰인이 카톡 링크를 통해,{'\n'} 상담을 신청할 거에요~{'\n'}
        </Subtitle16B>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            borderRadius: 5,
            backgroundColor: GREEN,
            marginTop: 100,
            width: '90%',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 20,
          }}
          onPress={handlePressMain}>
          <View style={{ padding: 16 }}>
            <Body14M>이 마켓이 마음에 들었나요?</Body14M>
            <Body16B>SDP 마켓의 다른 서비스 보러가기</Body16B>
          </View>

          <Arrow color={'black'} transform={[{ rotate: '180deg' }]} />
        </TouchableOpacity>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SentRejection;
