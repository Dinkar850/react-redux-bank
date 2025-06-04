import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

//directly mutable state converted to immmutable state using Immer library
const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    deposit(state, action) {
      state.balance += action.payload;
    },
    withdraw(state, action) {
      state.balance -= action.payload;
    },
    requestLoan: {
      //as payload can only receive one argument, we need to prepare the payload before passing it into the reducer
      prepare(amount, purpose) {
        return {
          payload: { amount, purpose },
        };
      },
      reducer(state, action) {
        if (state.loan > 0) return;
        state.loan = action.payload.amount;
        state.balance += state.loan;
        state.loanPurpose = action.payload.purpose;
      },
    },
    payLoan(state) {
      state.balance -= state.loan;
      state.loanPurpose = "";
      state.loan = 0;
    },
  },
});

export const deposit = (amount, currency) => {
  if (currency === "USD") return { type: "account/deposit", payload: amount };

  //function returned by the dispatch means it goes to the middleware thunk

  return async function (dispatch, getState) {
    dispatch({ type: "account/convertingCurrency" });
    //api call
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?amount=${amount}&from=${currency}&to=USD`
    );
    const data = await res.json();
    // console.log(data);
    const converted = data.rates.USD;
    dispatch({ type: "account/deposit", payload: converted });
  };
};

export const { withdraw, requestLoan, payLoan } = accountSlice.actions; //auto action creators
export default accountSlice.reducer; //auto reducer

// classical redux slice:

// reducer

// const accountReducer = (state = initialStateAccount, action) => {
//   switch (action.type) {
//     case "account/deposit":
//       return {
//         ...state,
//         balance: state.balance + action.payload,
//         isLoading: false,
//       };
//     case "account/withdraw":
//       return { ...state, balance: state.balance - action.payload };
//     case "account/requestLoan":
//       if (state.loan > 0) return state;
//       //later
//       return {
//         ...state,
//         balance: state.balance + action.payload.amount,
//         loan: action.payload.amount,
//         loanPurpose: action.payload.purpose,
//       };
//     case "account/payLoan":
//       return {
//         ...state,
//         balance: state.balance - state.loan,
//         loan: 0,
//         loanPurpose: "",
//       };
//     case "account/convertingCurrency":
//       return { ...state, isLoading: true };

//     default:
//       return state;
//   }
// };

//action creators
// export const deposit = (amount, currency) => {
//   if (currency === "USD") return { type: "account/deposit", payload: amount };

//   //function returned by the dispatch means it goes to the middleware thunk

//   return async function (dispatch, getState) {
//     dispatch({ type: "account/convertingCurrency" });
//     //api call
//     const res = await fetch(
//       `https://api.frankfurter.dev/v1/latest?amount=${amount}&from=${currency}&to=USD`
//     );
//     const data = await res.json();
//     // console.log(data);
//     const converted = data.rates.USD;
//     dispatch({ type: "account/deposit", payload: converted });
//   };
// };
// export const withdraw = (amount) => {
//   return { type: "account/withdraw", payload: amount };
// };
// export const requestLoan = (amount, purpose) => {
//   return { type: "account/requestLoan", payload: { amount, purpose } };
// };
// export const payLoan = () => {
//   return { type: "account/payLoan" };
// };

//export default accountReducer;
