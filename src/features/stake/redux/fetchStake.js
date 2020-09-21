import { useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import {
  VAULT_FETCH_DEPOSIT_BEGIN,
  VAULT_FETCH_DEPOSIT_SUCCESS,
  VAULT_FETCH_DEPOSIT_FAILURE,
} from './constants';
import { fetchGasPrice } from "../../web3";

export function fetchDeposit(pool, amount) {
  return async (dispatch, getState) => {
    // optionally you can have getState as the second argument
    dispatch({
      type: VAULT_FETCH_DEPOSIT_BEGIN,
      index
    });

    const { home, stake } = getState();
    const { address, web3 } = home;
    const { pools } = stake;
    const gasPrice = fetchGasPrice();

    const contract = new web3.eth.Contract(erc20ABI, tokenAddress);
    contract.methods.stake(amount).send({ from: address, gasPrice });

    // Return a promise so that you could control UI flow without states in the store.
    // For example: after submit a form, you need to redirect the page to another when succeeds or show some errors message if fails.
    // It's hard to use state to manage it, but returning a promise allows you to easily achieve it.
    // e.g.: handleSubmit() { this.props.actions.submitForm(data).then(()=> {}).catch(() => {}); }
    const promise = new Promise((resolve, reject) => {
      // doRequest is a placeholder Promise. You should replace it with your own logic.
      // See the real-word example at:  https://github.com/supnate/rekit/blob/master/src/features/home/redux/fetchRedditReactjsList.js
      // args.error here is only for test coverage purpose.
      
      deposit({ web3, address, isAll, amount, contractAddress }).then(
        data => {
          dispatch({
            type: VAULT_FETCH_DEPOSIT_SUCCESS,
            data, index
          });
          resolve(data);
        },
      ).catch(
        // Use rejectHandler as the second argument so that render errors won't be caught.
        error => {
          dispatch({
            type: VAULT_FETCH_DEPOSIT_FAILURE,
            index
          });
          reject(error.message || error);
        }
      )
    });
    return promise;
  };
}

export function useFetchDeposit() {
  // args: false value or array
  // if array, means args passed to the action creator
  const dispatch = useDispatch();

  const { fetchDepositPending } = useSelector(
    state => ({
      fetchDepositPending: state.vault.fetchDepositPending,
    }),
    shallowEqual,
  );

  const boundAction = useCallback(
    (data) => {
      return dispatch(fetchDeposit(data));
    },
    [dispatch],
  );

  const boundAction2 = useCallback(
    (data) => {
      return dispatch(fetchDepositEth(data));
    },
    [dispatch],
  );

  return {
    fetchDeposit: boundAction,
    fetchDepositEth: boundAction2,
    fetchDepositPending
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case VAULT_FETCH_DEPOSIT_BEGIN:
      // Just after a request is sent
      return {
        ...state,
        fetchDepositPending: {
          ...state.fetchDepositPending,
          [action.index]: true
        },
      };

    case VAULT_FETCH_DEPOSIT_SUCCESS:
      // The request is success
      return {
        ...state,
        fetchDepositPending: {
          ...state.fetchDepositPending,
          [action.index]: false
        },
      };

    case VAULT_FETCH_DEPOSIT_FAILURE:
      // The request is failed
      return {
        ...state,
        fetchDepositPending: {
          ...state.fetchDepositPending,
          [action.index]: false
        },
      };

    default:
      return state;
  }
}