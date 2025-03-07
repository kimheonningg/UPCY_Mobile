import React, { useState , useEffect, useCallback} from 'react';
import { SafeAreaView, FlatList, ActivityIndicator, Alert, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal';
import CheckBox from '../../../common/CheckBox';
import DropDownIcon from '../../../assets/common/DropDown.svg';
import UpArrowIcon from '../../../assets/common/UpArrow.svg';
import { Body14R, Subtitle16B, Body16R } from '../../../styles/GlobalText';
import { PURPLE, LIGHTGRAY } from '../../../styles/GlobalColor';
import { useNavigation } from '@react-navigation/native';
import Request from '../../../common/requests';
import { getAccessToken } from '../../../common/storage.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OrderInfoType {
  order_uuid: string;
  service_info: {
    service_title: string;
  };
  order_status: string;
  orderer_information: {
    orderer_name: string;
  };
  order_date: string;
  transaction: {
    transaction_option: string;
  };
  images: { image_type: string; image: string }[];
}


type OrderFilter = {
  filter: string,
  setFilter: any,
  onOpenChat: () => void,
}



const updateOrderStatus = async (order_uuid: string, newStatus: string, setOrderStatus: (status: string) => void) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      Alert.alert('❌ 오류', '로그인이 필요합니다.');
      return;
    }

    const url = `/api/orders/${order_uuid}/status`;
    console.log(`📌 주문 상태 업데이트 요청: ${url}, 새로운 상태: ${newStatus}`);

    const data = { status: newStatus };

    const response = await Request().patch(url, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      setOrderStatus(newStatus); // 상태 업데이트
      console.log(`✅ 주문 상태 변경 완료: ${newStatus}`);
    } else {
      Alert.alert('❌ 오류', `주문 상태 업데이트 실패: 서버 응답 ${response.status}`);
    }
  } catch (error) {
    console.error('❌ 주문 상태 업데이트 실패:', error?.response?.data || error.message);
    Alert.alert(
      '❌ 오류',
      `주문 상태 업데이트 중 오류 발생\n${error?.response?.data?.message || error.message}`
    );
  }
};




// 화면상단 필터, 채팅
const OrderFilter = ({ filter, setFilter, onOpenChat }: OrderFilter) => {
  return (
    <FilterContainer>
      <PickerWrapper>
        <Picker
          selectedValue={filter}
          onValueChange={(value) => setFilter(value)}
          style={[styles.filterPicker, { height: '100%' }]}
        >
          <Picker.Item label="최신순" value="desc" />
          <Picker.Item label="오래된 순" value="asc" />
        </Picker>
      </PickerWrapper>
      <OpenChatButton onPress={onOpenChat}>
        <Text style={{ color: 'BLACK', fontSize: 14 }}>내 오픈채팅 바로가기</Text>
      </OpenChatButton>
    </FilterContainer>
  );
};



const OrderStatusLabel = ({ order_status }: any) => {
  const status = Array.isArray(order_status) && order_status.length > 0
    ? order_status[0]?.status
    : '';

  return (
      <StatusText>
        {status === 'pending' && '수락 대기중'}
        {status === 'accepted' && '제작중(수락)'}
        {status === 'received' && '제작중(재료 수령)'}
        {status === 'produced' && '제작중(제작 완료)'}
        {status === 'deliver' && '배송중'}
        {status === 'end' && '거래 완료'}
        {status === 'rejected' && '거절됨'}
        {!status && '상태 없음'}
      </StatusText>
  );
};

