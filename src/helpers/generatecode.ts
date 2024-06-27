import Fakerator from "fakerator";

export const getRandomNumber = () => {
  const fakerator = Fakerator();
  const number = fakerator.random.number(11, 99);
  return "1" + number;
};

export const getServiceRequestNumber = () => {
  return "P" + getRandomNumber(); /// issue with single function sending custom msg inside params (getting same number)
};
