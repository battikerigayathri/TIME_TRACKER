import Fakerator from "fakerator";

export const getRandomNumber = () => {
  const fakerator = Fakerator();
  const number = fakerator.random.number(11, 99);
  return "1" + number;
};

export const getServiceRequestNumber = () => {
  return "P" + getRandomNumber(); 
};