// OrderInfoBox 컴포넌트
const OrderInfoBox = ({ order }: any) => {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isSubmitModalVisible, setSubmitModalVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState('택배사 선택');
  const [isDeliverySubmitted, setDeliverySubmitted] = useState(false);
  const [orderStatus, setOrderStatus] = useState(order.order_status);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [steps, setSteps] = useState([false, false,false,false]);
  const transactionUuid = order.transaction_uuid;

  const courierOptions = ['CJ 대한통운', '우체국택배', '한진택배', '롯데택배'];

  useEffect(() => {
        if (orderStatus === 'accepted'){
            setSteps([false, false, false, false]);
         return;
        }

     setSteps((prevSteps) => [
       prevSteps[0] || orderStatus !== 'accepted' && orderStatus === 'received',
       prevSteps[1] || orderStatus === 'received' || orderStatus === 'produced' || orderStatus === 'deliver',
       prevSteps[2] || orderStatus === 'produced' || orderStatus === 'deliver',
       prevSteps[3] || orderStatus === 'deliver',
     ]);
  }, [orderStatus]);

  // 체크박스 상태를 저장
  const saveStepState = async (order_uuid: string, steps: boolean[]) => {
    try {
      await AsyncStorage.setItem(`steps_${order_uuid}`, JSON.stringify(steps));
    } catch (error) {
      console.error("❌ 체크박스 상태 저장 실패:", error);
    }
  };

   // 체크박스 상태 받아오기
  const loadStepState = async (order_uuid: string, setSteps: (steps: boolean[]) => void) => {
    try {
      const savedSteps = await AsyncStorage.getItem(`steps_${order_uuid}`);
      if (savedSteps) {
        setSteps(JSON.parse(savedSteps));
      }
    } catch (error) {
      console.error("❌ 체크박스 상태 불러오기 실패:", error);
    }
  };


  const toggleModal = () => {
    setModalVisible(prevState => !prevState);
  };

  const toggleExpanded = () => setExpanded(!expanded);

  const toggleStep = async (index: number) => {
    const newSteps = [...steps];
    newSteps[index] = !newSteps[index];
    setSteps(newSteps);
    saveStepState(order.order_uuid, newSteps); // 상태 변경  저장

    if (index === 1 && newSteps[1]) {
      updateOrderStatus(order.order_uuid, 'received', setOrderStatus);
    } else if (index === 2 && newSteps[2]) {
      updateOrderStatus(order.order_uuid, 'produced', setOrderStatus);
    }
  };

  // 페이지가 처음 로드될 때 체크박스 상태 불러오기
  useEffect(() => {
    loadStepState(order.order_uuid, setSteps);
  }, []);

  const toggleSubmitModal = () => {
    setSubmitModalVisible(prevState => !prevState);
  };

  const confirmDelivery = () => setModalVisible(false);

  const handleConfirmModal = () => {
    setDeliverySubmitted(true);
    toggleModal();
  };


  const handleDeliverySubmit = async () => {
    if (!selectedCourier || selectedCourier === '택배사 선택' || !trackingNumber) {
      Alert.alert('❌ 오류', '택배사와 송장 번호를 입력해주세요.');
      return;
    }

    if (!transactionUuid) {
        Alert.alert('❌ 오류', '거래 정보가 없습니다.');
        return;
      }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        Alert.alert('❌ 오류', '로그인이 필요합니다.');
        return;
      }

      // API 요청 URL
     const transactionUuid = order.transaction?.transaction_uuid || null;


    console.log("📌 order.transaction:", order.transaction);
    console.log("📌 order.transaction_uuid:", transactionUuid);

      if (!transactionUuid) {
        console.warn("⚠️ 거래 정보 없음 - transaction_uuid가 없습니다.");
        return;
      }

      const url = `/api/orders/transactions/${transactionUuid}/delivery`;

      // API 요청 데이터
      const data = {
        delivery_company: selectedCourier,         // 선택한 택배사
        delivery_tracking_number: trackingNumber, // 입력한 송장 번호
      };

      console.log(`📌 배송 정보 업데이트 요청: ${url}`, data);

      const response = await Request().patch(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        Alert.alert('✅ 성공', '배송 정보가 업데이트되었습니다.');
              if (order.order_uuid) {
                updateOrderStatus(order.order_uuid, 'deliver', setOrderStatus);
              } else {
                console.error("❌ 오류: order_uuid가 존재하지 않습니다.");
              }

              setSubmitModalVisible(false);
              setDeliverySubmitted(true);
            } else {
              Alert.alert('❌ 오류', `서버 응답 실패: ${response.status}`);
            }
          } catch (error) {
            console.error('❌ 배송 정보 업데이트 실패:', error?.response?.data || error.message);
            Alert.alert(
              '❌ 오류',
              `배송 정보 업데이트 중 오류 발생\n${error?.response?.data?.message || error.message}`
            );
          }
        };


  console.log('Is Delivery Submitted:', isDeliverySubmitted);

  //수정 버튼 핸들러
  const handleEdit = () => {
    console.log('Is Delivery Submitted before:', isDeliverySubmitted); // 상태 변경 전 확인
    setDeliverySubmitted(false); // 상태 초기화
  };

  const calculateHeight = (steps: any) => {
    if (!steps || steps.length === 0) return 0;
    return (steps.filter(Boolean).length) * (100 / (steps.length - 1)) || 0;
  };

  return (
    <OrderInfoContainer>
      <TopSection>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <OrderID>{order.order_uuid}</OrderID>
        <OrderStatusLabel order_status={order.order_status} />
        </View>
        <ContentRow>
          <ImageContainer  source={{ uri: order.images?.find(img => img.image_type === 'order')?.image || '' }} />
          <TextContainer>
            <Subtitle16B>{order.service_info?.service_title || '서비스명 없음'}</Subtitle16B>
            <Body14R>주문자: {order.orderer_information?.orderer_name || '익명'}</Body14R>
            <Body14R>주문 일시: {order.order_date}</Body14R>
            <Body14R>거래 방식:{order.transaction?.transaction_option === '비대면' ? '비대면' : '대면'}</Body14R>
          </TextContainer>
        </ContentRow>
        <TouchableOpacity
          style={{ marginTop: 10, alignSelf: 'flex-end' }}
          onPress={() => navigation.navigate('QuotationPage')}
        >
          <Text style={{ color: 'gray', fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' }}>
            주문서확인
          </Text>
        </TouchableOpacity>

      </TopSection>

      {expanded && (
        <ExpandedContent>
          <FlowContainer>
            <FlowLine stepCount={4}>
              <CompletedFlowLine steps={steps} stepCount={4} height={calculateHeight(steps)} />
              {Array(4).fill(null).map((_, index) => (
                <Circle
                  key={`circle-${index}`}
                  index={index}
                  completed={steps[index]}
                  stepCount={steps.length}
                />
              ))}
            </FlowLine>

            <StepContainer>
              {["입금 확인", "재료 수령 완료", "제작 완료", "배송 정보 입력"].map((stepLabel, index) => (
                <StepRow key={index}>
                  <Body16R>{stepLabel}</Body16R>
                  {index < 3 && (
                    <CheckBoxWrapper>

                      <TouchableOpacity
                        style={[
                          styles.checkBox,
                          isDeliverySubmitted && styles.disabledCheckBox,
                        ]}
                        disabled={isDeliverySubmitted}
                        onPress={() => toggleStep(index)}
                      >
                        <View
                          style={[
                            styles.checkBoxIndicator,
                            steps[index] && styles.checked,
                            isDeliverySubmitted && styles.disabledCheckBoxIndicator,
                          ]}
                        />
                      </TouchableOpacity>

                    </CheckBoxWrapper>
                  )}
                </StepRow>
              ))}
            </StepContainer>
          </FlowContainer>

          {!isDeliverySubmitted && (
            <DropdownContainer>

              <DropdownButton
                onPress={() => setShowDropdown(!showDropdown)}
                disabled={isDeliverySubmitted || !steps[2]} // 전달 완료 시 비활성화
              >
                <Text style={[styles.dropdownButtonText, { color: isDeliverySubmitted ? 'gray' : 'black' }]}>
                  {selectedCourier}
                </Text>
                <DropDownIcon width={20} height={20} />
              </DropdownButton>

              {showDropdown && (
                <Modal isVisible={showDropdown} onBackdropPress={() => setShowDropdown(false)}>
                  <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 10 }}>
                    {courierOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setSelectedCourier(option);
                          setShowDropdown(false);
                        }}
                      >
                        <Text style={styles.optionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Modal>
              )}

            </DropdownContainer>
          )}

          <TrackingNumberContainer>
            <TextInput
              placeholder="송장 번호 입력"
              editable={!isDeliverySubmitted && steps[2]} //전달완료 시 비활성화
              value={trackingNumber}
              onChangeText={(text) => setTrackingNumber(text)}
              style={{
                borderColor: isDeliverySubmitted || !steps[2] ? LIGHTGRAY : PURPLE,
                borderWidth: 1,
                borderRadius: 4,
                flex: 0,
                paddingHorizontal: 10,
                backgroundColor: isDeliverySubmitted ? LIGHTGRAY : 'white',
              }}
            />
            {!isDeliverySubmitted && (
              <TouchableOpacity
                style={{
                  backgroundColor: steps[2] ? PURPLE : LIGHTGRAY,
                  borderRadius: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  marginLeft: 10,
                  marginTop: 10,
                  height: 30,
                }}
                disabled={isDeliverySubmitted || !steps[2]} // 전달 완료 시 버튼 비활성화
                onPress={toggleModal}
              >
                <Text style={{ color: 'white' }}>확인</Text>
              </TouchableOpacity>
            )}
          </TrackingNumberContainer>

          <TrackingNumberContainer>
            <SubmitButton
              onPress={isDeliverySubmitted ? undefined : toggleSubmitModal}
              style={{
                backgroundColor: isDeliverySubmitted ? LIGHTGRAY : PURPLE,
              }}
            >
              <SubmitButtonText style={{ color: isDeliverySubmitted ? 'gray' : 'white' }}>
                전달 완료
              </SubmitButtonText>
            </SubmitButton>

            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                borderColor: PURPLE,
                borderRadius: 4,
                paddingHorizontal: 10,
                paddingVertical: 5,
                marginLeft: 10,
                marginTop: 10,
                height: 30,
              }}
              disabled={!steps[2]}
              onPress={handleEdit}
            >
              <Text style={{ color: PURPLE }}>수정</Text>
            </TouchableOpacity>
          </TrackingNumberContainer>





          <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
            <View style={styles.modalContainer}>
              {/* 상단 텍스트 */}
              <Subtitle16B style={{ textAlign: 'center', marginBottom: 10 }}>입력한 배송 정보가 정확한지 {'\n'}확인하셨나요?</Subtitle16B>
              <Text style={{ textAlign: 'center', marginBottom: 15 }}>확인 후 '전달완료' 버튼을 누르면 업시러에게 배송 정보가 표시됩니다.</Text>

              {/* 버튼 영역 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleConfirmModal} >
                  <Text style={[styles.buttonText, { fontWeight: 'bold' }]}>확인</Text>
                </TouchableOpacity>

                {/* 구분선 추가 */}
                <View style={styles.separator} />

                <TouchableOpacity onPress={toggleModal} >
                  <Text style={[styles.buttonText, { fontWeight: 'bold' }, { color: '#FF5F5F' }]}>취소</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* 전달완료 모달 */}
          <Modal isVisible={isSubmitModalVisible} onBackdropPress={toggleModal}>
            <View style={styles.modalContainer}>
              {/* 상단 텍스트 */}
              <Subtitle16B style={{ textAlign: 'center', marginBottom: 10 }}>전달 완료 하시겠습니까?</Subtitle16B>
              <Text style={{ textAlign: 'center', marginBottom: 15 }}>전달 완료 후, 업시러가 ‘거래 완료’ 버튼을 누르면 거래가 완료됩니다.</Text>

              {/* 버튼 및 구분선 영역 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleDeliverySubmit}>
                  <Text style={[styles.buttonText, { fontWeight: 'bold' }]}>확인</Text>
                </TouchableOpacity>

                {/* 구분선 추가 (검은 가로선) */}
                <View style={styles.separator} />

                <TouchableOpacity onPress={toggleSubmitModal}>
                  <Text style={[styles.buttonText, { fontWeight: 'bold' }, { color: '#FF5F5F' }]}>취소</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </ExpandedContent>
      )
     }


      <TouchableOpacity onPress={toggleExpanded} style={styles.centerIconContainer}>
        {expanded ? <UpArrowIcon width={40} height={40} /> : <DropDownIcon width={40} height={40} />}
      </TouchableOpacity>

            <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
              <View style={styles.modalContainer}>
                <Subtitle16B style={{ textAlign: 'center', marginBottom: 10 }}>
                  입력한 배송 정보가 정확한지 {'\n'}확인하셨나요?
                </Subtitle16B>
                <Text style={{ textAlign: 'center', marginBottom: 15 }}>
                  확인 후 '전달완료' 버튼을 누르면 업시러에게 배송 정보가 표시됩니다.
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity onPress={toggleModal}>
                    <Text style={[styles.buttonText, { fontWeight: 'bold' }]}>확인</Text>
                  </TouchableOpacity>
                  <View style={styles.separator} />
                  <TouchableOpacity onPress={toggleModal}>
                    <Text style={[styles.buttonText, { fontWeight: 'bold' }, { color: '#FF5F5F' }]}>취소</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

    </OrderInfoContainer>
  );
};

