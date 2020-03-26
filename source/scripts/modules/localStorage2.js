export default {
  set: (_key, value, expiryDate) => {
    const key = 'ls2-' + _key;
    const item = {
      value: value,
      expiry: expiryDate ? expiryDate.getTime() : 0,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  get: (_key) => {
    const key = 'ls2-' + _key;
    const itemStr = localStorage.getItem(key);

    if (!itemStr) {
      return null;
    }

    const itemObj = JSON.parse(itemStr);
    const now = new Date();

    if (itemObj.expiry > 0 && now.getTime() > itemObj.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return itemObj.value;
  },
};
