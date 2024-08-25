export const createObject = (data) => {
  let result = {};

  for (const key in data) {
    if (key !== "id" && data[key]) {
      result[key] = data[key];
    }
  }
  return result;
};