// InProgressOrders 컴포넌트
const InProgressOrders = () => {
  const [filter, setFilter] = useState('asc'); // 최신순/오래된순 필터
  const [orders, setOrders] = useState([]); // 주문 데이터 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const request = Request();


  // 📌 API 요청: 진행 중인 주문 목록 불러오기
    const fetchOrders = async () => {
        setLoading(true);
        try {
          const accessToken = await getAccessToken();
          if (!accessToken) {
            Alert.alert('❌ 오류', '로그인이 필요합니다.');
            return;
          }


      const statuses = ['accepted', 'received', 'produced', 'deliver']; // 요청할 상태 리스트
      const requests = statuses.map(status => {
        const url = `/api/orders?type=reformer&status=${status}`;

        return request.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(error => {
          console.error(`❌ ${status} 요청 실패:`, error.response ? error.response.data : error.message);
          return null; // 실패한 요청은 null 처리
        });
      });


      const responses = await Promise.all(requests);

      // 응답 데이터 합치기
      const allOrders = responses
            .filter(response => response && response.status === 200 && Array.isArray(response.data))
            .flatMap(response => response.data)
            .map(order => ({
              ...order,
              transaction_uuid: order.transaction?.transaction_uuid || null,
            }));


      console.log('✅ 필터링된 주문 목록:', allOrders);

      setOrders(allOrders);

    } catch (error) {
      console.error('❌ 진행 중인 주문 API 호출 실패:', error);
      Alert.alert('❌ 주문 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };


  // 화면이 다시 활성화될 때마다 주문 목록 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const handleOpenChat = () => {
    // console.log('오픈채팅 바로가기');
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LIGHTGRAY }}>
      <OrderFilter filter={filter} setFilter={setFilter} onOpenChat={handleOpenChat} />

      {loading ? (
              <ActivityIndicator size="large" color="#6200EE" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                nestedScrollEnabled={true}
                data={orders}
                keyExtractor={(item, index) => item.order_uuid || index.toString()}
                renderItem={({ item: order }) => <OrderInfoBox order={order} />}
              />
            )}

    </SafeAreaView>
  );
};

