import { SafeAreaView, Image, View, TouchableOpacity } from "react-native"
import { Body14M, Body16B, Subtitle16B, Title20B } from "../../../styles/GlobalText"
import Arrow from '../../../assets/common/Arrow.svg';
import { GREEN } from "../../../styles/GlobalColor";
import { StackScreenProps } from "@react-navigation/stack";
import { OrderStackParams } from "../Order/OrderManagement";
import { CommonActions } from "@react-navigation/native";

const SentQuotation = ({ navigation, route }: StackScreenProps<OrderStackParams, 'SentQuotation'>) => {

  const handlePress = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: "Main",
        params: {
          screen: "UPCY", // MainTabNavigator의 홈 화면으로 이동
        },
      })
    );
  };


  return (
    <SafeAreaView style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <View style={{ marginTop: 200 }} />
      <Title20B style={{ marginBottom: 10, textAlign: 'center' }}>리폼러에게 주문서를{'\n'}전달했어요!</Title20B>
      <Image source={require('../../../assets/documents.png')} style={{ width: 230, height: 230 }} />
      <Subtitle16B style={{ textAlign: 'center', marginTop: 10 }}>리폼러가 주문서를 확인 후,{'\n'}카톡으로 연락할거에요~{'\n'}</Subtitle16B>
      <TouchableOpacity style={{ flexDirection: 'row', borderRadius: 5, backgroundColor: 'light grey', opacity: 0.3, marginTop: 100, width: '90%', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20 }} onPress={handlePress}>
        <View style={{ padding: 16 }}>
          <Body14M>이 마켓이 마음에 들었나요?</Body14M>
          <Body16B>SDP 마켓의 다른 서비스 보러가기</Body16B>
        </View>
        <Arrow color={'black'} transform={[{ rotate: '180deg' }]} />
      </TouchableOpacity>

      <TouchableOpacity
        style={{ flexDirection: 'row', borderRadius: 5, backgroundColor: GREEN, marginTop: 20, width: '90%', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20, marginBottom: 100 }}
        onPress={handlePress}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16, flex: 1 }}>
          <Body16B>확인</Body16B>
        </View>
      </TouchableOpacity>

    </SafeAreaView>
  )
}

export default SentQuotation;