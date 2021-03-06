import React from 'react';
import { chunk as _chunk, map as _map, sample as _sample } from 'lodash';
import styled from 'styled-components';
import { BingoTable } from 'typing';
import { RootState } from 'store/reducer';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import bind from 'bind-decorator';
import Alert from 'components/Alert';
import COLOR from 'colors';
import { selectNumber } from 'store/gameStatus/actions';

interface PlayerPropsFromState {

}

interface PlayerPropsFromDispatch {
  onSelectNumber: (num: number) => any;
}

interface PlayerProps extends PlayerPropsFromState, PlayerPropsFromDispatch {
  isActive: boolean;
  name: string;
  table: BingoTable|null[];
  matchedIndexList: number[][];
}

interface PlayerState {
  isAlertVisible: boolean;
}

const Container = styled.div<{disabled: boolean}>`
  ${({ disabled }) => disabled && `
    * {
      opacity: 0.7;
    }

    td {
      cursor: not-allowed;
    }
  `}
`;

const PlayerName = styled.h2<{highlight: boolean}>`
  margin-bottom: 10px;

  ${({ highlight }) => highlight && `color: ${COLOR.primary};`}
`;

const TableContainer = styled.div<{highlight: boolean}>`
  border-radius: 5px;
  overflow: hidden;
  ${({ highlight }) => highlight && `border: solid 1px ${COLOR.primaryLight};`}
`;

const Table = styled.table`
  border-collapse: collapse;
`;

const Td = styled.td<{selected: boolean, disabled: boolean}>`
  width: 50px;
  height: 50px;
  border: solid 1px #eeeeee;
  padding: 12px;
  text-align: center;
  transition: background-color ease-out 0.2s;

  ${({ selected }) => selected && `color: ${COLOR.primary}` }
  ${({ disabled }) => disabled ? 'cursor: not-allowed;' : `
    cursor: pointer;

    &:hover {
      border: 0;
      background-color: ${COLOR.primaryLighter};
    }
  `}
`;

const CompleteCollectionContainer = styled.div`
  margin-top: 30px;
`;

class Player extends React.Component<PlayerProps, PlayerState> {
  state: PlayerState = {
    isAlertVisible: false,
  };

  /**
   * 번호를 눌렀을 때 처리 함수를 만드는 함수
   * @param num
   */
  private makeTdClickHandler(num: number) {
    return () => {
      this.props.onSelectNumber(num);
    };
  }

  /**
   * 잘못된 때에 번호를 눌렀을 때 처리 함수
   */
  @bind
  private handleTdErrorClick() {
    const { isActive, table } = this.props;
    if (_sample(table) !== null && !isActive) {
      this.setState({
        isAlertVisible: true,
      });
    }
  }

  /**
   * 알림을 확인했을 때 처리 함수
   */
  @bind
  private handleAlertConfirm() {
    this.setState({
      isAlertVisible: false,
    });
  }

  /**
   * 보드판 행, 열을 렌더링합니다.
   */
  private renderTableRows() {
    const { isActive, table } = this.props;

    return _map(
      _chunk(table, 5),
      (row, rowIndex) => {
        const entityList = _map(row, (entity, columnIndex) => {
          if (entity === null) {
            return (
              <Td
                key={`${rowIndex}-${columnIndex}`}
                disabled={true}
                selected={false}
              />
            );
          }

          const selectable = isActive && !entity.isSelected;
          const onClickHandler = selectable
            ? this.makeTdClickHandler(entity.key)
            : this.handleTdErrorClick;

          return (
            <Td
              key={`${rowIndex}-${columnIndex}`}
              disabled={!selectable}
              selected={entity.isSelected}
              onClick={onClickHandler}
            >
              {entity.key}
            </Td>
          );
        });

        return (
          <tr key={row.join('-') + rowIndex}>
            {entityList}
          </tr>
        );
      },
    );
  }

  /**
   * 빙고 맞춘 조합 목록을 렌더링합니다.
   */
  private renderMatchedCombinationList() {
    const { table, matchedIndexList } = this.props;

    return _map(
      _map(
        matchedIndexList,
        combination => _map(combination, (index) => {
          const entity = table[index];
          return entity !== null ? entity.key : null;
        }),
      ),
      (combination, index) => (
        <div key={combination.join('-') + index}>
          {combination.join(', ')}
        </div>
      ),
    );
  }

  public render() {
    const { isActive, name } = this.props;
    const { isAlertVisible } = this.state;

    return (
      <Container disabled={!isActive}>
        <PlayerName highlight={isActive}>
          {name}
        </PlayerName>

        <TableContainer highlight={isActive}>
          <Table>
            <tbody>
              {this.renderTableRows()}
            </tbody>
          </Table>
        </TableContainer>

        <CompleteCollectionContainer>
          <div>빙고 조합</div>
          <div>
            {this.renderMatchedCombinationList()}
          </div>
        </CompleteCollectionContainer>

        <Alert
          isVisible={isAlertVisible}
          message="잘못된 차례입니다."
          onConfirm={this.handleAlertConfirm}
        />
      </Container>
    );
  }
}

function mapStateToProps(state: RootState): PlayerPropsFromState {
  return {

  };
}

function mapDispatchToProps(dispatch: Dispatch): PlayerPropsFromDispatch {
  return {
    onSelectNumber: num => dispatch(selectNumber(num)),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default withConnect(Player);
