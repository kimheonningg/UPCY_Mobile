import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { StyleFilterButton } from './components/StyleFilterButton';
import styled from 'styled-components/native';
import DropDown from '../../assets/common/DropDown.svg';
import HomeStyleFilterModal from './components/HomeStyleFilterModal';
import FilterOptionModal from './components/FilterOptionModal';

const CategoryBox = styled.View`
  z-index: 1000;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  height: 52px;
  padding: 12px 16px;
  background: #fff;
`;

interface SignupProps {
  mail: string;
  domain: string;
  password: string;
  region: string;
} // 의미 없음

export type SelectedOptionProps =
  // | '추천순'
  // | '인기순'
  '최신순' | '가격순' | '판매순';

export const selectOptionDropdown: SelectedOptionProps[] = [
  // '추천순',
  // '인기순',
  '최신순',
  '가격순',
  '판매순',
] as SelectedOptionProps[];

export const stylesList: string[] = [
  '빈티지',
  '미니멀',
  '캐주얼',
  '페미닌',
  '글램',
  '스트릿',
  '키치',
  '스포티',
  '홈웨어',
  '걸리시',
] as string[];

interface HomeTabViewProps {
  selectedTab: 'Goods' | 'Market' | 'temp';
  setSelectedFilterOption?: (
    selectedFilterOption: SelectedOptionProps | undefined,
  ) => void;
  selectedStylesList: string[];
  setSelectedStylesList: (selectedStylesList: string[]) => void;
}

const HomeTabView = ({
  selectedTab,
  setSelectedFilterOption, // selected filter (right button) option
  selectedStylesList, // selected styles (left button)
  setSelectedStylesList, // selected styles (left button)
}: HomeTabViewProps) => {
  const [form, setForm] = useState<SignupProps>({
    mail: '',
    domain: '',
    password: '',
    region: '',
  });
  const [styleFilterOpen, setStyleFilterOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<SelectedOptionProps>(
    selectOptionDropdown[0],
  );

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useFocusEffect(
    useCallback(() => {
      setStyleFilterOpen(false);
    }, []),
  );

  useEffect(() => {
    if (selectedOption) {
      setSelectedFilterOption?.(selectedOption);
    }
  }, [selectedOption, setSelectedFilterOption]);

  return (
    <View>
      <CategoryBox>
        {selectedTab === 'Goods' && (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <StyleFilterButton
                onPressStyleFilterButton={setStyleFilterOpen}
              />
              {styleFilterOpen && (
                <HomeStyleFilterModal
                  list={selectedStylesList ?? stylesList}
                  styleFilterOpen={styleFilterOpen}
                  setStyleFilterOpen={setStyleFilterOpen}
                  setPressedStyles={setSelectedStylesList}
                />
              )}
            </View>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                onPress={toggleDropdown}
                style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedOption}</Text>
                <DropDown />
              </TouchableOpacity>
              {dropdownOpen && (
                <FilterOptionModal
                  open={dropdownOpen}
                  setOpen={setDropdownOpen}
                  setSelectedOption={setSelectedOption}
                />
              )}
            </View>
          </View>
        )}
      </CategoryBox>
    </View>
  );
};

export default HomeTabView;

const styles = StyleSheet.create({
  selectItem: {
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 15,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24,
    marginRight: 5,
    color: '#000',
  },
  dropdownMenu: {
    alignItems: 'center',
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    zIndex: 1000,
    width: 100,
    elevation: 5,
  },
  dropdownOption: {
    padding: 10,
  },
  dropdownSelectedOptionText: {
    fontFamily: 'Pretendard Variable',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24,
    color: '#000',
  },
  dropdownOptionText: {
    fontFamily: 'Pretendard Variable',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 16,
  },
});