// 스타일 정의

const FilterContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${LIGHTGRAY};
  padding: 10px;
  border-bottom-width: 1px;
  border-bottom-color: ${LIGHTGRAY};
`;

const PickerWrapper = styled.View`
  background-color: white;
  width: 150px;
  height:40px;
  border-radius: 30px;
  border-width: 1px;
  border-color: ${PURPLE};
  justify-content: center;
  align-items: center;
`;

const OpenChatButton = styled.TouchableOpacity`
  background-color: white;
  padding: 10px 15px;
  border-radius: 30px;
`;

const OrderInfoContainer = styled.View`
  flex-direction: column;
  border-radius: 12px;
  border-width: 1px;
  border-color: #ddd;
  margin: 10px;
  background-color: #fff;
`;

const TopSection = styled.View`
  padding: 15px;
  background-color: white;
  border-radius: 12px;
`;

const OrderID = styled.Text`
  font-size: 14px;
  color: black;
  margin-bottom: 10px;
`;



const StatusText = styled.Text`
  color: ${PURPLE};
  font-size: 12px;
  font-weight: bold;
  text-align: center;
`;
const ContentRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ImageContainer = styled.Image`
  width: 108px;
  height: 108px;
  border-radius: 8px;
  margin-right: 15px;
`;

const TextContainer = styled.View`
  flex: 1;
  justify-content: center;
`;

const ExpandedContent = styled.View`
  margin-top: 10px;
  width: 100%;
  align-items: center;
  background-color: #F5F5F5;
`;

const FlowContainer = styled.View`
  flex-direction: row;
  align-items: flex-start;
`;

const FlowLine = styled.View`
  width: 2px;
  background-color: ${LIGHTGRAY};
  margin-left: 50px;
  margin-right: 10px;
  position: relative;
  height: ${(props) => (props.stepCount ? (props.stepCount - 1) * 60 : 0)}px;

`;

const CompletedFlowLine = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  background-color: ${PURPLE};
  height: ${(props) => (typeof props.height === 'number' ? `${props.height}%` : '0%')};
`;

const Circle = styled.View<{ completed: boolean; index: number; stepCount: number }>`
  position: absolute;
  left: -5px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${({ completed }) => (completed ? PURPLE : LIGHTGRAY)};
  ${({ index, stepCount }) => `
    top: ${(index / (stepCount - 1)) * 100}%;
  `}
`;


const StepContainer = styled.View`
  flex: 1;
`;

const StepRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 30px;
  margin-bottom: 33px;
`;

const DropdownContainer = styled.View`
  width: 188px;
  height: 30px;
  background-color: #F5F5F5;
  margin-top: 10px;
  align-self: center;
  position: relative;
`;

const DropdownList = styled.View`
  border: 1px solid ${PURPLE};
  border-radius: 4px;
  margin-top: 5px;
  background-color:  ${LIGHTGRAY};
  z-index: 999;
  position: absolute;
  top:40px;
`;
const TrackingNumberContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  justify-content: center;
  width:100%;
`;
const TextInput = styled.TextInput`
  width: 188px;
  max-width: 188px;
  height: 30px;
  padding: 0 10px;
  margin-top: 10px;
  border-width: 1px;
  border-color: ${PURPLE};
  border-radius: 4px;
  align-self: center;
  margin-left: 55px;

`;
const SubmitButton = styled.TouchableOpacity`
  background-color: ${PURPLE};
  border-radius: 8px;
  padding: 0 20px;
  width: 116px;
  height: 33px;
  align-items: center;
  margin-top: 15px;
  margin-left: 55px;
`;

const SubmitButtonText = styled.Text`
  color: white;
  font-size: 16px;

`;
const CheckBoxWrapper = styled.View`
  position: absolute;
  right: 50px;
`;


const DropdownButton = styled(TouchableOpacity).attrs<{ disabled?: boolean }>((props) => ({
  disabled: props.disabled,
}))`
  width: 188px;
  height: 30px;
  border-width: 1px;
  border-radius: 4px;
  justify-content: center;
  padding: 0 10px;
  flex-direction: row;
  align-items: center;
  border-color: ${(props) => (props.disabled ? LIGHTGRAY : PURPLE)};
  background-color: ${(props) => (props.disabled ? LIGHTGRAY : 'white')};
`;







const styles = StyleSheet.create({
  filterPicker: {
    borderRadius: 12,
    borderColor: PURPLE,
    backgroundColor: 'transparent',
    paddingRight: 5,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },


  dropdownButtonText: {
    flex: 1,
  },
  optionText: {
    fontSize: 14,
    color: 'black',
  },
  checkBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  disabledCheckBox: {
    borderColor: LIGHTGRAY,
    backgroundColor: LIGHTGRAY,
  },
  checkBoxIndicator: {
    width: 10,
    height: 10,
    backgroundColor: 'white',
  },
  checked: {
    backgroundColor: PURPLE,
  },
  disabledCheckBoxIndicator: {
    backgroundColor: LIGHTGRAY,
  },
  centerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
  },
  confirmButton: {
    backgroundColor: PURPLE,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 14,
    //fontWeight:'400',
  },
  separator: {
    width: 250,
    height: 1,
    backgroundColor: 'black',
    marginTop: 20,
    marginBottom: 20,
  },



});

export default InProgressOrders;